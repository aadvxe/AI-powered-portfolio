"use client";

import { motion } from "framer-motion";
import { FolderGit2 } from "lucide-react";
import Image from "next/image";
import { ProjectData } from "@/hooks/use-content";
import { LiquidGlass } from "@/components/ui/liquid-glass";

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

export function ProjectDeck({ id: _id, projects, onSelect, filter }: ProjectDeckProps) {
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
          const outerRadiusClass = isLarge ? 'rounded-[1.75rem]' : 'rounded-2xl';
          const innerRadiusClass = isLarge ? 'rounded-[1.35rem]' : 'rounded-xl';

          return (
            <LiquidGlass
              key={project.id}
              type="project-card"
              draggable={false}
              variants={itemVariants}
              onClick={() => onSelect(project)}
              className={`relative ${outerRadiusClass} !overflow-hidden p-1 sm:p-1.5 cursor-pointer group !shadow-[0_10px_25px_-5px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)] ${
                isHero
                  ? 'min-h-[420px] sm:min-h-[460px]'
                  : isFeatured
                    ? 'sm:col-span-2 sm:row-span-2 min-h-[340px] sm:min-h-[380px]'
                    : isDuo
                      ? 'min-h-[280px] sm:min-h-[320px]'
                      : isWide
                        ? 'sm:col-span-2 min-h-[250px] sm:min-h-[270px]'
                        : 'col-span-1 min-h-[280px] sm:min-h-[300px]'
              }`}
            >
              {/* Outer bottom white gradient: eliminates bottom corner line while preserving the thin bezel around the card */}
              <div className="absolute -inset-x-2 -bottom-2 h-[68%] rounded-b-[inherit] pointer-events-none bg-gradient-to-t from-white via-white/95 via-45% to-transparent" />

              {/* Inner card container with concentric rounded corners */}
              <div className={`relative w-full h-full overflow-hidden ${innerRadiusClass} bg-white flex flex-col justify-end`}>
                {/* Visual Background — faded before the bottom so no image pixels reach or bleed through the bottom corners */}
                {project.image_url ? (
                  <div
                    className="absolute inset-x-0 top-0 bottom-8 overflow-hidden"
                    style={{
                      maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                    }}
                  >
                    <Image
                      src={project.image_url}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className={`absolute inset-x-0 top-0 bottom-8 ${project.gradient || 'bg-gradient-to-br from-cyan-500/15 to-blue-600/20'} flex items-center justify-center`}>
                    <FolderGit2 className="text-neutral-400/40 w-16 h-16 mb-20" />
                  </div>
                )}

                {/* Frosted glass progressive blur overlay (bottom 65%) */}
                <div
                  className="absolute inset-x-0 bottom-0 h-[65%] pointer-events-none backdrop-blur-md"
                  style={{
                    maskImage: 'linear-gradient(to top, black 45%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to top, black 45%, transparent 100%)',
                  }}
                />

                {/* Inner white gradient overlay for smooth transition */}
                <div className="absolute inset-x-0 bottom-0 h-[65%] pointer-events-none bg-gradient-to-t from-white via-white/90 via-45% to-transparent" />

                {/* Metadata Content on top of frosted overlay */}
                <div className="relative z-10 flex flex-col justify-end p-3.5 sm:p-4 text-left">
                  <div>
                    <h3 className={`font-bold text-neutral-900 leading-snug line-clamp-1 ${
                      isFeatured ? 'text-lg sm:text-xl mb-1' : 'text-sm sm:text-base mb-1'
                    }`}>
                      {project.title}
                    </h3>

                    {/* Description snippet */}
                    {project.description && (
                      <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed mb-2.5 font-normal">
                        {project.description.replace(/^[•\-\*]\s+/gm, '')}
                      </p>
                    )}
                  </div>

                  {/* Tags Footer — styled as clean white card pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {project.tags.slice(0, isFeatured ? 4 : 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-semibold text-neutral-700 bg-white/95 border border-white shadow-xs px-2.5 py-0.5 rounded-lg backdrop-blur-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                    {project.tags.length > (isFeatured ? 4 : 2) && (
                      <span className="text-[10px] font-semibold text-neutral-500 bg-white/80 border border-white/80 px-2 py-0.5 rounded-lg shadow-xs">
                        +{project.tags.length - (isFeatured ? 4 : 2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </LiquidGlass>
          );
        })}
      </motion.div>
    </div>
  );
}
