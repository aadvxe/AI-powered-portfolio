"use client";

import { SectionId } from "@/types/chat";

interface NavProps {
  name: string;
  onNavigate: (target: SectionId) => void;
  onOpenChat: () => void;
}

const LINKS: { label: string; target: SectionId }[] = [
  { label: "Works", target: "works" },
  { label: "Skills", target: "skills" },
  { label: "About", target: "about" },
  { label: "Contact", target: "contact" },
];

export function Nav({ name, onNavigate, onOpenChat }: NavProps) {
  return (
    <nav className="fixed inset-x-0 top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-[2px]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 md:px-8">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="shrink-0 font-serif text-lg italic tracking-tight text-ink"
        >
          {name}
        </button>

        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map((link, i) => (
            <button
              key={link.target}
              onClick={() => onNavigate(link.target)}
              className="group flex items-baseline gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-clay"
            >
              <span className="text-[9px] text-ink-soft/60 group-hover:text-clay/60">
                0{i + 1}
              </span>
              {link.label}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenChat}
          className="flex shrink-0 items-center gap-2 border border-ink bg-ink px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-paper transition-colors hover:bg-clay hover:border-clay"
        >
          <span aria-hidden>✳</span>
          Ask the AI
        </button>
      </div>
    </nav>
  );
}
