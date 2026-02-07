
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
    // 3. Vercel
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
      match_threshold: 0.0,
      match_count: 6, 
    });

    if (error) {
        console.error("[RAG] Supabase Error:", error);
        throw error;
    }
    
    if (isDev) console.log(`[RAG] Retrieved ${documents?.length} documents.`);

    // 3. Context Construction
    const contextText = documents
      ?.map((doc: any) => {
          // If it's a project (has title/category), add date info if available
          // Assuming the rpc returns the full record including new columns
          const dateInfo = doc.year ? ` (${doc.month || ''} ${doc.year})` : '';
          return `${doc.content}${dateInfo}`;
      })
      .join("\n---\n") || "No relevant context found.";

    // 4. Model Initialization
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash-lite", 
      streaming: true,
      apiKey: process.env.GOOGLE_API_KEY,
    });

    // 5. Chain Construction
    const prompt = PromptTemplate.fromTemplate(`
    ### ROLE & OBJECTIVE
    You are the AI Assistant for a Portfolio Website.
    Current Date: {current_date}
    Your goal is to answer questions about the portfolio owner based STRICTLY on the provided Context.

    ### UI ACTION TAGS
    If the user asks to "see", "show", or "visualize" a section, or if your answer heavily relies on specific evidence, you MUST append EXACTLY ONE of the following tags to the end of your response.

    [SHOW_PROJECTS] -> Show all projects.
    [SHOW_PROJECTS:keyword] -> Show projects matching "keyword" (e.g. [SHOW_PROJECTS:React]).
    [SHOW_EXPERIENCE] -> Show Work Experience card.
    [SHOW_EDUCATION] -> Show Education card.
    [SHOW_SKILLS] -> Show Skills deck.
    [SHOW_CONTACT] -> Show Contact card.
    [SHOW_ABOUT] -> Show About Me profile.
    [SHOW_ACHIEVEMENTS] -> Show Achievements card.
    [SHOW_CERTIFICATIONS] -> Show Certifications card.

    **Tag Rules:**
    1. Do NOT invent new tags.
    2. If multiple tags apply, choose the most specific one.

    ### CRITICAL CONSTRAINTS
    1. **No Hallucination:** Do NOT mention tools, skills, or experiences unless explicitly stated in the Context. If it's missing, treat it as unknown.
    2. **No Inferences:** Do not assume knowledge (e.g., do not assume "React" implies "Next.js" unless both are written).
    3. **No Percentages:** Do not mention skill levels (e.g., "80%", "Level 5"). Just state the skill.
    4. **Time Awareness:** Compare dates in Context to {current_date}.
      - If "Expected 2025" and today is 2026 -> Change tense to past (e.g., "graduated in 2025").
      - If "Present" and no end date -> Treat as active.

    ### RESPONSE LOGIC FLOW
    Follow this priority order to determine your response:

    1. **CHECK CHAT HISTORY**
      If user says "Yes", "Sure", or agrees to a previous offer -> Fulfill that offer immediately using General Knowledge or the relevant Tag.

    2. **CLASSIFY & ANSWER**

      **Type A: Capability Questions ("Do you know [Tech]?" / "What are your skills?")**
      - IF [Tech] is in Context: "Yes, I am proficient in [Tech]..." -> Append [SHOW_SKILLS]
      - IF [Tech] is NOT in Context: Go to "Type D (Pivot)".

      **Type B: Evidence Questions ("Show me [Tech] projects" / "Have you built with [Tech]?")**
      - IF Projects with [Tech] exist: "Here are my projects using [Tech]..." -> Append [SHOW_PROJECTS:Tech]
      - IF [Tech] is in Skills but NO Projects: "I know [Tech], but haven't highlighted specific projects with it. However, here is my skill set..." -> Append [SHOW_SKILLS]

      **Type C: Synthesis Questions ("Experience in [Field]?")**
      - Scan Projects, Work, Education, and Certifications for [Field].
      - Synthesize a comprehensive answer.
      - Append the most relevant tag (e.g., [SHOW_PROJECTS:Field] or [SHOW_EXPERIENCE]).
      - IF [Field] is completely missing: Go to "Type D (Pivot)".

      **Type D: The Pivot (Missing Info / Irrelevant Questions)**
      - **Scenario 1: Professional but Missing (e.g., "Do you know Vue?" when you only know Machine Learning)**
        - Polite Refusal: "That isn't part of my current portfolio."
        - The Pivot: Immediately mention a **strongest related skill** from Context.
        - Action: Append the relevant tag for the *existing* skill.
        - *Example:* "I don't have Vue experience, but I specialize in Machine Learning..." -> [SHOW_PROJECTS:Machine Learning]

      - **Scenario 2: Personal / Off-Topic (e.g., "How tall are you?")**
        - Acknowledge & Dismiss: "I don't have that information."
        - Pivot: "However, I can tell you about my expertise in [Key Skill from Context]."
        - Action: **Do NOT append tags.** Keep it text-only.

    ### INPUT DATA
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
