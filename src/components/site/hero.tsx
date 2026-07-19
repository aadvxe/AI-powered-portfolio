"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { ProfileData } from "@/hooks/use-content";
import { SectionId } from "@/types/chat";
import { SeaScene } from "./sea-scene";

interface HeroProps {
  profile: ProfileData | null;
  onNavigate: (target: SectionId) => void;
  /** Opens the centered chat with this question */
  onAsk: (question: string) => void;
  onOpenChat: () => void;
}

/** Collage "slap-in": drops with rotation jitter, like paper being placed */
const slap = (i: number) => ({
  hidden: { opacity: 0, y: 34, rotate: -3 },
  show: {
    opacity: 1,
    y: [34, 8, 0],
    rotate: [-3, 1.5, 0],
    transition: { delay: 0.12 * i, duration: 0.55, times: [0, 0.6, 1], ease: "easeOut" as const },
  },
});

const CHIPS = ["Show me your projects", "Do you have AI experience?", "What are your skills?"];

export function Hero({ profile, onNavigate, onAsk, onOpenChat }: HeroProps) {
  const [draft, setDraft] = useState("");
  const name = profile?.name || "Rangga";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onAsk(draft.trim());
    setDraft("");
  };

  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
      {/* The sea */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[46svh] md:h-[52svh]">
        <SeaScene />
      </div>

      {/* Masthead content */}
      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-5 pt-24 text-center md:pt-28">
        <motion.p
          variants={slap(0)}
          initial="hidden"
          animate="show"
          className="overline-label flex items-center gap-3"
        >
          <span className="inline-block h-px w-8 bg-line-strong" aria-hidden />
          An AI-powered portfolio
          <span className="inline-block h-px w-8 bg-line-strong" aria-hidden />
        </motion.p>

        <motion.h1
          variants={slap(1)}
          initial="hidden"
          animate="show"
          className="mt-6 font-serif text-5xl leading-[1.04] tracking-tight text-ink sm:text-6xl md:text-7xl"
        >
          {name},
        </motion.h1>

        <motion.div variants={slap(2)} initial="hidden" animate="show" className="mt-4">
          <span className="torn-swatch inline-block -rotate-1 bg-clay px-5 py-2 font-serif text-2xl italic text-paper sm:text-3xl md:px-6 md:text-4xl">
            engineer of intelligent systems
          </span>
        </motion.div>

        <motion.p
          variants={slap(3)}
          initial="hidden"
          animate="show"
          className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft sm:text-[11px]"
        >
          AI Engineering · Embedded Systems &amp; IoT · Web Development
        </motion.p>

        {/* The AI, front and center */}
        <motion.div variants={slap(4)} initial="hidden" animate="show" className="mt-10 w-full max-w-xl">
          <div className="torn-swatch rotate-[0.6deg] bg-paper-raised p-2 shadow-[5px_6px_0_rgba(38,35,30,0.18)]">
            <form
              onSubmit={submit}
              className="flex items-stretch border border-line-strong bg-paper focus-within:border-ink"
            >
              <span className="flex items-center pl-4 font-serif text-clay" aria-hidden>
                ✳
              </span>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onFocus={() => !draft && undefined}
                placeholder="Ask my AI anything about my work…"
                className="min-w-0 flex-1 bg-transparent px-3 py-3.5 font-serif text-[15px] text-ink placeholder:italic placeholder:text-ink-soft/70 focus:outline-none"
              />
              <button
                type="submit"
                onClick={(e) => {
                  if (!draft.trim()) {
                    e.preventDefault();
                    onOpenChat();
                  }
                }}
                className="flex items-center gap-2 border-l border-line-strong bg-ink px-4 font-mono text-[11px] uppercase tracking-[0.15em] text-paper transition-colors hover:bg-clay"
              >
                Ask <ArrowRight size={14} />
              </button>
            </form>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => onAsk(chip)}
                className="border border-line-strong bg-paper/80 px-3 py-1.5 font-serif text-xs italic text-ink-soft backdrop-blur-[1px] transition-colors hover:border-clay hover:text-clay"
              >
                “{chip}”
              </button>
            ))}
          </div>

          <button
            onClick={() => onNavigate("works")}
            className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft underline decoration-line-strong underline-offset-4 transition-colors hover:text-clay"
          >
            or scroll to browse the catalogue ↓
          </button>
        </motion.div>
      </div>
    </section>
  );
}
