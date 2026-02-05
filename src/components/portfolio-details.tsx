"use client";

import { GlassCard } from "./ui/glass-card";
import { motion } from "framer-motion";
import { X, Code2, Droplets, Sparkles, Database, Bot } from "lucide-react";
import { useEffect } from "react";

export function PortfolioDetails({ onClose }: { onClose: () => void }) {
  const stack = [
    { name: "Framework", val: "Next.js 16" },
    { name: "Styling", val: "Tailwind CSS + Framer Motion" },
    { name: "Language", val: "TypeScript" },
    { name: "Backend", val: "Supabase (PostgreSQL)" },
    { name: "AI", val: "LangChain + Google Gemini" },
  ];

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop - Delayed Fade In */}
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
        />

        {/* Card - Immediate Pop */}
        <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.8 }}
            className="w-full max-w-2xl h-[85vh] rounded-2xl relative z-10"
            onClick={(e) => e.stopPropagation()}
        >
            <GlassCard 
                className="w-full h-full p-8 relative overflow-hidden flex flex-col bg-white shadow-2xl !backdrop-blur-none border-neutral-200"
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 p-2 bg-neutral-100/80 rounded-full text-neutral-500 hover:bg-neutral-200 transition-colors z-20"
                    title="Close"
                >
                    <X size={18} />
                </button>

                {/* Fixed Header */}
                <div className="flex-none text-center mb-8">
                     <div className="mx-auto w-12 h-12 bg-brand-cyan/10 rounded-2xl flex items-center justify-center text-brand-cyan mb-4">
                         <Sparkles size={24} />
                     </div>
                     <h2 className="text-3xl font-bold text-neutral-800">About this Portfolio</h2>
                     <p className="text-neutral-500 mt-2">An interactive, AI-powered Portfolio</p>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar pr-2 -mr-2">
                    <div className="flex flex-col gap-8 pb-4">
                        
                        {/* Capabilities Section (What it can do) */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-neutral-900 flex items-center gap-2 text-lg">
                                <Bot size={20} className="text-brand-cyan" />
                                Interactive AI Assistant
                            </h3>
                            <p className="text-sm text-neutral-600 leading-relaxed">
                                This portfolio is not just a static website; it is an AI-powered application that uses <strong>Retrieval-Augmented Generation (RAG)</strong> to "talk" to visitors. Instead of hardcoding responses, the system leverages a vector database to perform semantic search over my professional data (projects, skills, experience) and generates natural language answers using Google's Gemini models.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 text-xs text-neutral-600">
                                    "Show me projects using Tensorflow"
                                </div>
                                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 text-xs text-neutral-600">
                                    "Do you have experience with AI?"
                                </div>
                                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 text-xs text-neutral-600">
                                    "How can I contact you?"
                                </div>
                                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 text-xs text-neutral-600">
                                    "Tell me about your background"
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-neutral-100 w-full" />

                        {/* Technical Deep Dive */}
                        <div>
                            <h3 className="font-bold text-neutral-900 flex items-center gap-2 text-lg mb-4">
                                <Database size={20} className="text-purple-500" />
                                Technical Architecture
                            </h3>
                            
                            <div className="space-y-6">
                                {/* Architecture */}
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-neutral-800 text-sm">Hybrid Performance System</h4>
                                    <p className="text-sm text-neutral-600 leading-relaxed">
                                        Designed for optimal user experience, the system uses a dual-engine approach. Standard requests (like navigation) are processed instantly in the browser for zero latency, while complex analytical questions are securely routed to the Cloud AI for processing.
                                    </p>
                                </div>

                                {/* Chunking */}
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-neutral-800 text-sm">Intelligent Data Retrieval</h4>
                                    <p className="text-sm text-neutral-600 leading-relaxed">
                                        Instead of treating the resume as a simple text file, the system categorizes professional experience, projects, and skills into structured data points. This allows the AI to "understand" the context of each role rather than just matching keywords.
                                    </p>
                                </div>
                            </div>
                        </div>

                         {/* Tech Stack */}
                         <div className="bg-neutral-50/80 rounded-xl p-6">
                            <h3 className="font-semibold text-neutral-900 flex items-center gap-2 mb-4">
                                <Code2 size={18} className="text-brand-cyan" />
                                Technical Stack
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8">
                                <div className="flex justify-between items-center text-sm border-b border-neutral-200/50 pb-2">
                                    <span className="text-neutral-500">LLM</span>
                                    <span className="font-medium text-neutral-800">Gemini 2.5 Flash-Lite</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-neutral-200/50 pb-2">
                                    <span className="text-neutral-500">Vector DB</span>
                                    <span className="font-medium text-neutral-800">Supabase pgvector</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-neutral-200/50 pb-2">
                                    <span className="text-neutral-500">Embeddings</span>
                                    <span className="font-medium text-neutral-800">Google Embeddings</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-neutral-200/50 pb-2">
                                    <span className="text-neutral-500">Framework</span>
                                    <span className="font-medium text-neutral-800">Next.js 14 (App Router)</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 -z-10 w-64 h-64 bg-brand-cyan/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 -z-10 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
            </GlassCard>
        </motion.div>
        
        {/* Style tag to hide scrollbar but keep functionality */}
        <style jsx global>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
    </div>
  );
}
