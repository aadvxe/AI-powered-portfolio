"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { LiquidGlass } from "./ui/liquid-glass";
import Image from "next/image";
import { ProjectData } from "@/hooks/use-content";

export type Project = ProjectData;

interface ProjectDeckProps {
    id: string;
    projects: Project[];
    onSelect: (project: Project) => void;
    filter?: string; // Optional keyword filter
}

// Semantic mapping
const SEMANTIC_MAP: Record<string, string[]> = {
  "ai": ["ai", "artificial intelligence", "ml", "machine learning", "llm", "rag", "langchain", "gemini", "gpt", "nlp", "chatbot"],
  "machine learning": ["machine learning", "ml", "ai", "deep learning", "neural", "sci-kit", "tensorflow", "pytorch"],
  "ml": ["machine learning", "ml", "ai", "deep learning"],
  "frontend": ["frontend", "react", "next.js", "typescript", "tailwind", "ui", "ux"],
  "backend": ["backend", "node", "express", "supabase", "database", "sql", "api", "server"],
  "mobile": ["mobile", "react native", "ios", "android", "flutter"],
  "iot": ["iot", "embedded", "arduino", "raspberry", "esp32", "hardware", "sensor"],
};

export function ProjectDeck({ id, projects, onSelect, filter }: ProjectDeckProps) {
  
  const filteredProjects = runFilter(projects, filter);

  function runFilter(allProjects: Project[], keyword?: string) {
    if (!keyword) return allProjects;
    
    const lowerKey = keyword.toLowerCase().trim();
    
    // 1. Get related terms from map, or just use the keyword itself
    const terms = SEMANTIC_MAP[lowerKey] || [lowerKey];
    
    // 2. Filter: Check if ANY of the terms are present in the project data
    return allProjects.filter(p => {
        const projectString = JSON.stringify(p).toLowerCase();
        return terms.some(term => projectString.includes(term));
    });
  }

  if (filteredProjects.length === 0) return null;

  return (
    <div className="relative w-full py-0">
      {/* Horizontal scroll wrapper */}
      <div className="flex w-full snap-x snap-mandatory gap-6 overflow-x-auto px-6 py-8 no-scrollbar">
        {filteredProjects.map((project) => (
          <LiquidGlass
            key={project.id}
            type="project-card"
            onClick={() => onSelect(project)}
            className="group relative h-[550px] w-[360px] flex-none cursor-pointer snap-center flex-col overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-shadow duration-300 !p-0"
            initial="idle"
            whileHover="hover"
            variants={{
                idle: { scale: 1 },
                hover: { scale: 1.02 }
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
             {/* Thumbnail Container */}
             <div className="h-[57%] w-full relative overflow-hidden">
                {project.image_url ? (
                    <div className="relative w-full h-full">
                        <Image 
                            src={project.image_url} 
                            alt={project.title} 
                            fill 
                            className="object-cover" 
                        />
                    </div>
                ) : (
                    <div className={`w-full h-full ${project.gradient}`} />
                )}
             </div>

             {/* Metadata Container */}
             <div className="h-[43%] w-full bg-white p-7 pt-2.5 flex flex-col justify-between">
                <div>
                   <span className="mb-3 inline-block rounded-full bg-brand-cyan/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-cyan">
                     {project.category}
                   </span>
                   <h3 className="text-base font-bold text-neutral-800 leading-tight group-hover:text-brand-cyan transition-colors">
                     {project.title}
                   </h3>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-md">
                      #{tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                      <span className="text-xs text-neutral-400 py-1">+ {project.tags.length - 3}</span>
                  )}
                </div>
             </div>
          </LiquidGlass>
        ))}
      </div>
      <style jsx global>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
    </div>
  );
}
