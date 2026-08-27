"use client";

import { motion } from "framer-motion";
import { FolderGit2 } from "lucide-react";
import Image from "next/image";
import { ProjectData } from "@/hooks/use-content";

export type Project = ProjectData;

interface ProjectDeckProps {
  id: string;
  projects: Project[];
  onSelect: (project: Project) => void;
  filter?: string; // Optional keyword filter
}

// Semantic keyword mapping
const SEMANTIC_MAP: Record<string, string[]> = {
  "ai": ["ai", "artificial intelligence", "ml", "machine learning", "llm", "rag", "langchain", "gemini", "gpt", "nlp", "chatbot"],
  "machine learning": ["machine learning", "ml", "ai", "deep learning", "neural", "sci-kit", "tensorflow", "pytorch"],
  "ml": ["machine learning", "ml", "ai", "deep learning"],
  "frontend": ["frontend", "react", "next.js", "typescript", "tailwind", "ui", "ux"],
  "backend": ["backend", "node", "express", "supabase", "database", "sql", "api", "server"],
  "mobile": ["mobile", "react native", "ios", "android", "flutter"],
  "iot": ["iot", "internet of things", "mqtt", "cloud", "sensor", "azure", "aws"],
  "embedded": ["embedded", "arduino", "stm32", "microcontroller", "esp32", "hardware", "firmware", "c++", "rtos"],
};

export function ProjectDeck({ id, projects, onSelect, filter }: ProjectDeckProps) {
  const filteredProjects = runFilter(projects, filter);

  function runFilter(allProjects: Project[], keyword?: string) {
    if (!keyword) return allProjects;
    
    const lowerKey = keyword.toLowerCase().trim();
    const terms = SEMANTIC_MAP[lowerKey] || [lowerKey];
    
    return allProjects.filter(p => {
      const projectString = JSON.stringify(p).toLowerCase();
      return terms.some(term => projectString.includes(term));
    });
  }

  if (filteredProjects.length === 0) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 260, damping: 20 } },
  };

  const count = filteredProjects.length;

  // Grid shape adapts to the actual result count, so a lone (or paired) result
  // becomes a deliberately-sized centerpiece instead of a small tile stranded
  // beside empty columns.
  const gridColsClass =
    count === 1
      ? 'grid-cols-1 max-w-lg sm:max-w-xl mx-auto'
      : count === 2
        ? 'grid-cols-1 sm:grid-cols-2'
        : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:grid-flow-dense';

  return (
    <div className="relative w-full py-2">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className={`grid ${gridColsClass} gap-3 sm:gap-4 w-full auto-rows-[minmax(180px,auto)]`}
      >
        {filteredProjects.map((project, index) => {
          const isHero = count === 1;
          const isDuo = count === 2;
          // One hero card leads every deck of 3+, then a "wide" accent repeats
          // every 4 cards — so the rhythm holds however many results come back,
          // instead of only working for exactly 3 or 4.
          const isFeatured = isHero || (count >= 3 && index === 0);
          const isWide = isDuo || (count >= 4 && index % 4 === 3);

          // Corner radius scales with tile size — a fixed radius reads as much
          // "rounder" on a small tile than a large one, even at the same pixel
          // value. Each tier keeps the outer/inner gap at the 8px inset padding
          // so the corners still nest concentrically within their own tier.
          const isLarge = isHero || isFeatured;
          const isMedium = isDuo || isWide;
          const outerRadiusClass = isLarge ? 'rounded-[1.75rem]' : isMedium ? 'rounded-[1.5rem]' : 'rounded-[1.25rem]';
          const innerRadiusClass = isLarge ? 'rounded-[1.25rem]' : isMedium ? 'rounded-2xl' : 'rounded-xl';

          return (
            <motion.div
              key={project.id}
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(project)}
              className={`group relative flex flex-col justify-between overflow-hidden ${outerRadiusClass} border border-neutral-100 bg-white p-1.5 sm:p-2 gap-2 sm:gap-3 shadow-sm hover:shadow-xl transition-shadow duration-300 cursor-pointer ${
                isHero
                  ? 'min-h-[420px] sm:min-h-[460px]'
                  : isFeatured
                    ? 'sm:col-span-2 sm:row-span-2 min-h-[340px] sm:min-h-[380px]'
                    : isDuo
                      ? 'min-h-[280px] sm:min-h-[320px]'
                      : isWide
                        ? 'sm:col-span-2 min-h-[220px]'
                        : 'col-span-1 min-h-[220px]'
              }`}
            >
              {/* Visual Thumbnail — a thin inset frame, not full-bleed but not heavily padded either.
                  flex-1 so a row-spanning card's extra grid height becomes a bigger photo instead
                  of dead whitespace below the text; min-h is just the floor for non-spanning cards. */}
              <div className={`relative w-full overflow-hidden ${innerRadiusClass} bg-neutral-100 flex-1 ${
                isHero ? 'min-h-64 sm:min-h-80' : isFeatured ? 'min-h-56 sm:min-h-72' : isDuo ? 'min-h-48 sm:min-h-56' : isWide ? 'min-h-36 sm:min-h-40' : 'min-h-36'
              }`}>
                {project.image_url ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={project.image_url}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-50 group-hover:opacity-30 transition-opacity" />
                  </div>
                ) : (
                  <div className={`w-full h-full ${project.gradient || 'bg-gradient-to-br from-cyan-500/15 to-blue-600/20'} flex items-center justify-center`}>
                    <FolderGit2 className="text-neutral-400/40 w-12 h-12" />
                  </div>
                )}
              </div>

              {/* Metadata Content — sized to its own content, not stretched, so it hugs the image above it */}
              <div className="flex flex-col shrink-0 px-1.5 pb-1">
                <div>
                  <h3 className={`font-bold text-neutral-800 leading-snug line-clamp-1 ${
                    isFeatured ? 'text-lg sm:text-xl mb-1.5' : 'text-sm sm:text-base mb-1'
                  }`}>
                    {project.title}
                  </h3>

                  {/* Description snippet — shown consistently on every card, not just featured/wide ones */}
                  {project.description && (
                    <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed mb-3">
                      {project.description.replace(/^[•\-\*]\s+/gm, '')}
                    </p>
                  )}
                </div>

                {/* Tags Footer */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {project.tags.slice(0, isFeatured ? 4 : 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10.5px] font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                  {project.tags.length > (isFeatured ? 4 : 2) && (
                    <span className="text-[10px] font-medium text-neutral-400 pl-0.5">
                      +{project.tags.length - (isFeatured ? 4 : 2)}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
