import { GlassCard } from "./ui/glass-card";
import { motion } from "framer-motion";
import { GraduationCap, Briefcase, Trophy, User, ExternalLink, Award } from "lucide-react";

import { ProfileData } from "@/hooks/use-content";

interface AboutDeckProps {
    profile: ProfileData | null;
    visibleSections?: string[];
}

export function AboutDeck({ profile, visibleSections }: AboutDeckProps) {
  // Safe defaults
  const experiences = profile?.experiences || [];
  const education = profile?.education || [];
  const achievements = profile?.achievements || [];
  const customSections = profile?.custom_sections || [];
  let sectionOrder = visibleSections || profile?.section_order || ["about", "experiences", "education", "certifications", "achievements"];

  // Fallback: If using saved order but it's old (missing certifications), force add it before achievements if possible.
  if (!visibleSections && profile?.section_order && !profile.section_order.includes('certifications')) {
      const achIndex = sectionOrder.indexOf('achievements');
      if (achIndex !== -1) {
          sectionOrder = [...sectionOrder.slice(0, achIndex), 'certifications', ...sectionOrder.slice(achIndex)];
      } else {
          sectionOrder = [...sectionOrder, 'certifications'];
      }
  }

  const Sections = {
      about: (
        <div key="about" className="flex flex-col md:flex-row gap-6">
            {/* Photo Block */}
            <GlassCard className="w-full md:w-[300px] shrink-0 relative overflow-hidden group">
                {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500" />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/20 to-purple-500/20 flex items-center justify-center">
                        <User size={48} className="text-white/40" />
                    </div>
                )}
            </GlassCard>

            {/* Content Block */}
            <GlassCard className="flex-1 p-8 flex flex-col justify-center">
                <div className="mb-6">
                    <h3 className="text-3xl font-bold text-neutral-800 mb-2">Hi, I'm {profile?.name || "Your Name"}👋</h3>
                    <div className="inline-block px-3 py-1 bg-brand-cyan/10 rounded-full text-brand-cyan text-sm font-semibold">
                        {profile?.role || "Creative Developer"}
                    </div>
                </div>
                <p className="text-neutral-600 leading-relaxed pr-2">
                    {profile?.bio || "I am a passionate Creative Technologist with a knack for building fluid, intuitive, and beautiful web experiences. I bridge the gap between design and engineering."}
                </p>
                {/* Resume Link */}
                {profile?.resume_url && (
                    <div className="mt-4 pt-4 border-t border-neutral-100">
                        <a href={profile.resume_url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-brand-cyan hover:underline flex items-center gap-1">
                            View Resume <Trophy size={14} className="rotate-90" />
                        </a>
                    </div>
                )}
            </GlassCard>
        </div>
      ),
      experiences: (
        <motion.div 
            key="experiences"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
            <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3 ml-1">Working Experience</h4>
            <div className="flex flex-col gap-4">
                {experiences.map((exp: any, i: number) => (
                    <GlassCard key={i} className="p-6 hover:bg-white/60 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                            <div>
                                <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
                                    <Briefcase size={16} className="text-brand-cyan" />
                                    {exp.role}
                                </h3>
                                <div className="text-sm font-medium text-neutral-500">{exp.company}</div>
                            </div>
                            <span className="text-xs font-semibold bg-neutral-100 text-neutral-500 px-3 py-1 rounded-full whitespace-nowrap">
                                {exp.period}
                            </span>
                        </div>
                        
                        {/* Description with Bullet Point Support */}
                        <div className="text-sm text-neutral-600 leading-relaxed mt-3">
                            {exp.description?.split('\n').map((line: string, idx: number) => {
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

                        {/* Skills Section */}
                        {exp.skills && (
                            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-neutral-100">
                                {exp.skills.split(',').map((skill: string, idx: number) => (
                                    <span key={idx} className="text-[10px] font-semibold tracking-wide uppercase px-2 py-1 bg-neutral-100 text-neutral-500 rounded-md">
                                        {skill.trim()}
                                    </span>
                                ))}
                            </div>
                        )}
                    </GlassCard>
                ))}
            </div>
        </motion.div>
      ),
      education: (
         <motion.div
            key="education"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
        >
            <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3 ml-1">Education</h4>
            <div className="grid grid-cols-1 gap-4 h-full">
            {education.map((edu: any, i: number) => (
                <GlassCard key={i} className="p-6 hover:bg-white/60 h-full flex flex-col justify-center">
                    <div className="mb-3 p-2 bg-brand-cyan/10 rounded-lg w-fit text-brand-cyan">
                        <GraduationCap size={20} />
                    </div>
                    <h3 className="font-bold text-neutral-800">{edu.degree}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <div className="text-sm text-neutral-500">{edu.school}</div>
                        {edu.gpa && (
                            <span className="text-xs font-medium px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-md">
                                GPA: {edu.gpa}
                            </span>
                        )}
                    </div>
                    
                    {edu.description && (
                         <div className="text-sm text-neutral-600 mt-3 leading-relaxed">
                            {edu.description.split('\n').map((line: string, idx: number) => {
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
                    )}
                    
                    <div className="text-xs text-neutral-400 mt-auto pt-4">{edu.year}</div>
                </GlassCard>
            ))}
            </div>
        </motion.div>
      ),
    
    certifications: (
        <motion.div 
            key="certifications"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
        >
            <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3 ml-1">Certifications</h4>
            <div className="grid grid-cols-1 gap-3">
                {profile?.certifications?.map((cert: any, i: number) => (
                    <GlassCard key={i} className="p-4 hover:bg-white/60 flex items-center gap-4 group">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Award size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-neutral-800 text-sm">{cert.title}</h3>
                            <div className="text-xs text-neutral-500 mt-0.5">{cert.issuer} • {cert.date}</div>
                        </div>
                        {cert.link && (
                            <a href={cert.link} target="_blank" rel="noopener noreferrer" className="p-2 text-neutral-400 hover:text-brand-cyan hover:bg-brand-cyan/5 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                <ExternalLink size={14} />
                            </a>
                        )}
                    </GlassCard>
                ))}
            </div>
        </motion.div>
    ),

      achievements: (
         <motion.div
            key="achievements"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
        >
            <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3 ml-1">Achievements</h4>
            <div className="flex flex-col gap-3">
                {achievements.map((ach: any, i: number) => (
                    <GlassCard key={i} className="p-4 flex items-center gap-4 hover:bg-white/60">
                        <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg shrink-0">
                            <Trophy size={20} />
                        </div>
                        <div>
                            <div className="font-semibold text-neutral-800 text-sm">{ach.title}</div>
                            <div className="text-xs text-neutral-500">{ach.event}</div>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </motion.div>
      ),
      // Alias for legacy support
      experience: (
        <motion.div 
            key="experiences"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
            <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3 ml-1">Working Experience</h4>
            <div className="flex flex-col gap-4">
                {experiences.map((exp: any, i: number) => (
                    <GlassCard key={i} className="p-6 hover:bg-white/60 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                            <div>
                                <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
                                    <Briefcase size={16} className="text-brand-cyan" />
                                    {exp.role}
                                </h3>
                                <div className="text-sm font-medium text-neutral-500">{exp.company}</div>
                            </div>
                            <span className="text-xs font-semibold bg-neutral-100 text-neutral-500 px-3 py-1 rounded-full whitespace-nowrap">
                                {exp.period}
                            </span>
                        </div>
                        <p className="text-sm text-neutral-600 leading-relaxed mt-2">
                            {exp.description}
                        </p>
                    </GlassCard>
                ))}
            </div>
        </motion.div>
      )
  };

  const renderSection = (id: string) => {
      // Standard sections
      if (Sections[id as keyof typeof Sections]) {
          return Sections[id as keyof typeof Sections];
      }
      
      // Custom sections
      const customSection = customSections.find((s: any) => s.id === id);
      if (customSection) {
          return (
              <motion.div 
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                  <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3 ml-1">{customSection.title}</h4>
                  <div className="flex flex-col gap-4">
                      {customSection.items?.map((item: any, i: number) => (
                          <GlassCard key={i} className="p-6 hover:bg-white/60 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                                <div>
                                    <h3 className="text-lg font-bold text-neutral-800">
                                        {item.title}
                                    </h3>
                                    <div className="text-sm font-medium text-neutral-500">{item.subtitle}</div>
                                </div>
                                {item.date && (
                                    <span className="text-xs font-semibold bg-neutral-100 text-neutral-500 px-3 py-1 rounded-full whitespace-nowrap">
                                        {item.date}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-neutral-600 leading-relaxed mt-2">
                                {item.description}
                            </p>
                        </GlassCard>
                      ))}
                  </div>
              </motion.div>
          );
      }

      return null;
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl py-4">
         {sectionOrder.map((sectionId: string) => renderSection(sectionId))}
    </div>
  );
}
