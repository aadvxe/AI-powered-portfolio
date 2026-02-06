"use client";

import { motion, AnimatePresence, useSpring, useMotionValue, useMotionTemplate } from "framer-motion";
import { ArrowLeft, Send, Sparkles, Briefcase, FileText, User, Search, MoreHorizontal, ArrowRight, Smile, Layers, Trash2, X, ExternalLink, Github } from "lucide-react";
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
import { LoopingTypewriter } from "@/components/ui/looping-typewriter";
import ReactMarkdown from "react-markdown";
import { QuickAction } from "@/components/ui/quick-action";

export default function Home() {
  const [viewState, setViewState] = useState<"landing" | "chat">("landing");
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Import Message type from shared types
  type Message = import("@/types/chat").Message;

  const INITIAL_MESSAGE: Message = { role: "ai", content: "Hello! How can I help you today?" };
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [streaming, setStreaming] = useState(false);

  // --- CONTENT HOOK ---
  const { projects, skills, profile } = useContent();

  // --- MODAL STATE ---
  const [selectedProject, setSelectedProject] = useState<{ project: ProjectData; deckId: string } | null>(null);
  const [showPortfolioInfo, setShowPortfolioInfo] = useState(false);

  // --- MOUSE FOLLOWER LOGIC ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    if (typeof window !== "undefined") {
        window.addEventListener('mousemove', handleMouseMove);
    }
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const backgroundStyle = useMotionTemplate`
    radial-gradient(
      circle at ${springX}px ${springY}px, 
      rgba(180, 220, 255, 0.3) 0%, 
      rgba(255, 200, 220, 0.2) 25%, 
      rgba(255, 255, 255, 0) 60%
    ),
    linear-gradient(to bottom right, #ffffff, #f8f9fa)
  `;

  // Focus input when switching to chat
  useEffect(() => {
    if (viewState === "chat" && inputRef.current && !selectedProject) {
        inputRef.current.focus();
    }
  }, [viewState, selectedProject]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (viewState === "chat") {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, viewState]);

  const checkLocalIntent = (query: string) => {
    const lower = query.toLowerCase();
    
    // Safety check: if query is complex question, skip local
    if (lower.length > 50 || lower.includes("what is") || lower.includes("how does") || lower.includes("explain")) return null;

    if (lower.includes("project") && (lower.includes("show") || lower.includes("see") || lower.includes("list"))) return "projects";
    if (lower.includes("skill") && (lower.includes("what") || lower.includes("show") || lower.includes("see"))) return "skills";
    if (lower.includes("contact") || lower.includes("reach")) return "contact";
    
    // Stricter 'About' check
    if (lower === "about" || lower === "about me" || lower.includes("who are you") || lower.includes("tell me about yourself")) return "about";
    
    return null;
  }

  const sendMessage = async (query: string) => {
    // Optimistic update
    setMessages(prev => [...prev, { role: "user", content: query }]);
    
    // --- 1. CHECK LOCAL INTENTS (Hybrid Mode) ---
    const localIntent = checkLocalIntent(query);
    if (localIntent) {
        // Simulate network delay for natural feel
        setStreaming(true);

        const responses: Record<string, string[]> = {
            projects: ["Here are some of my recent projects 🚀", "Check out what I've been working on! 💻", "My project deck, coming right up!", "Here you go, my portfolio highlights."],
            skills: ["Here is my technical arsenal 🛠️", "These are the tools I work with.", "My skills and tech stack.", "Here is what I am good at."],
            contact: ["Let's connect! 📬", "Here is how you can reach me.", "Don't be a stranger, say hi!", "My contact channels:"],
            about: ["Here is my professional profile 👨‍💻", "A little bit about me.", "Here is my bio and background.", "Allow me to introduce myself."]
        };

        const randomResponse = (type: string) => {
            const list = responses[type] || ["Here you go!"];
            return list[Math.floor(Math.random() * list.length)];
        };

        setTimeout(() => {
            const naturalText = randomResponse(localIntent);
                
            setMessages(prev => [
                ...prev, 
                // 1. Natural Text Bubble
                { role: "ai", content: naturalText },
                // 2. Component Card
                { role: "ai", content: "", type: "component", componentType: localIntent as Message['componentType'] }
            ]);
            setStreaming(false);
        }, 600);
        return; 
    }

    // --- 2. REMOTE RAG FALLBACK ---
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
        
        // Add placeholder for AI response
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
                    // Filter tags from display
                    lastMsg.content = fullContent.replace(/\[SHOW_.*?\]/g, "");
                }
                return newMessages;
            });
        }

        // --- POST STREAMING TAG CHECK (Enhanced for Parameters) ---
        // Regex matches: [SHOW_TAG] or [SHOW_TAG:param]
        const tagMatch = fullContent.match(/\[SHOW_([A-Z]+)(?::(.*))?\]/i);
        
        if (tagMatch) {
            const tagType = tagMatch[1].toUpperCase(); // e.g. PROJECTS
            const tagParam = tagMatch[2]?.trim();      // e.g. React (or undefined)
            
            let componentType: Message["componentType"] = undefined;
            let componentFilter: string | undefined = undefined;

            if (tagType === "PROJECTS") {
                componentType = "projects";
                componentFilter = tagParam;
            }
            if (tagType === "SKILLS") componentType = "skills";
            if (tagType === "CONTACT") componentType = "contact";
            if (tagType === "ABOUT") componentType = "about";
            
            // About Deck Sub-Sections (Experience, Education)
            if (tagType === "EXPERIENCE") {
                componentType = "about";
                componentFilter = "experiences"; // Pass as filter/section
            }
            if (tagType === "EDUCATION") {
                componentType = "about";
                componentFilter = "education";
            }
            if (tagType === "ACHIEVEMENTS") {
                componentType = "about";
                componentFilter = "achievements";
            }

            if (componentType) {
                setMessages(prev => [
                    ...prev, 
                    { 
                        role: "ai", 
                        content: `Here is the ${tagType.toLowerCase()} section${tagParam ? ` for "${tagParam}"` : ''}:`, 
                        type: "component", 
                        componentType,
                        componentFilter // Storing the filter param here
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

  return (
    <motion.main 
        className="relative flex min-h-screen flex-col items-center overflow-hidden text-neutral-900 selection:bg-brand-cyan/30"
        style={{ background: backgroundStyle }}
    >
      <LiquidFilters />
      
      <AnimatePresence>
        {showPortfolioInfo && (
            <PortfolioDetails onClose={() => setShowPortfolioInfo(false)} />
        )}
      </AnimatePresence>

      {/* --- LANDING VIEW --- */}

      {/* --- LANDING VIEW --- */}
      <AnimatePresence mode="wait">
        {viewState === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 text-center pb-20"
          >
            {/* Badge */}
            <motion.div className="mb-6">
               <div onClick={() => setShowPortfolioInfo(true)} className="cursor-pointer">
                   <LiquidGlass type="button" className="rounded-full px-4 py-2 hover:bg-white/50 transition-colors">
                     <div className="flex items-center gap-2 text-sm font-medium text-neutral-600">
                        <Sparkles size={14} className="text-brand-cyan" />
                        <span>About this Portfolio</span>
                     </div>
                   </LiquidGlass>
               </div>
            </motion.div>



            {/* Hero Title */}
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl pb-2 leading-tight min-h-[1.2em]">
              <LoopingTypewriter 
                phrases={[
                  { text: "Hi, I'm Rangga", emoji: "👋" },
                  { text: "AI Engineer," },
                  { text: "Embedded System & IoT Engineer," },
                  { text: "and Web Developer" }
                ]}
                className="bg-gradient-to-b from-neutral-800 to-neutral-600 bg-clip-text text-transparent"
                emojiClassName="text-neutral-800" // reset any weird gradient inheritance if needed, though split ensures it
                typingSpeed={80}
                deletingSpeed={40}
                pauseDuration={2500}
              />
            </h1>
            
            <p className="mt-6 max-w-md text-lg text-neutral-600 leading-relaxed">
               Welcome to my interactive portfolio. Here, you can explore my projects, skills, and experience, and even ask the AI directly about my work.
            </p>

            {/* Quick Actions Grid (Landing) */}
            <div className="mt-8 flex flex-wrap justify-center gap-4 w-full max-w-4xl">
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

      {/* --- CHAT VIEW --- */}
      <AnimatePresence>
        {viewState === "chat" && (
           <motion.div 
             key="chat"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="absolute inset-0 z-0 flex flex-col overflow-hidden"
           >
              {/* Header */}
              <div className="z-30 flex w-full items-center justify-between px-6 py-4 backdrop-blur-sm bg-white/30 sticky top-0">
                  <motion.button 
                    onClick={handleBack} 
                    className="flex items-center gap-2 rounded-[1.5rem] bg-white/50 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-white/80 transition-colors shadow-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                      <ArrowLeft size={16} />
                      Back
                  </motion.button>
              </div>


              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-4 custom-scrollbar pt-4">
                  <div className="mx-auto flex max-w-2xl flex-col gap-8 pb-48">
                      {messages.map((msg, i) => (
                          <motion.div 
                              key={i}
                              initial={{ opacity: 0, y: 20, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"} ${msg.type === "component" ? "-mt-6" : ""}`}
                          >
                                {msg.role === "user" ? (
                                    <div className="bg-black text-white px-5 py-3 rounded-2xl rounded-tr-sm text-sm font-medium max-w-[85%] shadow-lg">
                                        {msg.content}
                                    </div>
                                ) : (
                                    <div className={`relative max-w-[100%] ${msg.type === "component" ? "w-full" : ""}`}>
                                        {msg.type === "component" ? (
                                            msg.componentType === "about" ? (
                                                <div className="-ml-4 w-[100vw] md:w-full md:ml-0 px-4 md:px-0">
                                                    <AboutDeck 
                                                        profile={profile} 
                                                        visibleSections={msg.componentFilter ? [msg.componentFilter] : undefined} 
                                                    />
                                                </div>
                                            ) : msg.componentType === "skills" ? (
                                                <div className="-ml-4 w-[100vw] md:w-full md:ml-0 px-4 md:px-0">
                                                    <SkillsDeck skills={skills} />
                                                </div>
                                            ) : msg.componentType === "contact" ? (
                                                <div className="-ml-4 w-[100vw] md:w-full md:ml-0 px-4 md:px-0">
                                                    <ContactDeck profile={profile} />
                                                </div>
                                            ) : (
                                                <div className="-ml-4 w-[100vw] md:w-full md:ml-0">
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
                                               <div className="p-4 text-sm font-medium text-neutral-700 leading-relaxed">
                                                 <ReactMarkdown 
                                                    components={{
                                                        p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                                                        strong: ({children}) => <span className="font-bold text-neutral-900">{children}</span>,
                                                        ul: ({children}) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                                                        li: ({children}) => <li>{children}</li>,
                                                        a: ({children, href}) => <a href={href} className="text-brand-cyan hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>
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

      {/* --- BOTTOM CONTROLS (Fixed Liquid Bar) --- */}
      <AnimatePresence>
        {!selectedProject && (
          <motion.div 
            layout
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute bottom-6 left-0 right-0 z-20 flex flex-col items-center gap-4 px-4"
          >
              {/* Quick Actions (Chat Mode) */}
              <AnimatePresence>
                {viewState === "chat" && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="flex flex-wrap justify-center gap-2"
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

              <motion.div layout layoutId="search-container" className="w-full max-w-lg flex items-center gap-2">
                  <AnimatePresence>
                    {viewState === "chat" && (
                        <LiquidGlass
                            type="button"
                            layout
                            initial={{ opacity: 0, scale: 0.8, width: 0 }}
                            animate={{ opacity: 1, scale: 1, width: "auto" }}
                            exit={{ opacity: 0, scale: 0.8, width: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={handleClearChat}
                            className="rounded-[1.5rem] px-4 py-3 text-sm font-semibold text-neutral-500 hover:text-red-500 transition-colors whitespace-nowrap overflow-hidden"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Clear
                        </LiquidGlass>
                     )}
                  </AnimatePresence>
                 <motion.div layout className="flex-1 min-w-0">
                    <LiquidGlass type="input" className="w-full rounded-[1.5rem] shadow-2xl">
                     <form onSubmit={handleSubmit} className="relative flex items-center p-2">
                         <div className="pl-4 text-neutral-400">
                            <Search size={20} />
                         </div>
                         <input 
                            ref={inputRef}
                            className="flex-1 bg-transparent px-4 py-3 text-neutral-800 placeholder-neutral-400 outline-none font-medium"
                            placeholder={viewState === 'landing' ? "Ask anything..." : "Reply..."}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onFocus={() => { if(viewState === 'landing') handleStartChat(); }}
                         />
                         <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={!input.trim() || streaming}
                            className="flex items-center justify-center rounded-full bg-black p-3 text-white transition disabled:opacity-50 shadow-md"
                         >
                            <ArrowRight size={18} />
                         </motion.button>
                     </form>
                 </LiquidGlass>
                 </motion.div>
              </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Global Modal Root (Stacking Context Management) --- */}
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
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
              <GlassCard
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="pointer-events-auto relative flex h-[80vh] w-full max-w-4xl flex-col overflow-y-auto md:overflow-hidden !border-neutral-200 !bg-white/95 shadow-2xl"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute right-4 top-4 z-50 rounded-full bg-neutral-100 p-2 text-neutral-600 hover:bg-neutral-200"
                >
                  <X size={20} />
                </button>

                {/* Content */}
                <div className="flex flex-col md:flex-1 md:flex-row md:min-h-0 md:overflow-hidden">
                    {/* Visual Side */}
                    <div className={`relative w-full h-64 md:h-auto md:w-1/2 ${selectedProject.project.gradient} shrink-0`}>
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
                            <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
                         )}
                    </div>

                    {/* Info Side */}
                    <div className="flex w-full flex-col md:h-full md:w-1/2 md:min-h-0 bg-white">
                        {/* Fixed Header */}
                        <div className="p-8 pb-4 shrink-0 border-b border-neutral-100">
                            <h2 className="text-2xl font-bold text-neutral-900 pr-12">{selectedProject.project.title}</h2>
                            <span className="mt-2 text-brand-cyan text-sm">{selectedProject.project.category}</span>
                        </div>
                        
                        {/* Scrollable Content */}
                        <div className="md:flex-1 md:overflow-y-auto custom-scrollbar p-8 pt-6">
                            <div className="text-sm leading-relaxed text-neutral-600">
                                {selectedProject.project.description?.split('\n').map((line: string, idx: number) => {
                                    const trimmed = line.trim();
                                    if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
                                        return (
                                            <div key={idx} className="flex items-start gap-2 ml-2 mb-1">
                                                <span className="text-brand-cyan mt-1.5 text-[6px]">●</span>
                                                <span>{trimmed.substring(1).trim()}</span>
                                            </div>
                                        );
                                    }
                                    return <p key={idx} className="mb-1">{line}</p>;
                                })}
                            </div>

                            <div className="mt-8">
                                <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-3">Skills Used</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProject.project.tags.map((tag) => (
                                        <span key={tag} className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm font-medium border border-neutral-200">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 flex flex-wrap gap-3 pb-8">
                                {/* Standard Buttons */}
                                {selectedProject.project.demo_link && (
                                    <a 
                                        href={selectedProject.project.demo_link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 rounded-lg bg-brand-cyan px-4 py-3 font-semibold text-white transition hover:brightness-110 flex-1 min-w-[140px]"
                                    >
                                        <ExternalLink size={18} /> Visit Live
                                    </a>
                                )}
                                {selectedProject.project.repo_link && (
                                    <a 
                                        href={selectedProject.project.repo_link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-3 font-semibold text-neutral-700 transition hover:bg-neutral-50 flex-1 min-w-[140px]"
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
                                        className="flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-3 font-semibold text-neutral-700 transition hover:bg-neutral-50 flex-1 min-w-[140px]"
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
