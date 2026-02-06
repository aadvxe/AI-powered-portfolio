
import { SupabaseClient } from "@supabase/supabase-js";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";

export async function reindexKnowledgeBase(supabase: SupabaseClient) {
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) console.log("[RAG] Starting re-indexing...");

  // 1. Fetch Data
  const { data: profile } = await supabase.from("profile").select("*").single();
  const { data: projects } = await supabase.from("projects").select("*");
  const { data: skills } = await supabase.from("skills").select("*");

  const docs_to_insert = [];

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
        profile.education.forEach((e: any) => {
            const lowerCat = (e.category || '').toLowerCase();
            const lowerDeg = (e.degree || '').toLowerCase();
            
            // Check if it's explicitly University OR default (if not generic course/bootcamp/cohort words found)
            const isNonDegree = lowerCat.includes('course') || lowerCat.includes('bootcamp') || lowerCat.includes('cohort') || 
                                lowerDeg.includes('course') || lowerDeg.includes('bootcamp') || lowerDeg.includes('cohort');
            
            const isDegree = !isNonDegree && (!e.category || lowerCat === 'university');

            const label = isDegree ? 'Degree' : 'Program/Course/Cohort';
            const keywords = isDegree ? 'University Degree Study School Academic Background' : 'Course Training Workshop Education Other Cohort Bootcamp';
            
            docs_to_insert.push({ 
                content: `Education History ${keywords}:\nCategory: ${e.category || 'University'}\n${label}: ${e.degree}\nSchool: ${e.school}\nYear: ${e.year}\nGPA: ${e.gpa || 'N/A'}\nDescription: ${e.description || ''}`, 
                metadata: { type: 'profile-education' } 
            });
        });
     }

     // Chunk 4: Experience
     if (profile.experiences && profile.experiences.length > 0) {
        profile.experiences.forEach((e: any) => {
            docs_to_insert.push({ 
                content: `Work Experience Job History Career Role Employment Record Previous Jobs:\nRole: ${e.role}\nCompany: ${e.company} (${e.period})\nDescription: ${e.description}\nSkills: ${e.skills || ''}`, 
                metadata: { type: 'profile-experience' } 
            });
        });
     }

     // Chunk 5: Certifications
     if (profile.certifications && profile.certifications.length > 0) {
        profile.certifications.forEach((c: any) => {
            docs_to_insert.push({
                content: `Certification License Credential:\nTitle: ${c.title}\nIssuer: ${c.issuer}\nDate: ${c.date}\nLink: ${c.link || 'N/A'}`,
                metadata: { type: 'profile-certification' }
            });
        });
     }

     // Chunk 6: Achievements
     if (profile.achievements && profile.achievements.length > 0) {
        profile.achievements.forEach((a: any) => {
             docs_to_insert.push({
                 content: `Achievement Award Honor Reward:\nTitle: ${a.title}\nEvent/Organization: ${a.event}\nDescription: ${a.description || ''}`,
                 metadata: { type: 'profile-achievement' }
             });
        });
     }

     // Chunk 7: Custom Sections
     if (profile.custom_sections && profile.custom_sections.length > 0) {
         profile.custom_sections.forEach((section: any) => {
             // Create a chunk for the whole section or each item. 
             // Let's chunk by item for granularity.
             if (section.items && section.items.length > 0) {
                 section.items.forEach((item: any) => {
                     docs_to_insert.push({
                         content: `${section.title} - ${item.title}:\nSubtitle: ${item.subtitle || ''}\nDate: ${item.date || ''}\nDescription: ${item.description || ''}`,
                         metadata: { type: 'profile-custom', section: section.id }
                     });
                 });
             }
         });
     }
  }

  // ... (Projects)
  if (projects) {
    for (const p of projects) {
        const text = `
        Project Title: ${p.title} ${p.featured ? "(Featured Project)" : ""}
        Category: ${p.category}
        Description: ${p.description}
        Tech Stack: ${p.tags.join(", ")}
        Links:
        - Demo: ${p.demo_link || "N/A"}
        - Repo: ${p.repo_link || "N/A"}
        ${(p.custom_links || []).map((l: any) => `- ${l.label}: ${l.url}`).join("\n")}
        `.trim();
        docs_to_insert.push({ content: text, metadata: { type: 'project', id: p.id } });
    }
  }

  // ... (Skills)
  if (skills) {
      // Group skills
      const skillsByCategory: Record<string, string[]> = {};
      skills.forEach((s: any) => {
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

  // 3. Clear & Insert
  await supabase.from("documents").delete().neq("id", 0); 
  
  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "models/gemini-embedding-001", // Optimize for retrieval
    taskType: TaskType.RETRIEVAL_DOCUMENT,
    apiKey: process.env.GOOGLE_API_KEY
  });

  for (const doc of docs_to_insert) {
    // USE GOOGLE AI EMBEDDING
    const vector = await embeddings.embedQuery(doc.content);
    
    // Explicitly check for error
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
