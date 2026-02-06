"use client";

import { GlassCard } from "./ui/glass-card";
import { motion } from "framer-motion";
import { Code2, Database, Cpu, Globe, Terminal, Layers, Smartphone, Cloud, Palette, Settings, Layout, Brain, Bot, Sparkles, MessageSquare, Network } from "lucide-react";

import { SkillData } from "@/hooks/use-content";
import { useMemo } from "react";

interface SkillsDeckProps {
  skills: SkillData[];
}

export function SkillsDeck({ skills }: SkillsDeckProps) {
  // Skill Categorization Logic
  const skillCategories = useMemo(() => {
    if (!skills || skills.length === 0) return [];
    
    const groups: { [key: string]: string[] } = {};
    skills.forEach(skill => {
        if (!groups[skill.category]) groups[skill.category] = [];
        groups[skill.category].push(skill.name);
    });

    return Object.entries(groups).map(([title, skillsList]) => {
        // Icon mapping strategy
        let Icon = Layers; // Default Icon
        const lowerTitle = title.toLowerCase();
        
        if (lowerTitle.includes("nlp") || lowerTitle.includes("language system")) Icon = MessageSquare;
        else if (lowerTitle.includes("llm") || lowerTitle.includes("generative") || lowerTitle.includes("gpt")) Icon = Sparkles;
        else if (lowerTitle.includes("frontend") || lowerTitle.includes("web")) Icon = Globe;
        else if (lowerTitle.includes("backend") || lowerTitle.includes("server")) Icon = Cpu;
        else if (lowerTitle.includes("machine learning") || lowerTitle.includes("dim reduction") || lowerTitle.includes("deep")) Icon = Network;
        else if (lowerTitle.includes("data") || lowerTitle.includes("ai") || lowerTitle.includes("ml")) Icon = Database;
        else if (lowerTitle.includes("mobile") || lowerTitle.includes("app") || lowerTitle.includes("ios") || lowerTitle.includes("android")) Icon = Smartphone;
        else if (lowerTitle.includes("iot") || lowerTitle.includes("embedded") || lowerTitle.includes("robotics")) Icon = Bot;
        else if (lowerTitle.includes("cloud") || lowerTitle.includes("aws")) Icon = Cloud;
        else if (lowerTitle.includes("design") || lowerTitle.includes("ui") || lowerTitle.includes("ux")) Icon = Palette;
        else if (lowerTitle.includes("tool") || lowerTitle.includes("devops") || lowerTitle.includes("infra")) Icon = Terminal;
        else if (lowerTitle.includes("config") || lowerTitle.includes("setting")) Icon = Settings;

        return {
            title,
            icon: Icon,
            skills: skillsList
        };
    });
  }, [skills]);

  // Loading state handler
  if (skillCategories.length === 0) {
      return (
          <GlassCard className="p-6 w-full max-w-2xl text-center">
              <p className="text-neutral-500">Loading skills data...</p>
          </GlassCard>
      )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full py-4">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-12 gap-6"
      >
        {(() => {
            // Grid Layout Algorithm
            const elements = [];
            let i = 0;
            
            while (i < skillCategories.length) {
                const current = skillCategories[i];
                const next = skillCategories[i + 1];

                // Visual weight calculation for bento grid
                const getWeight = (cat: typeof current) => 
                     cat.skills.reduce((acc, s) => acc + s.length, 0) + (cat.skills.length * 5);
                
                const w1 = getWeight(current);
                const isHuge = w1 > 150 || current.skills.length > 12;

                // Layout Case: Full width
                if (isHuge || !next) {
                    elements.push({ ...current, span: "md:col-span-12" });
                    i++;
                    continue;
                }

                // Layout Case: Split row
                const w2 = getWeight(next);
                const total = w1 + w2;
                const ratio = w1 / total; // 0.0 to 1.0

                if (ratio > 0.6) {
                    // Asymmetric 2:1 split
                    elements.push({ ...current, span: "md:col-span-8" });
                    elements.push({ ...next, span: "md:col-span-4" });
                } else if (ratio < 0.4) {
                    // Asymmetric 1:2 split
                    elements.push({ ...current, span: "md:col-span-4" });
                    elements.push({ ...next, span: "md:col-span-8" });
                } else {
                    // Symmetric split
                    elements.push({ ...current, span: "md:col-span-6" });
                    elements.push({ ...next, span: "md:col-span-6" });
                }
                
                i += 2;
            }

            return elements.map((category) => (
                <motion.div 
                  key={category.title} 
                  variants={item}
                  className={category.span}
                >
                  <GlassCard className="p-6 h-full hover:bg-white/60 transition-colors group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-brand-cyan/10 rounded-lg text-brand-cyan group-hover:bg-brand-cyan/20 transition-colors">
                        <category.icon size={20} />
                      </div>
                      <h3 className="font-bold text-neutral-800">{category.title}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {category.skills.map((skill) => (
                        <span 
                          key={skill} 
                          className="px-3 py-1 bg-neutral-100 border border-neutral-200 rounded-full text-xs font-medium text-neutral-500 hover:scale-105 transition-transform cursor-default"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
            ));
        })()}
      </motion.div>
    </div>
  );
}
