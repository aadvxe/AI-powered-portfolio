import { SupabaseClient } from "@supabase/supabase-js";
import { getEmbeddingVector } from "@/lib/gcp";

interface EducationItem {
  category?: string;
  degree?: string;
  school?: string;
  year?: string | number;
  gpa?: string;
  description?: string;
}

interface ExperienceItem {
  role?: string;
  company?: string;
  period?: string;
  description?: string;
  skills?: string;
}

interface CertificationItem {
  title?: string;
  issuer?: string;
  date?: string;
  link?: string;
}

interface AchievementItem {
  title?: string;
  event?: string;
  description?: string;
}

interface CustomSectionItem {
  title?: string;
  subtitle?: string;
  date?: string;
  description?: string;
}

interface CustomSection {
  id?: string;
  title?: string;
  items?: CustomSectionItem[];
}

interface ProjectItem {
  id: string | number;
  title: string;
  featured?: boolean;
  category?: string;
  description?: string;
  tags?: string[];
  demo_link?: string;
  repo_link?: string;
  custom_links?: Array<{ label: string; url: string }>;
}

interface SkillItem {
  name: string;
  category: string;
  proficiency: number;
}

interface DocumentRecord {
  content: string;
  metadata?: Record<string, unknown>;
}

export async function reindexKnowledgeBase(supabase: SupabaseClient) {
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) console.log("[RAG] Starting re-indexing with GCP Vertex AI / Gemini Embeddings...");

  // 1. Fetch Data
  const { data: profile } = await supabase.from("profile").select("*").single();
  const { data: projects } = await supabase.from("projects").select("*");
  const { data: skills } = await supabase.from("skills").select("*");

  const docs_to_insert: DocumentRecord[] = [];

  // 2. Prepare Documents
  // ... (Profile - Split into chunks for better retrieval)
  if (profile) {
     // Chunk 1: Identity & Bio
     docs_to_insert.push({ 
        content: `Profile: ${profile.name}\nHeadline: ${profile.headline}\nRole: ${profile.role}\nBio: ${profile.bio}\nLocation: ${profile.location}`, 
        metadata: { type: 'profile-bio' } 
     });

     // Chunk 2: Contact
     docs_to_insert.push({ 
        content: `Contact Info for ${profile.name}:\nEmail: ${profile.email}\nGitHub: ${profile.social_links?.github || "N/A"}\nLinkedIn: ${profile.social_links?.linkedin || "N/A"}\nResume: ${profile.resume_url}`, 
        metadata: { type: 'profile-contact' } 
     });

     // Chunk 3: Education
     if (profile.education && profile.education.length > 0) {
        profile.education.forEach((e: EducationItem) => {
            const lowerCat = (e.category || '').toLowerCase();
            const lowerDeg = (e.degree || '').toLowerCase();
            
            const isNonDegree = lowerCat.includes('course') || lowerCat.includes('bootcamp') || lowerCat.includes('cohort') || 
                                lowerDeg.includes('course') || lowerDeg.includes('bootcamp') || lowerDeg.includes('cohort');
            
            const isDegree = !isNonDegree && (!e.category || lowerCat === 'university');

            const label = isDegree ? 'Degree' : 'Program/Course/Cohort';
            const keywords = isDegree ? 'University Degree Study School Academic Background' : 'Course Training Workshop Education Other Cohort Bootcamp';
            
            docs_to_insert.push({ 
                content: `Education History ${keywords}:\nCategory: ${e.category || 'University'}\n${label}: ${e.degree || ''}\nSchool: ${e.school || ''}\nYear: ${e.year || ''}\nGPA: ${e.gpa || 'N/A'}\nDescription: ${e.description || ''}`, 
                metadata: { type: 'profile-education' } 
            });
        });
     }

     // Chunk 4: Experience
     if (profile.experiences && profile.experiences.length > 0) {
        profile.experiences.forEach((e: ExperienceItem) => {
            docs_to_insert.push({ 
                content: `Work Experience Job History Career Role Employment Record Previous Jobs:\nRole: ${e.role || ''}\nCompany: ${e.company || ''} (${e.period || ''})\nDescription: ${e.description || ''}\nSkills: ${e.skills || ''}`, 
                metadata: { type: 'profile-experience' } 
            });
        });
     }

     // Chunk 5: Certifications
     if (profile.certifications && profile.certifications.length > 0) {
        profile.certifications.forEach((c: CertificationItem) => {
            docs_to_insert.push({ 
                content: `Certification License Credential:\nTitle: ${c.title || ''}\nIssuer: ${c.issuer || ''}\nDate: ${c.date || ''}\nLink: ${c.link || 'N/A'}`, 
                metadata: { type: 'profile-certification' } 
            });
        });
     }

     // Chunk 6: Achievements
     if (profile.achievements && profile.achievements.length > 0) {
        profile.achievements.forEach((a: AchievementItem) => {
             docs_to_insert.push({ 
                 content: `Achievement Award Honor Reward:\nTitle: ${a.title || ''}\nEvent/Organization: ${a.event || ''}\nDescription: ${a.description || ''}`, 
                 metadata: { type: 'profile-achievement' } 
             });
        });
     }

     // Chunk 7: Custom Sections
     if (profile.custom_sections && profile.custom_sections.length > 0) {
         profile.custom_sections.forEach((section: CustomSection) => {
             if (section.items && section.items.length > 0) {
                 section.items.forEach((item: CustomSectionItem) => {
                     docs_to_insert.push({ 
                         content: `${section.title || ''} - ${item.title || ''}:\nSubtitle: ${item.subtitle || ''}\nDate: ${item.date || ''}\nDescription: ${item.description || ''}`, 
                         metadata: { type: 'profile-custom', section: section.id } 
                     });
                 });
             }
         });
     }
  }

  // ... (Projects)
  if (projects) {
    for (const p of projects as ProjectItem[]) {
        const text = `
        Project Title: ${p.title} ${p.featured ? "(Featured Project)" : ""}
        Category: ${p.category || 'General'}
        Description: ${p.description || ''}
        Tech Stack: ${(p.tags || []).join(", ")}
        Links:
        - Demo: ${p.demo_link || "N/A"}
        - Repo: ${p.repo_link || "N/A"}
        ${(p.custom_links || []).map((l) => `- ${l.label}: ${l.url}`).join("\n")}
        `.trim();
        docs_to_insert.push({ content: text, metadata: { type: 'project', id: p.id } });
    }
  }

  // ... (Skills)
  if (skills) {
      // Group skills
      const skillsByCategory: Record<string, string[]> = {};
      (skills as SkillItem[]).forEach((s) => {
        if (!skillsByCategory[s.category]) skillsByCategory[s.category] = [];
        skillsByCategory[s.category].push(`${s.name} (${s.proficiency}%)`);
      });

      for (const [category, skillList] of Object.entries(skillsByCategory)) {
          const skillText = `
          Skills in ${category}:
          ${skillList.join(", ")}
          `.trim();
          docs_to_insert.push({ content: skillText, metadata: { type: 'skills', category } });
      }
  }

  if (isDev) console.log(`[RAG] Generated ${docs_to_insert.length} documents.`);

  // 3. Clear & Insert with GCP Vertex AI / Gemini Document Embeddings
  await supabase.from("documents").delete().neq("id", 0); 
  
  for (const doc of docs_to_insert) {
    // Generate Document Embedding with taskType RETRIEVAL_DOCUMENT
    const vector = await getEmbeddingVector(doc.content, {
      taskType: "RETRIEVAL_DOCUMENT",
    });
    
    const { error } = await supabase.from("documents").insert({
      content: doc.content,
      metadata: doc.metadata,
      embedding: vector,
    });

    if (error) {
        console.error("[RAG] Insert Error:", error);
        throw error;
    }
  }

  if (isDev) console.log("[RAG] Re-indexing complete!");
  return { success: true, count: docs_to_insert.length };
}

