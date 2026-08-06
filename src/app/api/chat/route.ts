import { supabase } from "@/lib/supabase";

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

    const isDev = process.env.NODE_ENV !== 'production';

    // 1. Fetch documents directly from Supabase (Skipping vector embeddings)
    const { data: documents, error } = await supabase
      .from("documents")
      .select("content");

    if (error) {
      console.error("[Context] Supabase Error:", error);
      throw error;
    }
    
    if (isDev) console.log(`[Context] Retrieved ${documents?.length} documents from Supabase.`);

    // 2. Context Construction
    const contextText = documents
      ?.map((doc: any) => doc.content)
      .join("\n---\n") || "No relevant context found.";

    const currentDate = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });

    const systemPrompt = `
### ROLE & OBJECTIVE
You are the AI Assistant for a Portfolio Website.
Current Date: ${currentDate}
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
4. **Time Awareness:** Compare dates in Context to ${currentDate}.
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
Context:
${contextText}
`;

    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.content
      }))
    ];

    const deepseekRes = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: formattedMessages,
        temperature: 0.2,
        stream: true
      })
    });

    if (!deepseekRes.ok) {
      const errText = await deepseekRes.text();
      console.error("[DeepSeek API Error]:", errText);
      throw new Error(`DeepSeek API error (${deepseekRes.status}): ${errText}`);
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        if (!deepseekRes.body) {
          controller.close();
          return;
        }

        const reader = deepseekRes.body.getReader();
        let buffer = "";

        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed === "data: [DONE]") continue;

              if (trimmed.startsWith("data: ")) {
                try {
                  const json = JSON.parse(trimmed.slice(6));
                  const textChunk = json.choices?.[0]?.delta?.content;
                  if (textChunk) {
                    controller.enqueue(encoder.encode(textChunk));
                  }
                } catch {
                  // Ignore JSON parse error on partial chunks
                }
              }
            }
          }

          if (buffer.trim() && buffer.trim().startsWith("data: ") && buffer.trim() !== "data: [DONE]") {
            try {
              const json = JSON.parse(buffer.trim().slice(6));
              const textChunk = json.choices?.[0]?.delta?.content;
              if (textChunk) {
                controller.enqueue(encoder.encode(textChunk));
              }
            } catch {}
          }

          controller.close();
        } catch (err) {
          controller.error(err);
        }
      }
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });

  } catch (e: any) {
    console.error("[Route Error]:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
