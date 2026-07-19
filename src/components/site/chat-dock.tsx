"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, CornerDownRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Message, ChatAction, SectionId } from "@/types/chat";

interface ChatDockProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onNavigate: (target: SectionId, filter?: string) => void;
  /** A question queued from elsewhere (hero, colophon); sent on open */
  queuedQuestion: string | null;
  onQuestionConsumed: () => void;
}

const INITIAL_MESSAGE: Message = {
  role: "ai",
  content:
    "Good day. I am the resident assistant of this portfolio — ask me about the projects, skills, or experience catalogued here.",
};

const SUGGESTIONS = [
  "Show me your projects",
  "Do you have AI experience?",
  "Tell me about yourself",
  "How can I contact you?",
];

const SECTION_LABELS: Record<SectionId, string> = {
  works: "Projects, §01",
  skills: "Skills, §02",
  about: "About, §03",
  "about-experience": "Experience, §03",
  "about-education": "Education, §03",
  "about-certifications": "Certifications, §03",
  "about-achievements": "Achievements, §03",
  contact: "Contact, §04",
};

function makeAction(target: SectionId, filter?: string): ChatAction {
  return {
    target,
    filter,
    label: filter ? `${SECTION_LABELS[target]} — “${filter}”` : SECTION_LABELS[target],
  };
}

/** Map a [SHOW_*] tag from the model to a navigation action */
function tagToAction(tagType: string, param?: string): ChatAction | null {
  switch (tagType) {
    case "PROJECTS":
      return makeAction("works", param);
    case "SKILLS":
      return makeAction("skills");
    case "CONTACT":
      return makeAction("contact");
    case "ABOUT":
      return makeAction("about");
    case "EXPERIENCE":
      return makeAction("about-experience");
    case "EDUCATION":
      return makeAction("about-education");
    case "ACHIEVEMENTS":
      return makeAction("about-achievements");
    case "CERTIFICATIONS":
      return makeAction("about-certifications");
    default:
      return null;
  }
}

/** Fast local routing for simple navigational queries (no API cost) */
function checkLocalIntent(query: string): SectionId | null {
  const lower = query.toLowerCase();
  if (lower.length > 50 || lower.includes("what is") || lower.includes("how does") || lower.includes("explain"))
    return null;

  if (lower.includes("project") && (lower.includes("show") || lower.includes("see") || lower.includes("list")))
    return "works";
  if (lower.includes("skill") && (lower.includes("what") || lower.includes("show") || lower.includes("see")))
    return "skills";
  if (lower.includes("contact") || lower.includes("reach")) return "contact";
  if (lower === "about" || lower === "about me" || lower.includes("who are you") || lower.includes("tell me about yourself"))
    return "about";

  return null;
}

const LOCAL_RESPONSES: Record<string, string[]> = {
  works: [
    "Certainly — the works are catalogued in §01.",
    "Of course. The project plates await below.",
    "Here — the selected works, in full.",
  ],
  skills: [
    "The instruments of the trade, filed under §02.",
    "Certainly — the fields of practice are listed below.",
  ],
  contact: [
    "Correspondence is welcomed — see §04.",
    "You may write directly; the address is in §04.",
  ],
  about: [
    "The author's record is kept in §03.",
    "A full curriculum vitae is filed under §03.",
  ],
};

/** Small torn strip capping the chat panel */
function TornCap() {
  return (
    <svg viewBox="0 0 640 14" preserveAspectRatio="none" className="block h-3 w-full" aria-hidden>
      <path
        d="M0,14 L0,8 L27,10 L52,4 L83,9 L118,3 L149,8 L184,4 L215,10 L251,3 L282,9 L318,5 L349,10 L384,3 L415,8 L451,4 L482,10 L517,3 L548,9 L584,5 L615,9 L640,6 L640,14 Z"
        fill="var(--ink)"
      />
    </svg>
  );
}

