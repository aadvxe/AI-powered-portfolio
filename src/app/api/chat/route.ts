
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { supabase } from "@/lib/supabase";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

// In-memory rate limiting implementation
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

export async function POST(req: Request) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    if (!checkRateLimit(ip)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment." }), { status: 429 });
    }

    // Origin validation (CSRF protection)
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");
    
    // Origin Validation Policy:
    // 1. Localhost
    // 2. Production Site URL
    // 3. Vercel Preview/Production Domains
    const isLocalhost = origin?.includes("localhost") || referer?.includes("localhost");
    const isSiteUrl = (origin && process.env.NEXT_PUBLIC_SITE_URL && origin.includes(process.env.NEXT_PUBLIC_SITE_URL)) || 
                      (referer && process.env.NEXT_PUBLIC_SITE_URL && referer.includes(process.env.NEXT_PUBLIC_SITE_URL));
    const isVercel = origin?.endsWith(".vercel.app") || referer?.includes(".vercel.app");

    if (!isLocalhost && !isSiteUrl && !isVercel && !process.env.DISABLE_ORIGIN_CHECK) {
      console.error(`[Security] Blocked request from Origin: ${origin}, Referer: ${referer}`);
      return new Response(JSON.stringify({ error: "Unauthorized request origin" }), { status: 403 });
    }

    const { messages } = await req.json();
    
    // Input validation
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid request format" }), { status: 400 });
    }
    
    const currentMessage = messages[messages.length - 1]?.content;
    
    if (typeof currentMessage !== "string" || currentMessage.length === 0) {
      return new Response(JSON.stringify({ error: "Message content is required" }), { status: 400 });
    }
    
    if (currentMessage.length > 2000) {
      return new Response(JSON.stringify({ error: "Message too long (max 2000 characters)" }), { status: 400 });
    }

    // 1. Generate query embeddings
    const embeddings = new GoogleGenerativeAIEmbeddings({
        model: "models/gemini-embedding-001",
        taskType: TaskType.RETRIEVAL_QUERY,
        apiKey: process.env.GOOGLE_API_KEY
    });
    
    const vector = await embeddings.embedQuery(currentMessage);
    
    // Development logging
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) console.log(`[RAG] Vector: ${vector.length} dims`);

    // 2. RAG Retrieval
    const { data: documents, error } = await supabase.rpc("match_documents", {
      query_embedding: vector,
      match_threshold: 0.0, // Return EVERYTHING (Top K) regardless of score
      match_count: 8, 
    });

    if (error) {
        console.error("[RAG] Supabase Error:", error);
        throw error;
    }
    
    if (isDev) console.log(`[RAG] Retrieved ${documents?.length} documents.`);

    // 3. Context Construction
    const contextText = documents
      ?.map((doc: any) => doc.content)
      .join("\n---\n") || "No relevant context found.";

    // 4. Model Initialization
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash-lite", 
      streaming: true,
      apiKey: process.env.GOOGLE_API_KEY,
    });

    // 5. Chain Construction
    const prompt = PromptTemplate.fromTemplate(`
      You are the AI Assistant for a Portfolio Website.
      Today is {current_date}.
      Your goal is to answer questions about the portfolio owner based ONLY on the provided context.
      
      CRITICAL INSTRUCTION:
      If the user clearly asks to visualize or "see" the Projects, Skills, Contact, or About Me section, 
      YOU MUST append one of these exact tags to the end of your response:
      
      Supported Tags:
      1. [SHOW_PROJECTS] -> Shows ALL projects.
      2. [SHOW_PROJECTS:keyword] -> Shows only projects matching "keyword" (e.g. [SHOW_PROJECTS:React]).
      3. [SHOW_EXPERIENCE] -> Shows ONLY the Work Experience card.
      4. [SHOW_EDUCATION] -> Shows ONLY the Education card.
      5. [SHOW_SKILLS] -> Shows the Skills deck.
      6. [SHOW_CONTACT] -> Shows the Contact card.
      7. [SHOW_ABOUT] -> Shows the full About Me profile.
      8. [SHOW_ACHIEVEMENTS] -> Shows ONLY the Achievements card.
      9. [SHOW_CERTIFICATIONS] -> Shows ONLY the Certifications card.
      
      Examples:
      - "Show me your React projects" -> "... [SHOW_PROJECTS:React]"
      - "Where did you study?" -> "... [SHOW_EDUCATION]"
      - "Work history?" -> "... [SHOW_EXPERIENCE]"
      - "What awards did you win?" -> "... [SHOW_ACHIEVEMENTS]"
      
      Do NOT invent other tags.

      CRITICAL INTENT DISTINCTION:
      - QUESTION: "Do you know [Tech]?" or "What are your skills?" (CAPABILITY) 
        -> Use [SHOW_SKILLS]
        -> Example: "Yes, I am proficient in [Tech]..." [SHOW_SKILLS]
      
      - QUESTION: "Show me [Tech] projects" or "Have you built anything with [Tech]?" (EVIDENCE)
        -> Use [SHOW_PROJECTS:Tech]
        -> Example: "Here are my projects using [Tech]..." [SHOW_PROJECTS:Tech]
      
      If the answer is not in the context:
      1. CHECK CHAT HISTORY FIRST: If the user is agreeing ("yes", "sure") to your previous offer, DISREGARD strict context limits and fulfill the offer using your general knowledge or by showing the relevant section tag.
      2. OTHERWISE, CLASSIFY THE QUESTION:
         
         a. **Irrelevant / Personal / Non-Professional** (e.g. "What is your height?", "Who is the president?", "Capital of Jakarta?"):
            - You are a relentless professional advocate for the owner.
            - ACKNOWLEDGE the question briefly.
            - IMMEDIATELY PIVOT back to "I can tell you about...".
            - **CRITICAL**: Do NOT append any [SHOW_TAG]. Keep it text-only interactions to avoid clutter.
            - Example: "I'm not sure about the capital of Jakarta, but I can tell you about my experience in building scalable architectures or my work with IoT systems."

         b. **Professional / Technical** (e.g. "Do you know Vue?", "Experience with Ruby?", "Did you work at Google?"):
            - Start with "That's not something I've highlighted in my portfolio yet,"
            - Pivot to your strengths found in the Context.
            - **VARIETY RULE**: Do NOT always default to [SHOW_SKILLS].
              - If you can relate it to a project context -> Use [SHOW_PROJECTS]
              - If it is about a programming language/tool -> Use [SHOW_SKILLS]
            - Example 1: "...but I have built similar apps using React! Check these out:" [SHOW_PROJECTS]
            - Example 2: "...but I have deep experience in Python! Here is my tech stack:" [SHOW_SKILLS]
         
         CRITICAL FORMATTING RULES:
         - Do NOT mention percentage numbering (e.g. "80%", "Level 5"). Just mention the skill name.
         - If providing a list of Alternative Skills -> Append [SHOW_SKILLS]
         - If providing a list of Alternative Projects -> Append [SHOW_PROJECTS]
      
      Do not hallucinate facts.

      Chat History:
      {chat_history}
      
      Context:
      {context}
      
      Question: {question}
      
      Answer:
    `);

    const parser = new StringOutputParser();
    const chain = prompt.pipe(model).pipe(parser);
    
    // Format chat history
    const chatHistory = messages.slice(0, -1).map((m: any) => `${m.role}: ${m.content}`).join("\n");

    // 6. Stream Execution
    const stream = await chain.stream({
      chat_history: chatHistory,
      context: contextText,
      question: currentMessage,
      current_date: new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }),
    });

    return new Response(new ReadableStream({
        async start(controller) {
            for await (const chunk of stream) {
                controller.enqueue(new TextEncoder().encode(chunk));
            }
            controller.close();
        }
    }), {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
