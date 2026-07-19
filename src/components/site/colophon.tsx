"use client";

import { motion } from "framer-motion";
import { X, ArrowUpRight } from "lucide-react";
import { useEffect } from "react";
import { GithubIcon } from "@/components/ui/social-icons";

interface ColophonProps {
  onClose: () => void;
  /** Opens the chat drawer pre-filled with a question */
  onAsk: (question: string) => void;
}

const STACK = [
  { name: "Framework", val: "Next.js 16" },
  { name: "Styling", val: "Tailwind CSS + Framer Motion" },
  { name: "Language", val: "TypeScript" },
  { name: "Backend", val: "Supabase (PostgreSQL + pgvector)" },
  { name: "AI", val: "LangChain + DeepSeek v4 Flash" },
  { name: "Embeddings", val: "Google gemini-embedding-001" },
];

const EXAMPLES = [
  "Show me projects using Machine Learning",
  "Do you have experience with AI?",
  "How can I contact you?",
  "Tell me about your background",
];

export function Colophon({ onClose, onAsk }: ColophonProps) {
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
        className="absolute inset-0 bg-ink/45"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col border border-line-strong bg-paper-raised plate-shadow"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-20 border border-line bg-paper p-2 text-ink-soft transition-colors hover:border-clay hover:text-clay"
          title="Close"
        >
          <X size={16} />
        </button>

        <div className="shrink-0 border-b border-line p-8 pb-6">
          <div className="overline-label">About this portfolio</div>
          <h2 className="mt-3 font-serif text-4xl tracking-tight text-ink">Colophon</h2>
        </div>

        <div className="custom-scrollbar flex-1 overflow-y-auto p-8 pt-6">
          <p className="font-serif text-[15px] leading-relaxed text-ink-soft">
            This site is an AI-powered portfolio. Its contents — projects, skills, experience — are
            kept as structured records in a database, embedded into a vector index, and served to a
            resident assistant through <strong className="text-ink">Retrieval-Augmented Generation
            (RAG)</strong>. Nothing the assistant says is hardcoded: it retrieves the relevant
            records and composes its answers from them.
          </p>

          <div className="mt-8">
            <h3 className="overline-label mb-3">The method</h3>
            <div className="border-t border-line font-serif text-[15px] leading-relaxed text-ink-soft">
              <div className="border-b border-line py-3">
                <strong className="text-ink">Hybrid routing.</strong> Simple navigational questions
                are answered instantly in the browser; analytical ones are sent to the cloud model.
              </div>
              <div className="border-b border-line py-3">
                <strong className="text-ink">Structured retrieval.</strong> Each project, skill
                group, and biography section is its own document, so answers cite whole records
                rather than fragments.
              </div>
              <div className="py-3">
                <strong className="text-ink">A living index.</strong> New entries added to the
                database are re-embedded and immediately known to the assistant — no code changes.
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="overline-label mb-3">Try asking</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {EXAMPLES.map((q) => (
                <button
                  key={q}
                  onClick={() => onAsk(q)}
                  className="border border-line px-3 py-2.5 text-left font-serif text-sm italic text-ink-soft transition-colors hover:border-clay hover:text-clay"
                >
                  “{q}”
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="overline-label mb-3">Composition</h3>
            <div className="border-t border-line">
              {STACK.map((item) => (
                <div
                  key={item.name}
                  className="flex items-baseline justify-between gap-6 border-b border-line py-2.5"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
                    {item.name}
                  </span>
                  <span className="text-right font-serif text-sm text-ink">{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          <a
            href="https://github.com/aadvxe/AI-powered-portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 flex items-center justify-center gap-2 border border-ink bg-ink px-5 py-3 font-mono text-[12px] uppercase tracking-[0.15em] text-paper transition-colors hover:bg-clay hover:border-clay"
          >
            <GithubIcon size={16} />
            View source on GitHub
            <ArrowUpRight size={14} />
          </a>
        </div>
      </motion.div>
    </div>
  );
}
