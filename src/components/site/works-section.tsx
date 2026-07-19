"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ProjectData } from "@/hooks/use-content";
import { SectionHeading } from "./section-heading";

interface WorksSectionProps {
  projects: ProjectData[];
  onSelect: (project: ProjectData) => void;
  /** Keyword filter pushed from the chat assistant */
  chatFilter?: string;
  onClearChatFilter?: () => void;
}

// Semantic keyword expansion for chat-driven filters
const SEMANTIC_MAP: Record<string, string[]> = {
  ai: ["ai", "artificial intelligence", "ml", "machine learning", "llm", "rag", "langchain", "gemini", "gpt", "nlp", "chatbot"],
  "machine learning": ["machine learning", "ml", "ai", "deep learning", "neural", "sci-kit", "tensorflow", "pytorch"],
  ml: ["machine learning", "ml", "ai", "deep learning"],
  frontend: ["frontend", "react", "next.js", "typescript", "tailwind", "ui", "ux"],
  backend: ["backend", "node", "express", "supabase", "database", "sql", "api", "server"],
  mobile: ["mobile", "react native", "ios", "android", "flutter"],
  iot: ["iot", "internet of things", "mqtt", "cloud", "sensor", "azure", "aws"],
  embedded: ["embedded", "arduino", "stm32", "microcontroller", "esp32", "hardware", "firmware", "c++", "rtos"],
};

function matchesKeyword(project: ProjectData, keyword: string) {
  const terms = SEMANTIC_MAP[keyword.toLowerCase().trim()] || [keyword.toLowerCase().trim()];
  const haystack = JSON.stringify(project).toLowerCase();
  return terms.some((term) => haystack.includes(term));
}

export function WorksSection({ projects, onSelect, chatFilter, onClearChatFilter }: WorksSectionProps) {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(projects.map((p) => p.category).filter(Boolean))),
    [projects]
  );

  const visible = useMemo(() => {
    let list = projects;
    if (chatFilter) list = list.filter((p) => matchesKeyword(p, chatFilter));
    else if (categoryFilter) list = list.filter((p) => p.category === categoryFilter);
    return list;
  }, [projects, chatFilter, categoryFilter]);

  return (
    <section id="works" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 md:px-8 md:py-28">
      <SectionHeading
        index="01"
        label="Selected Works"
        title="Projects"
        subtitle="A catalogue of built things — each plate opens to its full record."
      />

      {/* Filters */}
      <div className="mb-12 flex flex-wrap items-center gap-2">
        {chatFilter ? (
          <button
            onClick={onClearChatFilter}
            className="flex items-center gap-2 border border-clay bg-clay/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-clay transition-colors hover:bg-clay hover:text-paper"
          >
            Filtered by “{chatFilter}” — clear ✕
          </button>
        ) : (
          <>
            <button
              onClick={() => setCategoryFilter(null)}
              className={`border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors ${
                !categoryFilter
                  ? "border-ink bg-ink text-paper"
                  : "border-line text-ink-soft hover:border-line-strong hover:text-ink"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat === categoryFilter ? null : cat)}
                className={`border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors ${
                  categoryFilter === cat
                    ? "border-ink bg-ink text-paper"
                    : "border-line text-ink-soft hover:border-line-strong hover:text-ink"
                }`}
              >
                {cat}
              </button>
            ))}
          </>
        )}
      </div>

      {visible.length === 0 && (
        <p className="border border-dashed border-line p-10 text-center font-serif italic text-ink-soft">
          No plates match this filter.
        </p>
      )}

      <div className="grid grid-cols-1 gap-x-10 gap-y-16 md:grid-cols-2">
        {visible.map((project, i) => (
          <motion.figure
            key={project.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
            className="group cursor-pointer"
            onClick={() => onSelect(project)}
          >
            {/* white matte frame, slight collage tilt that straightens on hover */}
            <div
              className={`border border-line bg-paper-raised p-2.5 pb-3 shadow-[5px_6px_0_rgba(38,35,30,0.14)] transition-transform duration-300 group-hover:rotate-0 group-hover:-translate-y-1 ${
                i % 2 === 0 ? "md:-rotate-[0.7deg]" : "md:rotate-[0.6deg]"
              }`}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden border border-line-strong bg-paper-deep">
                {project.image_url ? (
                  <Image
                    src={project.image_url}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-serif text-5xl italic text-ink-soft/30">
                    ✳
                  </div>
                )}
                {/* subtle vintage wash */}
                <div className="pointer-events-none absolute inset-0 bg-clay/5 mix-blend-multiply" />
              </div>
            </div>

            <figcaption className="mt-4">
              <div className="flex items-baseline justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                <span>Plate {String(i + 1).padStart(2, "0")} · {project.category}</span>
                {project.year && (
                  <span>
                    {project.month ? `${project.month} ` : ""}
                    {project.year}
                  </span>
                )}
              </div>
              <h3 className="mt-2 font-serif text-2xl tracking-tight text-ink transition-colors group-hover:text-clay">
                {project.title}
              </h3>
              <p className="mt-1.5 line-clamp-2 font-serif text-sm leading-relaxed text-ink-soft">
                {project.description?.split("\n")[0]}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft/80">
                {project.tags.slice(0, 4).map((tag) => (
                  <span key={tag}>#{tag}</span>
                ))}
                {project.tags.length > 4 && <span>+{project.tags.length - 4}</span>}
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
