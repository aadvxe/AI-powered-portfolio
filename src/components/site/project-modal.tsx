"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { X, ExternalLink, Github } from "lucide-react";
import { useEffect } from "react";
import { ProjectData } from "@/hooks/use-content";

interface ProjectModalProps {
  project: ProjectData;
  onClose: () => void;
}

function DescriptionLines({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <>
      {text.split("\n").map((line, idx) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("-") || trimmed.startsWith("•")) {
          return (
            <div key={idx} className="mb-1.5 ml-1 flex items-start gap-3">
              <span className="mt-2 h-px w-3 shrink-0 bg-clay" aria-hidden />
              <span>{trimmed.substring(1).trim()}</span>
            </div>
          );
        }
        return (
          <p key={idx} className="mb-1.5">
            {line}
          </p>
        );
      })}
    </>
  );
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-ink/45"
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex h-[85vh] w-full max-w-4xl flex-col overflow-y-auto border border-line-strong bg-paper-raised plate-shadow md:h-[80vh] md:flex-row md:overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-20 border border-line bg-paper p-2 text-ink-soft transition-colors hover:border-clay hover:text-clay"
          title="Close"
        >
          <X size={16} />
        </button>

        {/* Visual side */}
        <div className="relative h-64 w-full shrink-0 border-b border-line-strong bg-paper-deep md:h-auto md:w-1/2 md:border-b-0 md:border-r">
          {project.image_url ? (
            <>
              <Image src={project.image_url} alt={project.title} fill className="object-cover" />
              <div className="pointer-events-none absolute inset-0 bg-clay/5 mix-blend-multiply" />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center font-serif text-6xl italic text-ink-soft/30">
              ✳
            </div>
          )}
        </div>

        {/* Record side */}
        <div className="flex w-full flex-col md:h-full md:w-1/2 md:min-h-0">
          <div className="shrink-0 border-b border-line p-7 pb-5">
            <div className="overline-label flex items-center justify-between gap-3">
              <span>{project.category}</span>
              {project.year && (
                <span>
                  {project.month ? `${project.month} ` : ""}
                  {project.year}
                </span>
              )}
            </div>
            <h2 className="mt-3 pr-8 font-serif text-3xl tracking-tight text-ink">{project.title}</h2>
          </div>

          <div className="custom-scrollbar p-7 pt-5 md:min-h-0 md:flex-1 md:overflow-y-auto">
            <div className="font-serif text-[15px] leading-relaxed text-ink-soft">
              <DescriptionLines text={project.description} />
            </div>

            <div className="mt-8">
              <h3 className="overline-label mb-3">Materials &amp; Methods</h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border border-line px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 pb-4">
              {project.demo_link && (
                <a
                  href={project.demo_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-[140px] flex-1 items-center justify-center gap-2 border border-ink bg-ink px-4 py-3 font-mono text-[12px] uppercase tracking-[0.15em] text-paper transition-colors hover:bg-clay hover:border-clay"
                >
                  <ExternalLink size={15} /> Visit Live
                </a>
              )}
              {project.repo_link && (
                <a
                  href={project.repo_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-[140px] flex-1 items-center justify-center gap-2 border border-line-strong px-4 py-3 font-mono text-[12px] uppercase tracking-[0.15em] text-ink transition-colors hover:border-clay hover:text-clay"
                >
                  <Github size={15} /> Source
                </a>
              )}
              {project.custom_links?.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-[140px] flex-1 items-center justify-center gap-2 border border-line-strong px-4 py-3 font-mono text-[12px] uppercase tracking-[0.15em] text-ink transition-colors hover:border-clay hover:text-clay"
                >
                  <ExternalLink size={15} className="text-ink-soft" /> {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