/**
 * Searches the Supabase vector knowledge base using Gemini query embeddings (GCP Vertex AI / Gemini).
 * Generates an embedding for the user's query with taskType 'RETRIEVAL_QUERY' and performs cosine similarity search.
 */
export async function searchKnowledgeBase(
  supabase: SupabaseClient,
  query: string,
  options?: {
    matchCount?: number;
    matchThreshold?: number;
  }
): Promise<string> {
  const isDev = process.env.NODE_ENV !== 'production';
  const matchCount = options?.matchCount ?? 6;
  const matchThreshold = options?.matchThreshold ?? 0.2;

  try {
    // 1. Generate query embedding with GCP Vertex AI / Gemini (taskType: RETRIEVAL_QUERY)
    const queryEmbedding = await getEmbeddingVector(query, {
      taskType: "RETRIEVAL_QUERY",
    });

    // 2. Query Supabase pgvector using the match_documents RPC function
    const { data: matchedDocs, error: rpcError } = await supabase.rpc("match_documents", {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });

    if (rpcError) {
      if (isDev) console.warn("[RAG] Supabase match_documents RPC error, falling back to direct table select:", rpcError.message);
      // Graceful fallback if RPC function is missing
      const { data: fallbackDocs, error: fallbackError } = await supabase
        .from("documents")
        .select("content")
        .limit(15);

      if (fallbackError) throw fallbackError;
      return (
        (fallbackDocs as DocumentRecord[] | null)?.map((doc) => doc.content).join("\n---\n") ||
        "No relevant context found."
      );
    }

    if (matchedDocs && matchedDocs.length > 0) {
      if (isDev) console.log(`[RAG] Retrieved ${matchedDocs.length} matching documents via Gemini query embedding.`);
      return (matchedDocs as DocumentRecord[]).map((doc) => doc.content).join("\n---\n");
    }

    // If no documents matched the similarity threshold, fallback to recent docs
    const { data: fallbackDocs } = await supabase
      .from("documents")
      .select("content")
      .limit(10);

    return (
      (fallbackDocs as DocumentRecord[] | null)?.map((doc) => doc.content).join("\n---\n") ||
      "No relevant context found."
    );
  } catch (err: unknown) {
    console.error("[RAG] Vector search error:", err);
    // Last-resort fallback
    const { data: allDocs } = await supabase.from("documents").select("content").limit(15);
    return (allDocs as DocumentRecord[] | null)?.map((doc) => doc.content).join("\n---\n") || "No relevant context found.";
  }
}
