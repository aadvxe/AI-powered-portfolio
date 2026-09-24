"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { GlassCard } from "@/components/ui/glass-card";
import { 
  Loader2, 
  Plus, 
  Trash2, 
  Save, 
  User, 
  Briefcase, 
  GraduationCap, 
  Trophy, 
  ArrowUp, 
  ArrowDown, 
  List, 
  Layers,
  Award 
} from "lucide-react";
import { motion } from "framer-motion";
import { ProfileData } from "@/hooks/use-content";
import { ImageUploader } from "@/components/admin/image-uploader";
import { NotificationModal } from "@/components/admin/notification-modal";

export default function AdminProfile() {
  const [profile, setProfile] = useState<Partial<ProfileData>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchProfileData = async () => {
      const { data } = await supabase.from('profile').select('*').single();
      if (!isMounted) return;
      if (data) {
          setProfile({
              ...data,
              experiences: data.experiences || [],
              education: data.education || [],
              achievements: data.achievements || [],
              certifications: data.certifications || [],
              social_links: data.social_links || { github: "", linkedin: "", twitter: "" },
              custom_sections: data.custom_sections || [],

              section_order: (() => {
                  const order = data.section_order || ["about", "experiences", "education", "certifications", "achievements"];
                  const standards = ["about", "experiences", "education", "certifications", "achievements"];
                  const missingStandards = standards.filter(s => !order.includes(s));
                  const customIds = (data.custom_sections || []).map((cs: { id: string }) => cs.id);
                  const missingCustom = customIds.filter((cid: string) => !order.includes(cid));
                  
                  const finalOrder = [...order, ...missingStandards, ...missingCustom];
                  const achIndex = finalOrder.indexOf('achievements');
                  const certIndex = finalOrder.indexOf('certifications');
                  if (achIndex !== -1 && certIndex !== -1 && certIndex > achIndex) {
                       finalOrder.splice(certIndex, 1);
                       finalOrder.splice(achIndex, 0, 'certifications');
                  }
                  return finalOrder;
              })(),
              hidden_sections: data.hidden_sections || []
          });
      }
      setLoading(false);
    };

    fetchProfileData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
        .from('profile')
        .update(profile)
        .eq('id', profile.id);

    if (error) setNotification({ message: "Error saving: " + error.message, type: "error" });
    else setNotification({ message: "Profile updated!", type: "success" });
    
    setSaving(false);
  };

  // Helper to update array fields (extended type)
  const addItem = (field: 'experiences' | 'education' | 'achievements' | 'certifications', item: Record<string, unknown>) => {
    setProfile(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), item]
    }));
  };

  const removeItem = (field: 'experiences' | 'education' | 'achievements' | 'certifications', index: number) => {
    setProfile(prev => ({
        ...prev,
        [field]: prev[field]?.filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (field: 'experiences' | 'education' | 'achievements' | 'certifications', index: number, key: string, value: string) => {
      setProfile(prev => {
          const newArray = [...(prev[field] || [])];
          newArray[index] = { ...newArray[index], [key]: value };
          return { ...prev, [field]: newArray };
      });
  };

  // Reordering helpers for item-level lists
  const moveItem = (field: 'experiences' | 'education' | 'achievements' | 'certifications', index: number, direction: 'up' | 'down') => {
      setProfile(prev => {
          const items = [...(prev[field] || [])];
          const targetIndex = direction === 'up' ? index - 1 : index + 1;
          if (targetIndex < 0 || targetIndex >= items.length) return prev;
          [items[index], items[targetIndex]] = [items[targetIndex], items[index]];
          return { ...prev, [field]: items };
      });
  };

  const moveCustomItem = (sectionIndex: number, itemIndex: number, direction: 'up' | 'down') => {
      setProfile(prev => {
          const newSections = [...(prev.custom_sections || [])];
          const currentSection = newSections[sectionIndex];
          if (!currentSection || !currentSection.items) return prev;
          const newItems = [...currentSection.items];
          const targetIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
          if (targetIndex < 0 || targetIndex >= newItems.length) return prev;
          [newItems[itemIndex], newItems[targetIndex]] = [newItems[targetIndex], newItems[itemIndex]];
          newSections[sectionIndex] = { ...currentSection, items: newItems };
          return { ...prev, custom_sections: newSections };
      });
  };

  // Toggle Visibility Helper
  const toggleSectionVisibility = (sectionId: string) => {
      setProfile(prev => {
          const hidden = prev.hidden_sections || [];
          if (hidden.includes(sectionId)) {
              return { ...prev, hidden_sections: hidden.filter(id => id !== sectionId) };
          } else {
              return { ...prev, hidden_sections: [...hidden, sectionId] };
          }
      });
  };

  const isHidden = (sectionId: string) => profile.hidden_sections?.includes(sectionId);

  // Custom Sections Logic
  const addCustomSection = () => {
      const newId = `section-${Date.now()}`;
      const newSection = { id: newId, title: "New Section", items: [] };
      setProfile(prev => ({
          ...prev,
          custom_sections: [...(prev.custom_sections || []), newSection],
          section_order: [...(prev.section_order || []), newId]
      }));
  };

  const updateCustomSection = (index: number, key: string, value: unknown) => {
      setProfile(prev => {
          const newSections = [...(prev.custom_sections || [])];
          newSections[index] = { ...newSections[index], [key]: value };
          return { ...prev, custom_sections: newSections };
      });
  };

  const removeCustomSection = (id: string) => {
      if(!confirm("Remove this section and all its contents?")) return;
      setProfile(prev => ({
          ...prev,
          custom_sections: prev.custom_sections?.filter(s => s.id !== id),
          section_order: prev.section_order?.filter(oid => oid !== id)
      }));
  };
  
  const addCustomItem = (sectionIndex: number) => {
      const newItem = { title: "Title", subtitle: "Subtitle", date: "Date", description: "..." };
      setProfile(prev => {
           const newSections = [...(prev.custom_sections || [])];
           newSections[sectionIndex].items = [...newSections[sectionIndex].items, newItem];
           return { ...prev, custom_sections: newSections };
      });
  };

  const updateCustomItem = (sectionIndex: number, itemIndex: number, key: string, value: string) => {
      setProfile(prev => {
           const newSections = [...(prev.custom_sections || [])];
           newSections[sectionIndex].items[itemIndex] = { ...newSections[sectionIndex].items[itemIndex], [key]: value };
           return { ...prev, custom_sections: newSections };
      });
  };

  const removeCustomItem = (sectionIndex: number, itemIndex: number) => {
     setProfile(prev => {
         const newSections = [...(prev.custom_sections || [])];
          newSections[sectionIndex].items = newSections[sectionIndex].items.filter((_: unknown, i: number) => i !== itemIndex);
         return { ...prev, custom_sections: newSections };
    });
  };

  // Reordering Logic for Sections
  const moveSection = (index: number, direction: 'up' | 'down') => {
      if (!profile.section_order) return;
      const newOrder = [...profile.section_order];
      if (direction === 'up' && index > 0) {
          [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
      } else if (direction === 'down' && index < newOrder.length - 1) {
          [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      }
      setProfile(prev => ({ ...prev, section_order: newOrder }));
  };

  const getSectionLabel = (id: string) => {
      if (id === 'about') return 'About Me';
      if (id === 'experiences' || id === 'experience') return 'Experience';
      if (id === 'education') return 'Education';
      if (id === 'achievements') return 'Achievements';
      if (id === 'certifications' || id === 'certification') return 'Certifications';
      const custom = profile.custom_sections?.find(s => s.id === id);
      return custom ? custom.title : 'Custom Section';
  };

  // Section header reorder controls
  const renderSectionControls = (sectionId: string) => {
    if (!profile.section_order) return null;
    let index = profile.section_order.indexOf(sectionId);
    if (index === -1) {
      if (sectionId === 'experiences') index = profile.section_order.indexOf('experience');
      else if (sectionId === 'certifications') index = profile.section_order.indexOf('certification');
    }
    if (index === -1) return null;
    const total = profile.section_order.length;

    return (
      <div className="flex items-center gap-1.5 bg-neutral-100/90 text-neutral-600 px-2.5 py-1 rounded-lg border border-neutral-200/80 text-xs font-medium shadow-xs">
        <span className="text-[11px] text-neutral-500 font-semibold tracking-wide">
          Section {index + 1}/{total}
        </span>
        <div className="flex items-center gap-0.5 ml-1 border-l border-neutral-200/80 pl-1">
          <button
            type="button"
            onClick={() => moveSection(index, 'up')}
            disabled={index === 0}
            title="Move Section Up"
            className="p-1 hover:text-neutral-900 hover:bg-white rounded disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-neutral-500 transition-colors"
          >
            <ArrowUp size={13} />
          </button>
          <button
            type="button"
            onClick={() => moveSection(index, 'down')}
            disabled={index === total - 1}
            title="Move Section Down"
            className="p-1 hover:text-neutral-900 hover:bg-white rounded disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-neutral-500 transition-colors"
          >
            <ArrowDown size={13} />
          </button>
        </div>
      </div>
    );
  };

  // Render individual section cards dynamically
  const renderSectionCard = (sectionId: string) => {
    if (sectionId === 'about') {
      return (
        <motion.div layout key="section-about" className="space-y-8">
          {/* Basic Info & Photo */}
          <GlassCard className="p-8 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                <User size={20} className="text-neutral-700" /> Basic Info
              </h2>
              {renderSectionControls('about')}
            </div>
            
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar Upload */}
              <div className="w-full md:w-1/3 flex flex-col items-center gap-2">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-neutral-100 shadow-inner bg-neutral-50 relative group">
                  {profile.avatar_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                      <User size={48} />
                    </div>
                  )}
                </div>
                <div className="w-full">
                  <ImageUploader 
                    value={profile.avatar_url || ""}
                    onChange={(url) => setProfile({ ...profile, avatar_url: url })}
                    onRemove={() => setProfile({ ...profile, avatar_url: "" })}
                    bucket="portfolio"
                  />
                </div>
              </div>

              <div className="w-full md:w-2/3 grid grid-cols-1 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-500 uppercase">Name</label>
                  <input 
                    className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-800/20"
                    value={profile.name || ""}
                    onChange={e => setProfile({...profile, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-500 uppercase">Role Title</label>
                  <input 
                    className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-800/20"
                    value={profile.role || ""}
                    onChange={e => setProfile({...profile, role: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-500 uppercase">Bio</label>
                  <textarea 
                    className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-800/20 min-h-[100px]"
                    value={profile.bio || ""}
                    onChange={e => setProfile({...profile, bio: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-500 uppercase">Resume URL</label>
                  <input 
                    className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-800/20"
                    value={profile.resume_url || ""}
                    onChange={e => setProfile({...profile, resume_url: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Social Links */}
          <GlassCard className="p-8 space-y-6">
            <h2 className="text-xl font-bold text-neutral-800">Social Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['github', 'linkedin'].map((platform) => (
                <div key={platform} className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-500 uppercase">{platform}</label>
                  <input 
                    className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-800/20"
                    placeholder={`https://${platform}.com/...`}
                    value={profile.social_links?.[platform as keyof typeof profile.social_links] || ""}
                    onChange={e => setProfile({
                      ...profile, 
                      social_links: { ...profile.social_links, [platform]: e.target.value }
                    })}
                  />
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      );
    }

    if (sectionId === 'experiences' || sectionId === 'experience') {
      return (
        <motion.div layout key="section-experiences">
          <GlassCard className="p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 text-[100px] text-neutral-50 opacity-20 pointer-events-none font-black leading-none select-none">EXP</div>
            <div className="flex items-center justify-between relative z-10 flex-wrap gap-3">
              <h2 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                <Briefcase size={20} className="text-purple-500" /> Experience
              </h2>
              <div className="flex items-center gap-3">
                {renderSectionControls(sectionId)}
                <button 
                  type="button"
                  onClick={() => addItem('experiences', { role: "Role", company: "Company", period: "2024", description: "" })}
                  className="text-sm bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg font-medium transition-colors"
                >
                  + Add Role
                </button>
              </div>
            </div>
            <div className="space-y-4 relative z-10">
              {profile.experiences?.map((exp, i) => (
                <motion.div 
                  layout 
                  key={`exp-${exp.role || ''}-${exp.company || ''}-${i}`} 
                  className="p-4 bg-white/70 border border-neutral-200/80 rounded-xl space-y-3 relative shadow-xs hover:border-neutral-300 transition-colors"
                >
                  {/* Item Actions Header */}
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200/60">
                        #{i + 1}
                      </span>
                      <span className="text-xs font-semibold text-neutral-600 truncate max-w-[220px] sm:max-w-md">
                        {exp.role || "Role"} {exp.company ? `— ${exp.company}` : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center bg-neutral-100/90 rounded-lg p-0.5 border border-neutral-200/70">
                        <button 
                          type="button"
                          onClick={() => moveItem('experiences', i, 'up')} 
                          disabled={i === 0} 
                          title="Move Up"
                          className="p-1 rounded text-neutral-500 hover:text-neutral-900 hover:bg-white disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-neutral-500 transition-colors"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => moveItem('experiences', i, 'down')} 
                          disabled={i === (profile.experiences?.length || 0) - 1} 
                          title="Move Down"
                          className="p-1 rounded text-neutral-500 hover:text-neutral-900 hover:bg-white disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-neutral-500 transition-colors"
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeItem('experiences', i)} 
                        title="Delete Role"
                        className="p-1 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input className="bg-transparent border-b border-neutral-200 focus:border-neutral-800 outline-none font-bold text-neutral-800" value={exp.role} onChange={e => updateArrayItem('experiences', i, 'role', e.target.value)} placeholder="Role" />
                    <input className="bg-transparent border-b border-neutral-200 focus:border-neutral-800 outline-none text-neutral-600" value={exp.company} onChange={e => updateArrayItem('experiences', i, 'company', e.target.value)} placeholder="Company" />
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <input className="bg-transparent border-b border-neutral-200 focus:border-neutral-800 outline-none text-sm text-neutral-500" value={exp.period} onChange={e => updateArrayItem('experiences', i, 'period', e.target.value)} placeholder="Period (e.g. 2023 - Present)" />
                    
                    {/* Skills Field */}
                    <input 
                      className="bg-transparent border-b border-neutral-200 focus:border-neutral-800 outline-none text-sm text-neutral-800 placeholder:text-neutral-400" 
                      value={exp.skills || ""} 
                      onChange={e => updateArrayItem('experiences', i, 'skills', e.target.value)} 
                      placeholder="Skills Used (comma separated, e.g. React, Node.js)" 
                    />

                    <div className="relative">
                      <textarea 
                        className="w-full bg-transparent border border-neutral-200 rounded-lg p-2 text-sm text-neutral-600 focus:border-neutral-800 outline-none min-h-[80px]" 
                        value={exp.description} 
                        onChange={e => updateArrayItem('experiences', i, 'description', e.target.value)} 
                        placeholder="Description" 
                      />
                      <div className="text-[10px] text-neutral-400 absolute bottom-2 right-2 pointer-events-none">
                        Tip: Use - for bullet points
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {(!profile.experiences || profile.experiences.length === 0) && (
                <div className="text-center py-8 text-neutral-400 text-sm border-2 border-dashed border-neutral-200 rounded-xl">
                  No experience roles added yet. Click &quot;+ Add Role&quot; to add one.
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      );
    }

    if (sectionId === 'education') {
      return (
        <motion.div layout key="section-education">
          <GlassCard className="p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 text-[100px] text-neutral-50 opacity-20 pointer-events-none font-black leading-none select-none">EDU</div>
            <div className="flex items-center justify-between relative z-10 flex-wrap gap-3">
              <h2 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                <GraduationCap size={20} className="text-neutral-700" /> Education
              </h2>
              <div className="flex items-center gap-3">
                {renderSectionControls('education')}
                <button 
                  type="button"
                  onClick={() => addItem('education', { degree: "Degree", school: "School", year: "2020", category: "University" })}
                  className="text-sm bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg font-medium transition-colors"
                >
                  + Add Education
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              {profile.education?.map((edu, i) => (
                <motion.div 
                  layout 
                  key={`edu-${edu.degree || ''}-${edu.school || ''}-${i}`} 
                  className="p-4 bg-white/70 border border-neutral-200/80 rounded-xl space-y-3 relative shadow-xs hover:border-neutral-300 transition-colors flex flex-col justify-between"
                >
                  {/* Item Actions Header */}
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-mono font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200/60">
                        #{i + 1}
                      </span>
                      {/* Category Selector */}
                      <div className="flex gap-1">
                        {['University', 'Bootcamp', 'Course', 'Other'].map(cat => (
                          <button 
                            key={cat}
                            type="button"
                            onClick={() => updateArrayItem('education', i, 'category', cat)}
                            className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-md transition-colors ${edu.category === cat ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'}`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center bg-neutral-100/90 rounded-lg p-0.5 border border-neutral-200/70">
                        <button 
                          type="button"
                          onClick={() => moveItem('education', i, 'up')} 
                          disabled={i === 0} 
                          title="Move Up"
                          className="p-1 rounded text-neutral-500 hover:text-neutral-900 hover:bg-white disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-neutral-500 transition-colors"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => moveItem('education', i, 'down')} 
                          disabled={i === (profile.education?.length || 0) - 1} 
                          title="Move Down"
                          className="p-1 rounded text-neutral-500 hover:text-neutral-900 hover:bg-white disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-neutral-500 transition-colors"
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeItem('education', i)} 
                        title="Delete Education"
                        className="p-1 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <input className="w-full bg-transparent border-b border-neutral-200 focus:border-neutral-800 outline-none font-bold text-neutral-800" value={edu.degree} onChange={e => updateArrayItem('education', i, 'degree', e.target.value)} placeholder="Degree" />
                      <input className="w-full bg-transparent border-b border-neutral-200 focus:border-neutral-800 outline-none text-neutral-600" value={edu.school} onChange={e => updateArrayItem('education', i, 'school', e.target.value)} placeholder="School" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input className="w-full bg-transparent border-b border-neutral-200 focus:border-neutral-800 outline-none text-xs text-neutral-500" value={edu.year} onChange={e => updateArrayItem('education', i, 'year', e.target.value)} placeholder="Year" />
                      <input className="w-full bg-transparent border-b border-neutral-200 focus:border-neutral-800 outline-none text-xs text-neutral-800 font-semibold" value={edu.gpa || ""} onChange={e => updateArrayItem('education', i, 'gpa', e.target.value)} placeholder="GPA (e.g. 3.8/4.0)" />
                    </div>
                    <textarea 
                      className="w-full bg-transparent border border-neutral-200 rounded-lg p-2 text-sm text-neutral-600 focus:border-neutral-800 outline-none min-h-[60px]" 
                      value={edu.description || ""} 
                      onChange={e => updateArrayItem('education', i, 'description', e.target.value)} 
                      placeholder="Description (Optional)" 
                    />
                  </div>
                </motion.div>
              ))}
            </div>
            {(!profile.education || profile.education.length === 0) && (
              <div className="text-center py-8 text-neutral-400 text-sm border-2 border-dashed border-neutral-200 rounded-xl relative z-10">
                No education entries added yet. Click &quot;+ Add Education&quot; to add one.
              </div>
            )}
          </GlassCard>
        </motion.div>
      );
    }

    if (sectionId === 'certifications' || sectionId === 'certification') {
      return (
        <motion.div layout key="section-certifications">
          <GlassCard className="p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 text-[100px] text-neutral-50 opacity-20 pointer-events-none font-black leading-none select-none">CERT</div>
            <div className="flex items-center justify-between relative z-10 flex-wrap gap-3">
              <h2 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                <Award size={20} className="text-neutral-700" /> Certifications
              </h2>
              <div className="flex items-center gap-3">
                {renderSectionControls(sectionId)}
                <button 
                  type="button"
                  onClick={() => addItem('certifications', { title: "Certificate Name", issuer: "Issuer", date: "2024", link: "" })}
                  className="text-sm bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg font-medium transition-colors"
                >
                  + Add Cert
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              {profile.certifications?.map((cert, i) => (
                <motion.div 
                  layout 
                  key={`cert-${cert.title || ''}-${cert.issuer || ''}-${i}`} 
                  className="p-4 bg-white/70 border border-neutral-200/80 rounded-xl space-y-3 relative shadow-xs hover:border-neutral-300 transition-colors"
                >
                  {/* Item Actions Header */}
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                    <span className="text-[11px] font-mono font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200/60">
                      #{i + 1}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center bg-neutral-100/90 rounded-lg p-0.5 border border-neutral-200/70">
                        <button 
                          type="button"
                          onClick={() => moveItem('certifications', i, 'up')} 
                          disabled={i === 0} 
                          title="Move Up"
                          className="p-1 rounded text-neutral-500 hover:text-neutral-900 hover:bg-white disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-neutral-500 transition-colors"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => moveItem('certifications', i, 'down')} 
                          disabled={i === (profile.certifications?.length || 0) - 1} 
                          title="Move Down"
                          className="p-1 rounded text-neutral-500 hover:text-neutral-900 hover:bg-white disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-neutral-500 transition-colors"
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeItem('certifications', i)} 
                        title="Delete Certification"
                        className="p-1 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <input className="w-full bg-transparent border-b border-neutral-200 focus:border-neutral-800 outline-none font-bold text-neutral-800" value={cert.title} onChange={e => updateArrayItem('certifications', i, 'title', e.target.value)} placeholder="Certificate Name" />
                    <div className="grid grid-cols-2 gap-4">
                      <input className="w-full bg-transparent border-b border-neutral-200 focus:border-neutral-800 outline-none text-neutral-600" value={cert.issuer} onChange={e => updateArrayItem('certifications', i, 'issuer', e.target.value)} placeholder="Issuer (e.g. Google)" />
                      <input className="w-full bg-transparent border-b border-neutral-200 focus:border-neutral-800 outline-none text-xs text-neutral-500" value={cert.date} onChange={e => updateArrayItem('certifications', i, 'date', e.target.value)} placeholder="Date" />
                    </div>
                    <input className="w-full bg-transparent border-b border-neutral-200 focus:border-neutral-800 outline-none text-xs text-neutral-800" value={cert.link || ""} onChange={e => updateArrayItem('certifications', i, 'link', e.target.value)} placeholder="Credential URL (Optional)" />
                  </div>
                </motion.div>
              ))}
            </div>
            {(!profile.certifications || profile.certifications.length === 0) && (
              <div className="text-center py-8 text-neutral-400 text-sm border-2 border-dashed border-neutral-200 rounded-xl relative z-10">
                No certifications added yet. Click &quot;+ Add Cert&quot; to add one.
              </div>
            )}
          </GlassCard>
        </motion.div>
      );
    }

    if (sectionId === 'achievements') {
      return (
        <motion.div layout key="section-achievements">
          <GlassCard className={`p-8 space-y-6 relative overflow-hidden transition-opacity ${isHidden('achievements') ? 'opacity-50 grayscale' : 'opacity-100'}`}>
            <div className="absolute top-0 right-0 p-2 text-[100px] text-neutral-50 opacity-20 pointer-events-none font-black leading-none select-none">ACH</div>
            <div className="flex items-center justify-between relative z-10 flex-wrap gap-3">
              <h2 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                <Trophy size={20} className="text-neutral-700" /> Achievements
              </h2>
              <div className="flex items-center gap-3">
                {renderSectionControls('achievements')}
                <button 
                  type="button"
                  onClick={() => toggleSectionVisibility('achievements')} 
                  className={`text-xs px-2 py-1 rounded font-bold uppercase transition-colors ${isHidden('achievements') ? 'bg-neutral-800 text-white' : 'bg-neutral-200 text-neutral-500'}`}
                >
                  {isHidden('achievements') ? 'Hidden' : 'Visible'}
                </button>
                <button 
                  type="button"
                  onClick={() => addItem('achievements', { title: "Title", event: "Event Name" })}
                  className="text-sm bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg font-medium transition-colors"
                >
                  + Add Achievement
                </button>
              </div>
            </div>
            {!isHidden('achievements') && (
              <div className="space-y-3 relative z-10">
                {profile.achievements?.map((ach, i) => (
                  <motion.div 
                    layout 
                    key={`ach-${ach.title || ''}-${ach.event || ''}-${i}`} 
                    className="p-3 bg-white/70 border border-neutral-200/80 rounded-xl flex items-center gap-3 relative shadow-xs hover:border-neutral-300 transition-colors"
                  >
                    <span className="text-[11px] font-mono font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200/60 shrink-0">
                      #{i + 1}
                    </span>
                    <div className="p-2 bg-neutral-100 text-neutral-700 rounded-lg shrink-0">
                      <Trophy size={16} />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <input className="w-full bg-transparent border-b border-transparent focus:border-neutral-300 outline-none font-semibold text-neutral-800 text-sm" value={ach.title} onChange={e => updateArrayItem('achievements', i, 'title', e.target.value)} placeholder="Title" />
                      <input className="w-full bg-transparent border-b border-transparent focus:border-neutral-300 outline-none text-xs text-neutral-500" value={ach.event} onChange={e => updateArrayItem('achievements', i, 'event', e.target.value)} placeholder="Event" />
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <div className="flex items-center bg-neutral-100/90 rounded-lg p-0.5 border border-neutral-200/70">
                        <button 
                          type="button"
                          onClick={() => moveItem('achievements', i, 'up')} 
                          disabled={i === 0} 
                          title="Move Up"
                          className="p-1 rounded text-neutral-500 hover:text-neutral-900 hover:bg-white disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-neutral-500 transition-colors"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => moveItem('achievements', i, 'down')} 
                          disabled={i === (profile.achievements?.length || 0) - 1} 
                          title="Move Down"
                          className="p-1 rounded text-neutral-500 hover:text-neutral-900 hover:bg-white disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-neutral-500 transition-colors"
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeItem('achievements', i)} 
                        title="Delete Achievement"
                        className="p-1 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </motion.div>
                ))}
                {(!profile.achievements || profile.achievements.length === 0) && (
                  <div className="text-center py-8 text-neutral-400 text-sm border-2 border-dashed border-neutral-200 rounded-xl">
                    No achievements added yet. Click &quot;+ Add Achievement&quot; to add one.
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        </motion.div>
      );
    }

    // Custom Section
    const customSectionIndex = profile.custom_sections?.findIndex(s => s.id === sectionId);
    if (customSectionIndex !== undefined && customSectionIndex !== -1) {
      const section = profile.custom_sections![customSectionIndex];
      return (
        <motion.div layout key={section.id}>
          <GlassCard className="p-8 space-y-6 relative overflow-hidden border-neutral-200/80">
            <div className="flex items-center justify-between relative z-10 flex-wrap gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                <Layers size={20} className="text-neutral-700 shrink-0" />
                <input 
                  className="text-xl font-bold text-neutral-800 bg-transparent border-b border-transparent focus:border-neutral-900 outline-none flex-1" 
                  value={section.title}
                  onChange={(e) => updateCustomSection(customSectionIndex, 'title', e.target.value)}
                  placeholder="Section Title"
                />
              </div>
              <div className="flex items-center gap-2">
                {renderSectionControls(section.id)}
                <button 
                  type="button"
                  onClick={() => addCustomItem(customSectionIndex)}
                  className="text-sm bg-neutral-100 text-neutral-800 hover:bg-neutral-200 px-3 py-1.5 rounded-lg font-medium transition-colors"
                >
                  + Add Item
                </button>
                <button 
                  type="button" 
                  onClick={() => removeCustomSection(section.id)} 
                  title="Remove Section"
                  className="text-neutral-400 hover:text-red-500 p-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-3 relative z-10">
              {section.items?.map((item, itemIndex) => (
                <motion.div 
                  layout 
                  key={`custom-${section.id}-${item.title || ''}-${itemIndex}`} 
                  className="p-4 bg-white/70 border border-neutral-200/80 rounded-xl space-y-3 relative shadow-xs hover:border-neutral-300 transition-colors"
                >
                  {/* Item Actions Header */}
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200/60">
                        #{itemIndex + 1}
                      </span>
                      <span className="text-xs font-semibold text-neutral-600 truncate max-w-[200px] sm:max-w-xs">
                        {item.title || "Untitled"} {item.subtitle ? `— ${item.subtitle}` : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center bg-neutral-100/90 rounded-lg p-0.5 border border-neutral-200/70">
                        <button 
                          type="button"
                          onClick={() => moveCustomItem(customSectionIndex, itemIndex, 'up')} 
                          disabled={itemIndex === 0} 
                          title="Move Up"
                          className="p-1 rounded text-neutral-500 hover:text-neutral-900 hover:bg-white disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-neutral-500 transition-colors"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => moveCustomItem(customSectionIndex, itemIndex, 'down')} 
                          disabled={itemIndex === (section.items?.length || 0) - 1} 
                          title="Move Down"
                          className="p-1 rounded text-neutral-500 hover:text-neutral-900 hover:bg-white disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-neutral-500 transition-colors"
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeCustomItem(customSectionIndex, itemIndex)} 
                        title="Delete Item"
                        className="p-1 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input className="bg-transparent border-b border-neutral-200 focus:border-neutral-800 outline-none font-bold text-neutral-800" value={item.title} onChange={e => updateCustomItem(customSectionIndex, itemIndex, 'title', e.target.value)} placeholder="Title (e.g. Mentor)" />
                    <input className="bg-transparent border-b border-neutral-200 focus:border-neutral-800 outline-none text-neutral-600" value={item.subtitle} onChange={e => updateCustomItem(customSectionIndex, itemIndex, 'subtitle', e.target.value)} placeholder="Subtitle (e.g. CodeOrg)" />
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <input className="bg-transparent border-b border-neutral-200 focus:border-neutral-800 outline-none text-sm text-neutral-500" value={item.date} onChange={e => updateCustomItem(customSectionIndex, itemIndex, 'date', e.target.value)} placeholder="Date/Period" />
                    <textarea className="w-full bg-transparent border border-neutral-200 rounded-lg p-2 text-sm text-neutral-600 focus:border-neutral-800 outline-none min-h-[50px]" value={item.description} onChange={e => updateCustomItem(customSectionIndex, itemIndex, 'description', e.target.value)} placeholder="Description" />
                  </div>
                </motion.div>
              ))}
              {(!section.items || section.items.length === 0) && (
                <div className="text-center py-6 text-neutral-400 text-sm border-2 border-dashed border-neutral-200 rounded-xl">
                  No items yet. Click &quot;+ Add Item&quot; to add one.
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      );
    }

    return null;
  };

  if (loading) return <div className="p-12 text-center text-neutral-500">Loading profile...</div>;

  const activeSectionOrder = profile.section_order && profile.section_order.length > 0 
    ? profile.section_order 
    : ["about", "experiences", "education", "certifications", "achievements"];

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      {/* Sticky Header with Action Bar */}
      <div className="flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur-md py-4 px-2 -mx-2">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Edit Profile</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Customize your about information, experience, education, and reorder sections.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 shadow-lg shadow-neutral-900/10 cursor-pointer"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save Changes
        </button>
      </div>
      
      {/* SECTION ORDER MANAGER */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
              <List size={20} className="text-neutral-500" /> Section Order
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Change the order in which sections appear in your portfolio &quot;About Me&quot; deck.
            </p>
          </div>
          <button 
            onClick={addCustomSection} 
            className="text-xs flex items-center gap-1.5 bg-neutral-900 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <Plus size={14} /> Add Custom Section
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeSectionOrder.map((sectionId, i) => (
            <div key={sectionId} className="flex items-center gap-2 px-3 py-2 bg-neutral-100 rounded-xl text-sm font-medium text-neutral-700 border border-neutral-200/80 shadow-xs">
              <span className="text-xs font-mono font-bold text-neutral-400 bg-white px-1.5 py-0.5 rounded border border-neutral-200/60">
                {i + 1}
              </span>
              <span>{getSectionLabel(sectionId)}</span>
              <div className="flex items-center bg-white rounded-lg p-0.5 border border-neutral-200 ml-1">
                <button 
                  type="button"
                  onClick={() => moveSection(i, 'up')} 
                  disabled={i === 0} 
                  title="Move Up"
                  className="p-1 hover:text-neutral-900 text-neutral-400 disabled:opacity-25 transition-colors"
                >
                  <ArrowUp size={12} />
                </button>
                <button 
                  type="button"
                  onClick={() => moveSection(i, 'down')} 
                  disabled={i === activeSectionOrder.length - 1} 
                  title="Move Down"
                  className="p-1 hover:text-neutral-900 text-neutral-400 disabled:opacity-25 transition-colors"
                >
                  <ArrowDown size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* DYNAMIC SECTION CARDS */}
      <div className="space-y-8">
        {activeSectionOrder.map((sectionId) => renderSectionCard(sectionId))}
      </div>

      <NotificationModal notification={notification} onClose={() => setNotification(null)} />
    </div>
  );
}