export function ChatDock({
  open,
  onOpen,
  onClose,
  onNavigate,
  queuedQuestion,
  onQuestionConsumed,
}: ChatDockProps) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [barInput, setBarInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamingRef = useRef(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.65);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Consume questions queued from the hero / colophon
  useEffect(() => {
    if (open && queuedQuestion && !streamingRef.current) {
      const q = queuedQuestion;
      onQuestionConsumed();
      sendMessage(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, queuedQuestion]);

  const sendMessage = async (query: string) => {
    if (streamingRef.current) return;
    setMessages((prev) => [...prev, { role: "user", content: query }]);

    // 1. Local intent — answer instantly, no API call
    const localIntent = checkLocalIntent(query);
    if (localIntent) {
      streamingRef.current = true;
      setStreaming(true);
      setTimeout(() => {
        const pool = LOCAL_RESPONSES[localIntent];
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content: pool[Math.floor(Math.random() * pool.length)],
            action: makeAction(localIntent),
          },
        ]);
        streamingRef.current = false;
        setStreaming(false);
      }, 450);
      return;
    }

    // 2. RAG fallback
    streamingRef.current = true;
    setStreaming(true);
    try {
      const history = [...messages, { role: "user", content: query }];
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ messages: history }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errorMessage = typeof errData.error === "string" ? errData.error : JSON.stringify(errData);
        throw new Error(errorMessage || "Failed to fetch response");
      }

      setMessages((prev) => [...prev, { role: "ai", content: "" }]);

      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullContent = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        fullContent += decoder.decode(value);
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last.role === "ai") {
            last.content = fullContent.replace(/\[SHOW_.*?\]/g, "").trimEnd();
          }
          return next;
        });
      }

      // Convert [SHOW_TAG] / [SHOW_TAG:param] into a navigation chip
      const tagMatch = fullContent.match(/\[SHOW_([A-Z]+)(?::(.*))?\]/i);
      if (tagMatch) {
        const action = tagToAction(tagMatch[1].toUpperCase(), tagMatch[2]?.trim());
        if (action) {
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last.role === "ai") last.action = action;
            return next;
          });
        }
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "My apologies — the archive is momentarily unreachable. Do try again shortly.",
        },
      ]);
    } finally {
      streamingRef.current = false;
      setStreaming(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleBarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOpen();
    if (barInput.trim() && !streaming) {
      sendMessage(barInput.trim());
      setBarInput("");
    }
  };

  return (
    <>
      {/* Floating centered ask-bar, follows the reader down the page */}
      <AnimatePresence>
        {!open && scrolled && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-5 left-1/2 z-40 w-[min(560px,92vw)] -translate-x-1/2"
          >
            <div className="torn-swatch bg-paper-raised p-1.5 shadow-[5px_6px_0_rgba(38,35,30,0.22)]">
              <form
                onSubmit={handleBarSubmit}
                className="flex items-stretch border border-line-strong bg-paper focus-within:border-ink"
              >
                <span className="flex items-center pl-3.5 font-serif text-clay" aria-hidden>
                  ✳
                </span>
                <input
                  value={barInput}
                  onChange={(e) => setBarInput(e.target.value)}
                  placeholder="Ask my AI anything…"
                  className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-serif text-sm text-ink placeholder:italic placeholder:text-ink-soft/70 focus:outline-none"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 border-l border-line-strong bg-ink px-3.5 font-mono text-[10px] uppercase tracking-[0.15em] text-paper transition-colors hover:bg-clay"
                >
                  Ask <ArrowRight size={13} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Centered chat panel */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-ink/35"
            />
            <motion.div
              initial={{ opacity: 0, y: 40, rotate: -0.8 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, y: 28 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 flex h-[min(680px,88svh)] w-full max-w-2xl flex-col bg-paper shadow-[8px_10px_0_rgba(38,35,30,0.25)]"
            >
              <TornCap />
              {/* Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-line bg-ink px-5 pb-3.5 pt-1.5 text-paper">
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.2em]">
                    ✳ The Archivist
                  </div>
                  <div className="mt-0.5 font-serif text-xs italic text-paper/70">
                    Answers grounded in the portfolio&apos;s records
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {messages.length > 1 && (
                    <button
                      onClick={() => setMessages([INITIAL_MESSAGE])}
                      className="font-mono text-[10px] uppercase tracking-[0.15em] text-paper/70 transition-colors hover:text-clay"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="border border-paper/30 p-1.5 text-paper/80 transition-colors hover:border-clay hover:text-clay"
                    title="Close"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="custom-scrollbar flex-1 overflow-y-auto px-5 py-6">
                <div className="flex flex-col gap-6">
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}
                    >
                      {msg.role === "user" ? (
                        <div className="torn-swatch max-w-[85%] bg-ink px-4 py-2.5 font-serif text-sm leading-relaxed text-paper">
                          {msg.content}
                        </div>
                      ) : (
                        <div className="max-w-full">
                          <div className="flex gap-3">
                            <span className="mt-1 shrink-0 select-none font-serif text-sm text-clay" aria-hidden>
                              ✳
                            </span>
                            <div className="font-serif text-sm leading-relaxed text-ink [&_p]:mb-2 [&_p:last-child]:mb-0">
                              <ReactMarkdown
                                components={{
                                  strong: ({ children }) => (
                                    <strong className="font-semibold text-ink">{children}</strong>
                                  ),
                                  ul: ({ children }) => (
                                    <ul className="mb-2 list-disc pl-4 marker:text-clay">{children}</ul>
                                  ),
                                  a: ({ children, href }) => (
                                    <a
                                      href={href}
                                      className="text-clay underline decoration-1 underline-offset-2"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      {children}
                                    </a>
                                  ),
                                }}
                              >
                                {msg.content || "…"}
                              </ReactMarkdown>
                            </div>
                          </div>
                          {msg.action && (
                            <button
                              onClick={() => onNavigate(msg.action!.target, msg.action!.filter)}
                              className="mt-3 ml-7 flex items-center gap-2 border border-clay px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-clay transition-colors hover:bg-clay hover:text-paper"
                            >
                              <CornerDownRight size={12} />
                              Go to {msg.action.label}
                            </button>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {streaming && messages[messages.length - 1]?.role === "user" && (
                    <div className="flex gap-3">
                      <span className="mt-1 font-serif text-sm text-clay" aria-hidden>
                        ✳
                      </span>
                      <span className="font-serif text-sm italic text-ink-soft">
                        Consulting the records<span className="ink-cursor">▍</span>
                      </span>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              </div>

              {/* Suggestions + input */}
              <div className="shrink-0 border-t border-line px-5 pb-5 pt-3">
                {messages.length <= 1 && (
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        disabled={streaming}
                        className="border border-line px-2.5 py-1.5 font-serif text-xs italic text-ink-soft transition-colors hover:border-clay hover:text-clay disabled:opacity-50"
                      >
                        “{s}”
                      </button>
                    ))}
                  </div>
                )}
                <form
                  onSubmit={handleSubmit}
                  className="flex items-stretch border border-line-strong bg-paper-raised focus-within:border-ink"
                >
                  <input
                    ref={inputRef}
                    className="min-w-0 flex-1 bg-transparent px-4 py-3 font-serif text-sm text-ink placeholder:italic placeholder:text-ink-soft/70 focus:outline-none"
                    placeholder="Ask the archive…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <button
                    disabled={!input.trim() || streaming}
                    className="flex items-center justify-center border-l border-line-strong bg-ink px-4 text-paper transition-colors hover:bg-clay disabled:opacity-40"
                    title="Send"
                  >
                    <ArrowRight size={16} />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
