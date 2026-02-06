
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { supabase } from "@/lib/supabase";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

// Simple in-memory rate limiting (per IP, resets on server restart)
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
    const allowedOrigins = [
      "http://localhost:3000",
      "https://localhost:3000",
      process.env.NEXT_PUBLIC_SITE_URL, // Add your production URL to .env.local
    ].filter(Boolean);
    
    const isValidOrigin = origin && allowedOrigins.some(allowed => origin.startsWith(allowed as string));
    const isValidReferer = referer && allowedOrigins.some(allowed => referer.startsWith(allowed as string));
    
    if (!isValidOrigin && !isValidReferer) {
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

    // 1. Embed the user's query REMOTE (Google AI)
    const embeddings = new GoogleGenerativeAIEmbeddings({
        model: "models/gemini-embedding-001",
        taskType: TaskType.RETRIEVAL_QUERY,
        apiKey: process.env.GOOGLE_API_KEY
    });
    
    const vector = await embeddings.embedQuery(currentMessage);
    
    // Debug logging (dev only)
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) console.log(`[RAG] Vector: ${vector.length} dims`);

    // 2. Search for relevant documents
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

    // 3. Construct Context
    const contextText = documents
      ?.map((doc: any) => doc.content)
      .join("\n---\n") || "No relevant context found.";

    // 4. Setup Gemini Chat Model
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash-lite", 
      streaming: true,
      apiKey: process.env.GOOGLE_API_KEY,
    });

    // 5. Create Chain
    const prompt = PromptTemplate.fromTemplate(`
      You are the AI Assistant for a Portfolio Website.
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
      
      Examples:
      - "Show me your React projects" -> "... [SHOW_PROJECTS:React]"
      - "Where did you study?" -> "... [SHOW_EDUCATION]"
      - "Work history?" -> "... [SHOW_EXPERIENCE]"
      - "What awards did you win?" -> "... [SHOW_ACHIEVEMENTS]"
      
      Do NOT invent other tags.
      
      If the answer is not in the context, politely say: "I couldn't find that specific detail in my knowledge base, but feel free to ask about my projects, skills, or experience!"
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

    // 6. Stream Response
    const stream = await chain.stream({
      chat_history: chatHistory,
      context: contextText,
      question: currentMessage,
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
