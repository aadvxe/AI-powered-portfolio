import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { generateStructuredCompletion } from "@/lib/gcp";

interface ProjectTagsRequest {
  type: "project-tags";
  data: {
    title?: string;
    description?: string;
    category?: string;
  };
}

interface ExperienceSkillsRequest {
  type: "experience-skills";
  data: {
    role?: string;
    company?: string;
    description?: string;
  };
}

type AutofillRequest = ProjectTagsRequest | ExperienceSkillsRequest;

export async function POST(request: Request) {
  const cookieStore = await cookies();

  // Validate admin authentication via Supabase session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored in route handler
          }
        },
      },
    }
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as AutofillRequest;

    if (!body || !body.type) {
      return NextResponse.json({ error: "Missing required parameter 'type'" }, { status: 400 });
    }

    if (body.type === "project-tags") {
      const { title = "", category = "", description = "" } = body.data || {};

      if (!title.trim() && !description.trim()) {
        return NextResponse.json(
          { error: "Please provide a title or description to generate tags." },
          { status: 400 }
        );
      }

      const prompt = `Project Title: ${title || "N/A"}\nCategory: ${category || "N/A"}\nDescription:\n${description || "N/A"}`;
      const systemInstruction = `You are an expert technical portfolio assistant.
Analyze the project title, category, and description, then extract and recommend between 4 and 8 relevant, industry-standard technology stack tags, frameworks, libraries, tools, and methodologies.
Guidelines:
- Use standard, canonical capitalization (e.g., 'Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'FastAPI', 'PyTorch', 'Docker', 'PostgreSQL', 'LangChain', 'Gemini API', 'Supabase').
- Focus on concrete technologies, tools, and domain keywords mentioned or strongly implied.
- Do NOT include generic buzzwords like 'Project', 'App', 'Website', or 'Tool'.
- Output MUST be valid JSON matching this schema:
{"tags": ["Tag1", "Tag2", "Tag3"]}`;

      const result = await generateStructuredCompletion<{ tags?: string[] }>({
        prompt,
        systemInstruction,
        temperature: 0.2,
      });

      const tags = Array.isArray(result?.tags)
        ? result.tags.map((t) => String(t).trim()).filter(Boolean)
        : [];

      return NextResponse.json({ tags });
    }

    if (body.type === "experience-skills") {
      const { role = "", company = "", description = "" } = body.data || {};

      if (!role.trim() && !description.trim()) {
        return NextResponse.json(
          { error: "Please provide a role or description to generate skills." },
          { status: 400 }
        );
      }

      const prompt = `Role / Title: ${role || "N/A"}\nCompany / Organization: ${company || "N/A"}\nJob Description:\n${description || "N/A"}`;
      const systemInstruction = `You are an expert technical recruiter and resume assistant.
Analyze the job role, company, and description, then extract and recommend between 4 and 8 relevant, high-impact skills, technologies, methodologies, and tools used.
Guidelines:
- Use standard, canonical technical naming (e.g., 'React', 'Python', 'Large Language Models (LLMs)', 'RAG', 'Agentic AI', 'REST APIs', 'Git', 'Machine Learning', 'Data Analysis').
- Include both key technologies and relevant domain competencies demonstrated in the description.
- Output MUST be valid JSON matching this schema:
{"skills": ["Skill1", "Skill2", "Skill3"]}`;

      const result = await generateStructuredCompletion<{ skills?: string[] }>({
        prompt,
        systemInstruction,
        temperature: 0.2,
      });

      const skills = Array.isArray(result?.skills)
        ? result.skills.map((s) => String(s).trim()).filter(Boolean)
        : [];

      return NextResponse.json({ skills });
    }

    return NextResponse.json({ error: "Invalid autofill type" }, { status: 400 });
  } catch (err: unknown) {
    console.error("[API Autofill Error]:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
