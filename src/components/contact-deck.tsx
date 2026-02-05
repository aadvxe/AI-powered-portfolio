"use client";

import { GlassCard } from "./ui/glass-card";
import { motion } from "framer-motion";
import { Mail, Github, Linkedin, Copy, Check, ArrowUpRight } from "lucide-react";
import { useState } from "react";

import { ProfileData } from "@/hooks/use-content";

interface ContactDeckProps {
    profile: ProfileData | null;
}

export function ContactDeck({ profile }: ContactDeckProps) {
  const [copied, setCopied] = useState(false);
  const email = profile?.email || "ranggahardiyantowibowo@gmail.com"; // Fallback if not loaded yet

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socialLinks = [
    { name: "GitHub", icon: Github, url: profile?.social_links?.github || "#", color: "text-neutral-700 hover:text-black" },
    { name: "LinkedIn", icon: Linkedin, url: profile?.social_links?.linkedin || "#", color: "text-neutral-700 hover:text-blue-600" }
  ];

  return (
    <div className="w-full max-w-2xl py-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 w-full"
      >
        {/* Main Contact Card - Standard Style */}
        <GlassCard className="p-6 flex flex-col justify-center">
             <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-brand-cyan/10 rounded-full text-brand-cyan">
                    <Mail size={24} />
                </div>
                <h3 className="text-xl font-bold text-neutral-800">Get in Touch</h3>
             </div>
             
             <p className="text-neutral-600 leading-relaxed mb-6">
                I'm currently open to new opportunities and interesting projects. Let's build something amazing together.
             </p>

            <div className="flex flex-col sm:flex-row gap-3">
                {/* Email Copy Interface */}
                <div className="flex items-center gap-2 p-1.5 pl-4 pr-1.5 bg-neutral-100/50 border border-neutral-200 rounded-full w-full sm:max-w-md transition-colors hover:bg-white/80 hover:border-brand-cyan/30 group">
                    <span className="flex-1 text-sm font-medium text-neutral-700 truncate select-all">
                        {email}
                    </span>
                    <button 
                        onClick={handleCopy}
                        className="p-2 bg-white text-neutral-700 rounded-full shadow-sm border border-neutral-100 hover:scale-105 active:scale-95 transition-all"
                        title="Copy Email"
                    >
                        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                </div>
            </div>
        </GlassCard>

        {/* Social Links - now using simple flex layout to match general aesthetic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {socialLinks.map((social) => (
                <GlassCard 
                    key={social.name}
                    className="p-4 flex items-center gap-3 hover:bg-white/60 transition-all cursor-pointer group"
                    onClick={() => window.open(social.url, '_blank')}
                >
                    <social.icon size={20} className={`transition-colors ${social.color}`} />
                    <span className="text-sm font-semibold text-neutral-600 group-hover:text-neutral-900">{social.name}</span>
                    <ArrowUpRight size={14} className="ml-auto text-neutral-400 group-hover:text-neutral-600" />
                </GlassCard>
            ))}
        </div>
      </motion.div>
    </div>
  );
}
