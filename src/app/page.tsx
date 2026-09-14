"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Sparkles, Briefcase, FileText, User, Search, MoreHorizontal, ArrowRight, Smile, Layers, Trash2, X, ExternalLink, Github, FolderGit2 } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { ProjectDeck } from "@/components/project-deck";
import { useContent, ProjectData } from "@/hooks/use-content";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { LiquidFilters } from "@/components/ui/liquid-filters";
import { GlassCard } from "@/components/ui/glass-card";
import { AboutDeck } from "@/components/about-deck";
import { SkillsDeck } from "@/components/skills-deck";
import { ContactDeck } from "@/components/contact-deck";
import { PortfolioDetails } from "@/components/portfolio-details";
import { AppleEmoji } from "@/components/ui/apple-emoji";
import { TextReveal } from "@/components/motion/text-reveal";
import { EASE_OUT } from "@/lib/ease";
import ReactMarkdown from "react-markdown";
import { QuickAction } from "@/components/ui/quick-action";
import { BackgroundCanvas } from "@/components/ui/background-canvas";
import {
  VsCodeIcon,
  PythonIcon,
  TensorFlowIcon,
  MacOSFolderIcon
} from "@/components/ui/macos-desktop-icons";

function formatProjectDescription(text: string): string {
  if (!text) return "";
  // Convert unicode bullets (•, ·) at line starts to standard markdown list item "- "
  let md = text.replace(/^[•·]\s*/gm, "- ");
  // Ensure lists have a preceding blank line if preceded by normal text
  md = md.replace(/([^\n])\n(- |\* |\+ |\d+\. )/g, "$1\n\n$2");
  // Separate lines with double newlines so paragraphs don't collapse together
  md = md.replace(/([^\n])\n([^\n\-*+\d•#>\s])/g, "$1\n\n$2");
  return md;
}

export default function Home() {
  const [viewState, setViewState] = useState<"landing" | "chat">("landing");
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedDesktopId, setSelectedDesktopId] = useState<string | null>(null);
  const isDraggingRef = useRef(false);
  const pointerDownPosRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const didActuallyDragRef = useRef(false);
  const [zIndices, setZIndices] = useState<Record<string, number>>({});
  const topZRef = useRef(1);

  const bringToFront = (id: string) => {
    topZRef.current += 1;
    const newZ = topZRef.current;
    setZIndices(prev => ({ ...prev, [id]: newZ }));
  };

  // Import Message type from shared types
  type Message = import("@/types/chat").Message;

  const INITIAL_MESSAGE: Message = { role: "ai", content: "Hello! How can I help you today?" };
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [streaming, setStreaming] = useState(false);

  // Data Hooks
  const { projects, skills, profile } = useContent();

  // Modal State
  const [selectedProject, setSelectedProject] = useState<{ project: ProjectData; deckId: string } | null>(null);
  const [showPortfolioInfo, setShowPortfolioInfo] = useState(false);

  // Auto-scroll handler: scroll to component top if deck is rendered, otherwise bottom
  useEffect(() => {
    if (viewState === "chat") {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.type === "component") {
        const el = document.getElementById(`message-${messages.length - 1}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
      }
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, viewState]);

  // Matches simple greetings only (e.g. "hi", "hello there", "hey!") — not questions that happen to start with one.
  const GREETING_REGEX = /^(hi+|hello+|hey+|yo+|sup|howdy|good\s?(morning|afternoon|evening|day))\s*(there|team|friend)?[\s,!.]*$/i;

  const checkLocalIntent = (query: string) => {
    const lower = query.toLowerCase().trim();

    if (GREETING_REGEX.test(lower)) return "greeting";

    // Skip local logic for complex queries
    if (lower.length > 50 || lower.includes("what is") || lower.includes("how does") || lower.includes("explain")) return null;

    if (lower.includes("project") && (lower.includes("show") || lower.includes("see") || lower.includes("list"))) return "projects";
    if (lower.includes("skill") && (lower.includes("what") || lower.includes("show") || lower.includes("see"))) return "skills";
    if (lower.includes("contact") || lower.includes("reach")) return "contact";

    // Strict match for 'About' / Profile
    if (lower === "about" || lower === "about me" || lower.includes("who are you") || lower.includes("tell me about yourself") || lower.includes("profile")) return "about";

    return null;
  }

  const sendMessage = async (query: string) => {
    // Optimistic UI Update
    setMessages(prev => [...prev, { role: "user", content: query }]);

    // 1. Local Intent Check
    const localIntent = checkLocalIntent(query);
    if (localIntent) {
      // Simulate network latency
      setStreaming(true);

      const responses: Record<string, string[]> = {
        projects: ["Here are some of my recent projects 🚀", "Check out what I've been working on! 💻", "My project deck, coming right up!", "Here you go, my portfolio highlights."],
        skills: ["Here is my technical arsenal 🛠️", "These are the tools I work with.", "My skills and tech stack.", "Here is what I am good at."],
        contact: ["Let's connect! 📬", "Here is how you can reach me.", "Don't be a stranger, say hi!", "My contact channels:"],
        about: ["Here is my professional profile 👨‍💻", "A little bit about me.", "Here is my bio and background.", "Allow me to introduce myself."],
        greeting: ["Hi there! 👋 Ask me about my projects, skills, or background.", "Hey! What would you like to know about me?", "Hello! Feel free to ask about my work, skills, or how to reach me.", "Hi! I'm happy to talk about my projects, skills, or experience."]
      };

      const randomResponse = (type: string) => {
        const list = responses[type] || ["Here you go!"];
        return list[Math.floor(Math.random() * list.length)];
      };

      setTimeout(() => {
        const naturalText = randomResponse(localIntent);

        setMessages(prev => [
          ...prev,
          // Response Text
          { role: "ai", content: naturalText },
          // Component Render (greetings have no deck to show)
          ...(localIntent === "greeting" ? [] : [{ role: "ai" as const, content: "", type: "component" as const, componentType: localIntent as Message['componentType'] }])
        ]);
        setStreaming(false);
      }, 600);
      return;
    }

    // 2. RAG Fallback
    setStreaming(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: [...messages, { role: "user", content: query }] }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errorMessage = typeof errData.error === 'string' ? errData.error : JSON.stringify(errData);
        throw new Error(errorMessage || "Failed to fetch response");
      }

      // Placeholder for streaming response
      setMessages(prev => [...prev, { role: "ai", content: "" }]);

      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullContent = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        fullContent += chunkValue;

        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg.role === 'ai') {
            // Filter control tags
            lastMsg.content = fullContent.replace(/\[SHOW_.*?\]/g, "");
          }
          return newMessages;
        });
      }

      // Post-Stream Action Check
      // Matches: [SHOW_TAG] or [SHOW_TAG:param]
      const tagMatch = fullContent.match(/\[SHOW_([A-Z]+)(?::(.*))?\]/i);

      if (tagMatch) {
        const tagType = tagMatch[1].toUpperCase();
        const tagParam = tagMatch[2]?.trim();

        let componentType: Message["componentType"] = undefined;
        let componentFilter: string | undefined = undefined;

        if (tagType === "PROJECTS") {
          componentType = "projects";
          componentFilter = tagParam;
        }
        if (tagType === "SKILLS") componentType = "skills";
        if (tagType === "CONTACT") componentType = "contact";
        if (tagType === "ABOUT") componentType = "about";

        // About Deck Sub-Sections
        if (tagType === "EXPERIENCE") {
          componentType = "about";
          componentFilter = "experiences";
        }
        if (tagType === "EDUCATION") {
          componentType = "about";
          componentFilter = "education";
        }
        if (tagType === "ACHIEVEMENTS") {
          componentType = "about";
          componentFilter = "achievements";
        }
        if (tagType === "CERTIFICATIONS") {
          componentType = "about";
          componentFilter = "certifications";
        }

        if (componentType) {
          setMessages(prev => [
            ...prev,
            {
              role: "ai",
              content: `Here is the ${tagType.toLowerCase()} section${tagParam ? ` for "${tagParam}"` : ''}:`,
              type: "component",
              componentType,
              componentFilter
            }
          ]);
        }
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "ai", content: "Oops! My brain is cloud-gazing right now ☁️. Please try asking me again in a moment." }]);
    } finally {
      setStreaming(false);
    }
  };

  const handleStartChat = (initialQuery?: string) => {
    setViewState("chat");
    if (initialQuery) {
      sendMessage(initialQuery);
    }
  };



  const handleBack = () => {
    setViewState("landing");
    setMessages([INITIAL_MESSAGE]);
  };

  const handleClearChat = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;
    sendMessage(input);
    setInput("");
  }


  const ACTION_ITEMS = [
    { icon: Smile, label: "About Me", prompt: "Tell me about yourself" },
    { icon: Briefcase, label: "Projects", prompt: "Show me your projects" },
    { icon: Layers, label: "Skills", prompt: "What are your skills?" },
    { icon: User, label: "Contact", prompt: "How can I contact you?" }
  ];

  // Only break at underscores/dots/hyphens (like a real filename), never mid-word.
  const renderBreakableTitle = (title: string) =>
    title.split(/(?<=[_.-])/).map((part, i) => (
      <span key={i}>
        {part}
        <wbr />
      </span>
    ));

  interface DesktopItem {
    id: string;
    type: 'app' | 'folder' | 'image';
    title: string;
    icon?: 'vscode' | 'python' | 'tensorflow';
    imageUrl?: string;
    orientation?: 'portrait' | 'landscape';
    action?: 'about-portfolio' | 'open-project';
    prompt?: string;
    x: number;
    y: number;
    mobileX?: number;
    mobileY?: number;
  }

  const FIXED_DESKTOP_ITEMS: DesktopItem[] = [
    {
      id: 'app-vscode',
      type: 'app' as const,
      title: 'VS Code',
      icon: 'vscode' as const,
      prompt: 'Show me your projects and code',
      x: 20,
      y: 12,
      mobileX: 14,
      mobileY: 8,
    },
    {
      id: 'folder-projects',
      type: 'folder' as const,
      title: 'projects',
      prompt: 'Show me your projects',
      x: 9,
      y: 18,
      mobileX: 14,
      mobileY: 20,
    },
    {
      id: 'img-aide',
      type: 'image' as const,
      title: 'aid-e.jpg',
      imageUrl: '/aid-e.jpg',
      orientation: 'landscape' as const,
      prompt: 'Show me your projects',
      x: 8,
      y: 74,
      mobileX: 14,
      mobileY: 74,
    },
    {
      id: 'app-python',
      type: 'app' as const,
      title: 'Python',
      icon: 'python' as const,
      prompt: 'Tell me about your Python and AI experience',
      x: 20,
      y: 84,
      mobileX: 14,
      mobileY: 86,
    },
    {
      id: 'img-profile',
      type: 'image' as const,
      title: 'profile-pic.jpg',
      imageUrl: '/profile-pic.jpg',
      orientation: 'portrait' as const,
      prompt: 'Tell me about yourself',
      x: 76,
      y: 14,
      mobileX: 84,
      mobileY: 8,
    },
    {
      id: 'folder-social',
      type: 'folder' as const,
      title: 'skills & stack',
      prompt: 'What are your skills?',
      x: 89,
      y: 18,
      mobileX: 84,
      mobileY: 20,
    },
    {
      id: 'app-tensorflow',
      type: 'app' as const,
      title: 'TensorFlow',
      icon: 'tensorflow' as const,
      prompt: 'What are your skills?',
      x: 90,
      y: 52,
      mobileX: 84,
      mobileY: 74,
    },
    {
      id: 'folder-contact',
      type: 'folder' as const,
      title: 'contact',
      prompt: 'How can I contact you?',
      x: 84,
      y: 82,
      mobileX: 84,
      mobileY: 86,
    },
  ];

  return (
    <motion.main
      onClick={() => setSelectedDesktopId(null)}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) setSelectedDesktopId(null);
      }}
      className="relative flex h-[100dvh] w-full flex-col items-center overflow-hidden text-neutral-900 selection:bg-neutral-200 select-none"
    >
      <BackgroundCanvas />
      <LiquidFilters />

      <AnimatePresence>
        {showPortfolioInfo && (
          <PortfolioDetails onClose={() => setShowPortfolioInfo(false)} />
        )}
      </AnimatePresence>

      {/* Floating Desktop Items (Landing Mode) */}
      <AnimatePresence>
        {viewState === "landing" && (
          <div className="absolute inset-0 pointer-events-none z-30">
            {FIXED_DESKTOP_ITEMS.map((item) => {
              const isSelected = selectedDesktopId === item.id;
              const itemZIndex = zIndices[item.id] ?? 1;

              const handleItemAction = () => {
                if ('action' in item && item.action === 'about-portfolio') {
                  setShowPortfolioInfo(true);
                } else if (item.prompt) {
                  handleStartChat(item.prompt);
                }
              };

              return (
                <motion.div
                  key={item.id}
                  drag
                  dragMomentum={false}
                  dragElastic={0}
                  whileDrag={{ opacity: 0.9, scale: 1.05 }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    bringToFront(item.id);
                    setSelectedDesktopId(item.id);
                    pointerDownPosRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
                    didActuallyDragRef.current = false;
                  }}
                  onDrag={(e, info) => {
                    if (Math.hypot(info.offset.x, info.offset.y) > 8) {
                      didActuallyDragRef.current = true;
                      isDraggingRef.current = true;
                    }
                  }}
                  onDragStart={() => {
                    bringToFront(item.id);
                    setSelectedDesktopId(item.id);
                  }}
                  onDragEnd={() => {
                    setTimeout(() => {
                      isDraggingRef.current = false;
                      didActuallyDragRef.current = false;
                    }, 120);
                  }}
                  onPointerUp={(e) => {
                    if (pointerDownPosRef.current) {
                      const dx = e.clientX - pointerDownPosRef.current.x;
                      const dy = e.clientY - pointerDownPosRef.current.y;
                      const dist = Math.hypot(dx, dy);
                      const dt = Date.now() - pointerDownPosRef.current.time;
                      pointerDownPosRef.current = null;

                      // If tapped without dragging (< 12px jitter and < 500ms)
                      if (!didActuallyDragRef.current && dist < 12 && dt < 500) {
                        if (typeof window !== 'undefined' && window.innerWidth < 640) {
                          handleItemAction();
                        }
                      }
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (didActuallyDragRef.current || isDraggingRef.current) return;
                    bringToFront(item.id);
                    setSelectedDesktopId(item.id);

                    if (typeof window !== 'undefined' && window.innerWidth < 640) {
                      handleItemAction();
                    }
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (didActuallyDragRef.current || isDraggingRef.current) return;
                    handleItemAction();
                  }}
                  className="desktop-icon-item pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center select-none cursor-pointer group touch-none"
                  style={{
                    '--item-x': `${item.x}%`,
                    '--item-y': `${item.y}%`,
                    '--item-x-mobile': `${item.mobileX ?? item.x}%`,
                    '--item-y-mobile': `${item.mobileY ?? item.y}%`,
                    zIndex: itemZIndex,
                  } as React.CSSProperties}
                >
                  {/* Icon Container with Selection Highlight Box */}
                  <div className={`p-1 rounded-2xl flex items-center justify-center transition-all duration-150 pointer-events-none ${isSelected
                    ? 'bg-black/10 border-2 border-white/80 shadow-xs backdrop-blur-xs'
                    : 'bg-transparent border-2 border-transparent'
                    }`}>
                    {/* ITEM TYPE: Folder */}
                    {item.type === 'folder' && (
                      <MacOSFolderIcon className="w-12 h-auto sm:w-14 sm:h-auto drop-shadow-md" />
                    )}

                    {/* ITEM TYPE: App */}
                    {item.type === 'app' && (
                      <>
                        {item.icon === 'vscode' && <VsCodeIcon className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-lg" />}
                        {item.icon === 'python' && <PythonIcon className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-lg" />}
                        {item.icon === 'tensorflow' && <TensorFlowIcon className="w-12 h-12 sm:w-14 sm:h-14" />}
                      </>
                    )}

                    {/* ITEM TYPE: Image Preview */}
                    {item.type === 'image' && (
                      <div className={`rounded-xl overflow-hidden border-[1.5px] border-white shadow-[0_2px_6px_rgba(0,0,0,0.18)] bg-white shrink-0 ${'orientation' in item && item.orientation === 'landscape'
                        ? 'w-16 h-11 sm:w-18 sm:h-12'
                        : 'w-11 h-14 sm:w-12 sm:h-16'
                        }`}>
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className={`w-full h-full object-cover ${item.id === 'img-aide' ? 'object-[center_62%]' : 'object-[center_20%]'}`}
                          draggable={false}
                        />
                      </div>
                    )}
                  </div>

                  {/* Selection Label Pill */}
                  <div className="mt-1.5 flex justify-center pointer-events-none">
                    <span
                      className={`max-w-[86px] sm:max-w-[88px] whitespace-nowrap sm:whitespace-normal line-clamp-1 sm:line-clamp-2 text-[10px] sm:text-xs font-medium tracking-tight px-1.5 py-0.5 rounded-[5px] transition-colors text-center ${isSelected
                        ? 'bg-[#007AFF] text-white shadow-xs'
                        : 'text-neutral-800'
                        }`}
                    >
                      {renderBreakableTitle(item.title)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Landing View */}
      <AnimatePresence mode="wait">
        {viewState === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            transition={{ duration: 0.4 }}
            className="relative z-30 flex w-full max-w-3xl flex-1 flex-col items-center justify-center overflow-y-auto custom-scrollbar px-4 text-center pt-6 sm:pt-8 pb-32 sm:pb-28 pointer-events-none"
          >
            {/* About Badge Callout */}
            <motion.div className="mb-3 sm:mb-4 pointer-events-auto">
              <div
                onClick={() => setShowPortfolioInfo(true)}
                className="cursor-pointer transform hover:scale-105 transition-transform"
              >
                <LiquidGlass type="button" className="rounded-full px-4 py-2.5 sm:px-4 sm:py-1.5 border border-white/80 shadow-md hover:bg-white/60 transition-colors">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-stone-800">
                    <Sparkles size={14} className="text-neutral-500" />
                    <span>About this Portfolio</span>
                  </div>
                </LiquidGlass>
              </div>
            </motion.div>

            {/* Main Hero Title Line */}
            <div className="relative z-20 pointer-events-none w-full flex flex-col items-center">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight pb-1 leading-tight flex items-center justify-center gap-1.5 sm:gap-2 pointer-events-auto">
                <motion.span
                  className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-b from-neutral-800 to-neutral-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: "0.5em", filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.3 }}
                >
                  Hi, I&apos;m Daniel Rangga
                  <AppleEmoji emoji="👋" className="w-[0.9em] h-[0.9em]" />
                </motion.span>
              </h1>
              <TextReveal
                as="p"
                text="Welcome to my interactive portfolio."
                className="mt-1 text-xs sm:text-base md:text-lg font-medium text-neutral-600 max-w-xs sm:max-w-md md:max-w-xl pointer-events-auto"
                whileInView={false}
                delay={0.325}
                stagger={0.025}
                yOffset="0.5em"
                blur={4}
              />
            </div>

            {/* Center Folder Graphic */}
            <div className="relative my-2.5 sm:my-4 transition-all duration-300 z-20 pointer-events-auto flex items-center justify-center">
              <div
                onClick={() => handleStartChat("Show me your projects")}
                className="cursor-pointer group flex flex-col items-center justify-center transform hover:scale-105 transition-all duration-300"
                title="Click to view projects"
              >
                <MacOSFolderIcon className="w-20 h-auto sm:w-28 sm:h-auto md:w-36 md:h-auto drop-shadow-2xl transition-transform group-hover:rotate-1" />

                {/* Pointer Cursor overlay */}
                <div className="absolute -bottom-1.5 -right-1.5 sm:-bottom-3 sm:-right-3 pointer-events-none transform -rotate-12 drop-shadow-xl">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 fill-white stroke-stone-900" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M3 3L10.07 19.97L13.58 13.58L19.97 10.07L3 3Z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Sub-headline Text */}
            <TextReveal
              as="p"
              text="Here, you can explore my projects, skills, and experience, and even ask the AI directly about my work."
              className="mt-1.5 sm:mt-3 max-w-xs sm:max-w-md md:max-w-xl text-xs sm:text-base text-neutral-600 leading-relaxed font-medium px-2 pointer-events-auto"
              whileInView={false}
              delay={0.525}
              stagger={0.025}
              yOffset="0.4em"
              blur={3}
            />

            {/* Quick Actions Grid (Landing) */}
            <div className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 w-full max-w-4xl px-2 pointer-events-auto">
              {ACTION_ITEMS.map((item) => (
                <QuickAction
                  key={item.label}
                  layoutId={`action-${item.label}`}
                  icon={item.icon}
                  label={item.label}
                  onClick={() => handleStartChat(item.prompt)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat View */}
      <AnimatePresence>
        {viewState === "chat" && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-0 flex flex-col overflow-hidden"
          >
            {/* Header (floats above the scrolling messages) */}
            <div className="absolute top-0 left-0 right-0 z-30 flex w-full px-3 sm:px-4 py-2 sm:py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
              <LiquidGlass
                type="button"
                onClick={handleBack}
                className="rounded-[1.5rem] px-4 sm:px-4 py-3.5 sm:py-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-700">
                  <ArrowLeft size={15} />
                  Back
                </div>
              </LiquidGlass>
            </div>

            {/* Progressive blur: fades scrolled content out under the header toolbar */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 z-20 h-20 sm:h-24"
              style={{
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                maskImage: "linear-gradient(to bottom, black 0%, black 35%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 35%, transparent 100%)",
              }}
            />

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 custom-scrollbar pt-16 sm:pt-20">
              <div className="mx-auto flex max-w-2xl flex-col gap-6 sm:gap-8 pb-60 sm:pb-64">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    id={`message-${i}`}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"} ${msg.type === "component" ? "-mt-6" : ""}`}
                  >
                    {msg.role === "user" ? (
                      <div className="bg-black text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl rounded-tr-sm text-xs sm:text-sm font-medium max-w-[88%] sm:max-w-[80%] shadow-lg">
                        {msg.content}
                      </div>
                    ) : (
                      <div className={`relative max-w-[100%] ${msg.type === "component" ? "w-full" : ""}`}>
                        {msg.type === "component" ? (
                          msg.componentType === "about" ? (
                            <div className="-ml-4 w-[calc(100%+2rem)] md:w-full md:ml-0 px-4 md:px-0">
                              <AboutDeck
                                profile={profile}
                                visibleSections={msg.componentFilter ? [msg.componentFilter] : undefined}
                              />
                            </div>
                          ) : msg.componentType === "skills" ? (
                            <div className="-ml-4 w-[calc(100%+2rem)] md:w-full md:ml-0 px-4 md:px-0">
                              <SkillsDeck skills={skills} />
                            </div>
                          ) : msg.componentType === "contact" ? (
                            <div className="-ml-4 w-[calc(100%+2rem)] md:w-full md:ml-0 px-4 md:px-0">
                              <ContactDeck profile={profile} />
                            </div>
                          ) : (
                            <div className="-ml-4 w-[calc(100%+2rem)] md:w-full md:ml-0 px-4 md:px-0">
                              <ProjectDeck
                                id={`deck-${i}`}
                                projects={projects}
                                onSelect={(project) => setSelectedProject({ project, deckId: `deck-${i}` })}
                                filter={msg.componentFilter}
                              />
                            </div>
                          )
                        ) : (
                          <LiquidGlass type="button" className="rounded-2xl rounded-tl-sm">
                            <div className="p-3.5 sm:p-4 text-xs sm:text-sm font-medium text-neutral-700 leading-relaxed">
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                  strong: ({ children }) => <span className="font-bold text-neutral-900">{children}</span>,
                                  ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                                  li: ({ children }) => <li>{children}</li>,
                                  a: ({ children, href }) => <a href={href} className="text-neutral-900 underline font-medium" target="_blank" rel="noopener noreferrer">{children}</a>
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          </LiquidGlass>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
                <div ref={bottomRef} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Controls */}
      <AnimatePresence>
        {!selectedProject && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-3 sm:bottom-6 left-0 right-0 z-40 flex flex-col items-center gap-2 sm:gap-3 px-3 sm:px-4 pb-[env(safe-area-inset-bottom)]"
          >
            {/* Quick Actions (Chat Mode) */}
            <AnimatePresence>
              {viewState === "chat" && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-wrap justify-center gap-1.5 sm:gap-2"
                >
                  {ACTION_ITEMS.map((item) => (
                    <QuickAction
                      key={item.label}
                      layoutId={`action-${item.label}`}
                      icon={item.icon}
                      label={item.label}
                      onClick={() => handleStartChat(item.prompt)}
                      compact
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="w-full max-w-lg flex items-center">
              {/* Pure CSS grid-collapse: 0fr<->1fr transitions natively, no layout-diffing
                  ambiguity. The sibling input grows "for free" every repaint frame as this
                  track shrinks — no separate transition needed on its side. */}
              <div
                className="grid overflow-hidden py-4 -my-4 pl-2 -ml-2 transition-[grid-template-columns] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ gridTemplateColumns: viewState === "chat" ? "1fr" : "0fr" }}
              >
                <div className="min-w-0 pr-2 py-4 -my-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: viewState === "chat" ? 1 : 0 }}
                    transition={{ duration: viewState === "chat" ? 0.2 : 0.15 }}
                  >
                    <LiquidGlass
                      type="button"
                      onClick={handleClearChat}
                      className={`rounded-[1.5rem] !overflow-hidden cursor-pointer shadow-md px-4 sm:px-4 py-3.5 sm:py-3 ${viewState !== "chat" ? "pointer-events-none select-none" : ""
                        }`}
                      style={{ overflow: "hidden" }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      tabIndex={viewState === "chat" ? 0 : -1}
                      aria-hidden={viewState !== "chat"}
                    >
                      <motion.div
                        className="flex items-center justify-center text-xs sm:text-sm font-semibold text-neutral-600 hover:text-red-500 transition-colors whitespace-nowrap"
                        initial={false}
                        animate={{
                          opacity: viewState === "chat" ? 1 : 0,
                          scale: viewState === "chat" ? 1 : 0.95,
                        }}
                        transition={{
                          duration: viewState === "chat" ? 0.22 : 0.08,
                          delay: viewState === "chat" ? 0.08 : 0,
                          ease: viewState === "chat" ? [0.16, 1, 0.3, 1] : "easeOut",
                        }}
                      >
                        Clear
                      </motion.div>
                    </LiquidGlass>
                  </motion.div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <LiquidGlass type="input" className="w-full rounded-[1.5rem] shadow-2xl">
                  <form onSubmit={handleSubmit} className="relative flex items-center p-1.5 sm:p-2">
                    <div className="pl-2 sm:pl-4 text-neutral-400">
                      <Search size={18} className="sm:w-5 sm:h-5" />
                    </div>
                    <input
                      ref={inputRef}
                      className="flex-1 bg-transparent px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-neutral-800 placeholder-neutral-400 outline-none font-medium min-w-0"
                      placeholder={viewState === 'landing' ? "Ask anything..." : "Reply..."}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onFocus={() => { if (viewState === 'landing') handleStartChat(); }}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={!input.trim() || streaming}
                      className="flex items-center justify-center rounded-full bg-black p-3.5 sm:p-3 text-white transition disabled:opacity-50 shadow-md shrink-0"
                    >
                      <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </motion.button>
                  </form>
                </LiquidGlass>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Modal Root */}
      <AnimatePresence>
        {selectedProject && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-3 sm:p-5 md:p-8 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
              <GlassCard
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="pointer-events-auto relative flex h-[90vh] sm:h-[84vh] max-h-[880px] w-full max-w-5xl lg:max-w-6xl flex-col overflow-y-auto md:overflow-hidden !border-neutral-200 !bg-white shadow-2xl !overflow-hidden rounded-3xl"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute right-3.5 top-3.5 sm:right-5 sm:top-5 z-50 rounded-full bg-white/90 backdrop-blur-sm p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 shadow-sm transition-colors"
                  title="Close modal"
                >
                  <X size={20} />
                </button>

                {/* Content Container with matching rounded corners */}
                <div className="flex flex-col md:flex-1 md:flex-row md:min-h-0 md:overflow-hidden rounded-3xl">
                  {/* Visual Side */}
                  <div className={`relative w-full h-72 md:h-auto md:w-[46%] lg:w-[44%] ${selectedProject.project.gradient || 'bg-neutral-100'} shrink-0 overflow-hidden rounded-t-3xl md:rounded-tr-none md:rounded-l-3xl`}>
                    {selectedProject.project.image_url ? (
                      <>
                        <Image
                          src={selectedProject.project.image_url}
                          alt={selectedProject.project.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/10" />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] flex items-center justify-center">
                        <FolderGit2 className="text-neutral-400/50 w-20 h-20" />
                      </div>
                    )}
                  </div>

                  {/* Info Side */}
                  <div className="flex w-full flex-col md:h-full md:w-[54%] lg:w-[56%] md:min-h-0 bg-white rounded-b-3xl md:rounded-bl-none md:rounded-r-3xl overflow-hidden">
                    {/* Fixed Header */}
                    <div className="p-5 sm:p-6 pb-3.5 shrink-0 border-b border-neutral-100">
                      <h2 className="text-lg sm:text-xl font-bold text-neutral-900 pr-10 leading-snug">
                        {selectedProject.project.title}
                      </h2>
                      {selectedProject.project.category && (
                        <span className="inline-block mt-2 px-2.5 py-0.5 bg-neutral-100 border border-neutral-200/80 rounded-full text-neutral-600 text-xs font-semibold">
                          {selectedProject.project.category}
                        </span>
                      )}
                    </div>

                    {/* Scrollable Content */}
                    <div className="md:flex-1 md:overflow-y-auto custom-scrollbar p-5 sm:p-6 pt-5">
                      {/* Markdown formatted description */}
                      <div className="text-sm sm:text-base leading-relaxed text-neutral-600">
                        <ReactMarkdown
                          components={{
                            h1: ({ children }) => <h1 className="text-base sm:text-lg font-bold text-neutral-900 mt-4 mb-2">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-sm sm:text-base font-bold text-neutral-900 mt-3.5 mb-1.5">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 mt-3 mb-1">{children}</h3>,
                            p: ({ children }) => <p className="mb-3 leading-relaxed text-neutral-600 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold text-neutral-900">{children}</strong>,
                            em: ({ children }) => <em className="italic text-neutral-700">{children}</em>,
                            ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1.5 text-neutral-600">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-1.5 text-neutral-600">{children}</ol>,
                            li: ({ children }) => <li className="pl-1 leading-relaxed [&>p]:mb-1 [&>p:last-child]:mb-0">{children}</li>,
                            a: ({ children, href }) => (
                              <a
                                href={href}
                                className="text-neutral-900 underline font-medium hover:text-black transition-colors"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {children}
                              </a>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-3 border-neutral-300 pl-3.5 py-1 my-3 text-neutral-500 italic bg-neutral-50 rounded-r">
                                {children}
                              </blockquote>
                            ),
                            code: ({ children, className }) => {
                              const isInline = !className;
                              return isInline ? (
                                <code className="bg-neutral-100 text-neutral-800 text-xs px-1.5 py-0.5 rounded font-mono border border-neutral-200/80">
                                  {children}
                                </code>
                              ) : (
                                <pre className="bg-neutral-900 text-neutral-100 text-xs p-3.5 rounded-xl overflow-x-auto font-mono my-3 shadow-inner">
                                  <code>{children}</code>
                                </pre>
                              );
                            },
                          }}
                        >
                          {formatProjectDescription(selectedProject.project.description || "")}
                        </ReactMarkdown>
                      </div>

                      {/* Skills Section */}
                      {selectedProject.project.tags && selectedProject.project.tags.length > 0 && (
                        <div className="mt-8">
                          <h3 className="text-xs sm:text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">
                            Skills Used
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedProject.project.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-xs sm:text-sm font-medium border border-neutral-200/80"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Links */}
                      <div className="mt-8 flex flex-wrap gap-3 pb-8">
                        {/* Standard Buttons */}
                        {selectedProject.project.demo_link && (
                          <a
                            href={selectedProject.project.demo_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 font-semibold text-white transition hover:bg-neutral-800 flex-1 min-w-[140px] shadow-sm"
                          >
                            <ExternalLink size={18} /> Visit Live
                          </a>
                        )}
                        {selectedProject.project.repo_link && (
                          <a
                            href={selectedProject.project.repo_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-3 font-semibold text-neutral-700 transition hover:bg-neutral-50 flex-1 min-w-[140px] shadow-sm"
                          >
                            <Github size={18} /> Code
                          </a>
                        )}

                        {/* Custom Buttons */}
                        {selectedProject.project.custom_links?.map((link, i) => (
                          <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-3 font-semibold text-neutral-700 transition hover:bg-neutral-50 flex-1 min-w-[140px] shadow-sm"
                          >
                            <ExternalLink size={18} className="text-neutral-400" /> {link.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </>
        )}
      </AnimatePresence>

    </motion.main>
  );
}
