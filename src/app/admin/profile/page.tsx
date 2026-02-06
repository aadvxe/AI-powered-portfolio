"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { GlassCard } from "@/components/ui/glass-card";
import { Loader2, Plus, Trash2, Save, User, Briefcase, GraduationCap, Trophy, ArrowUp, ArrowDown, List, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileData } from "@/hooks/use-content";
import { ImageUploader } from "@/components/admin/image-uploader";

import { NotificationModal } from "@/components/admin/notification-modal";

export default function AdminProfile() {
  const [profile, setProfile] = useState<Partial<ProfileData>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  // Fetch Profile and initialize new fields
  const fetchProfile = async () => {
    setLoading(true);
    const { data } = await supabase.from('profile').select('*').single();
    if (data) {
        setProfile({
            ...data,
            experiences: data.experiences || [],
            education: data.education || [],
            achievements: data.achievements || [],
            certifications: data.certifications || [], // New
            social_links: data.social_links || { github: "", linkedin: "", twitter: "" },
            custom_sections: data.custom_sections || [],

            section_order: (() => {
                const order = data.section_order || ["about", "experiences", "education", "certifications", "achievements"];
                // Ensure certifications and other standard sections are present if not already
                const standards = ["about", "experiences", "education", "certifications", "achievements"];
                const missing = standards.filter(s => !order.includes(s));
                
                // If using old default fallback, insert certs before achievements
                const finalOrder = [...order, ...missing];
                const achIndex = finalOrder.indexOf('achievements');
                const certIndex = finalOrder.indexOf('certifications');
                if (achIndex !== -1 && certIndex !== -1 && certIndex > achIndex) {
                    // Swap to ensure certs are above achievements if using defaults
                    // (Simple logic: just move certs to before achievements if it was appended to end)
                     finalOrder.splice(certIndex, 1);
                     finalOrder.splice(achIndex, 0, 'certifications');
                }
                return finalOrder;
            })(),
            hidden_sections: data.hidden_sections || [] // New
        });
    }
    setLoading(false);
  };

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
  const addItem = (field: 'experiences' | 'education' | 'achievements' | 'certifications', item: any) => {
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

  const updateCustomSection = (index: number, key: string, value: any) => {
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
            newSections[sectionIndex].items = newSections[sectionIndex].items.filter((_: any, i: number) => i !== itemIndex);
           return { ...prev, custom_sections: newSections };
      });
    };


  // Reordering Logic
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
      return custom ? custom.title : 'Unknown Section';
  };


  if (loading) return <div className="p-12 text-center text-neutral-500">Loading profile...</div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur-md py-4 px-2 -mx-2">
        <h1 className="text-3xl font-bold text-neutral-800">Edit Profile</h1>
        <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-2 rounded-xl font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 shadow-lg"
        >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Changes
        </button>
      </div>
      
      {/* SECTION ORDER MANAGER */}
      <GlassCard className="p-6">
         <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
                <List size={20} className="text-neutral-500" /> Section Order
            </h2>
            <button onClick={addCustomSection} className="text-sm flex items-center gap-1 text-brand-cyan hover:underline font-medium">
                <Plus size={16} /> Add Custom Section
            </button>
         </div>
         <div className="flex flex-wrap gap-2">
             {profile.section_order?.map((sectionId, i) => (
                 <div key={sectionId} className="flex items-center gap-2 px-4 py-2 bg-neutral-100 rounded-lg text-sm font-medium text-neutral-700 border border-neutral-200">
                     <span>{getSectionLabel(sectionId)}</span>
                     <div className="flex flex-col gap-0.5 ml-2">
                         <button onClick={() => moveSection(i, 'up')} disabled={i === 0} className="hover:text-brand-cyan disabled:opacity-30"><ArrowUp size={12} /></button>
                         <button onClick={() => moveSection(i, 'down')} disabled={i === (profile.section_order?.length || 0) - 1} className="hover:text-brand-cyan disabled:opacity-30"><ArrowDown size={12} /></button>
                     </div>
                 </div>
             ))}
         </div>
      </GlassCard>

      {/* Basic Info & Photo */}
      <GlassCard className="p-8 space-y-6">
        <h2 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
            <User size={20} className="text-brand-cyan" /> Basic Info
        </h2>
        
        <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar Upload */}
            <div className="w-full md:w-1/3 flex flex-col items-center gap-2">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-neutral-100 shadow-inner bg-neutral-50 relative group">
                    {profile.avatar_url ? (
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
                        className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
                        value={profile.name || ""}
                        onChange={e => setProfile({...profile, name: e.target.value})}
                    />
                </div>
                 <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-500 uppercase">Role Title</label>
                    <input 
                        className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
                        value={profile.role || ""}
                        onChange={e => setProfile({...profile, role: e.target.value})}
                    />
                </div>
                 <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-500 uppercase">Bio</label>
                    <textarea 
                        className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 min-h-[100px]"
                        value={profile.bio || ""}
                        onChange={e => setProfile({...profile, bio: e.target.value})}
                    />
                </div>
                 <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-500 uppercase">Resume URL</label>
                    <input 
                        className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
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
                        className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
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

      {/* Experiences */}
      <GlassCard className="p-8 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 text-[100px] text-neutral-50 opacity-20 pointer-events-none font-black leading-none select-none">EXP</div>
        <div className="flex items-center justify-between relative z-10">
            <h2 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                <Briefcase size={20} className="text-purple-500" /> Experience
            </h2>
            <button 
                onClick={() => addItem('experiences', { role: "Role", company: "Company", period: "2024", description: "..." })}
                className="text-sm bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
                + Add Role
            </button>
        </div>
        <div className="space-y-4 relative z-10">
            {profile.experiences?.map((exp, i) => (
                <div key={i} className="p-4 bg-white/50 border border-neutral-100 rounded-xl space-y-3 group relative shadow-sm">
                    <button onClick={() => removeItem('experiences', i)} className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-2 gap-4">
                        <input className="bg-transparent border-b border-neutral-200 focus:border-neutral-800 outline-none font-bold text-neutral-800" value={exp.role} onChange={e => updateArrayItem('experiences', i, 'role', e.target.value)} placeholder="Role" />
                        <input className="bg-transparent border-b border-neutral-200 focus:border-neutral-800 outline-none text-neutral-600" value={exp.company} onChange={e => updateArrayItem('experiences', i, 'company', e.target.value)} placeholder="Company" />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <input className="bg-transparent border-b border-neutral-200 focus:border-neutral-800 outline-none text-sm text-neutral-500" value={exp.period} onChange={e => updateArrayItem('experiences', i, 'period', e.target.value)} placeholder="Period (e.g. 2023 - Present)" />
                        
                        {/* Skills Field */}
                        <input 
                            className="bg-transparent border-b border-neutral-200 focus:border-neutral-800 outline-none text-sm text-brand-cyan placeholder:text-neutral-400" 
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
                </div>
            ))}
        </div>
      </GlassCard>

      {/* Education */}
      <GlassCard className="p-8 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 text-[100px] text-neutral-50 opacity-20 pointer-events-none font-black leading-none select-none">EDU</div>
        <div className="flex items-center justify-between relative z-10">
            <h2 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                <GraduationCap size={20} className="text-orange-500" /> Education
            </h2>
             <button 
                onClick={() => addItem('education', { degree: "Degree", school: "School", year: "2020", category: "University" })}
                className="text-sm bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
                + Add Education
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
             {profile.education?.map((edu, i) => (
                <div key={i} className="p-4 bg-white/50 border border-neutral-100 rounded-xl space-y-2 group relative shadow-sm">
                    <button onClick={() => removeItem('education', i)} className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={16} />
                    </button>
                    
                    {/* Category Selector */}
                    <div className="flex gap-2 mb-2">
                        {['University', 'Bootcamp', 'Course', 'Other'].map(cat => (
                            <button 
                                key={cat}
                                onClick={() => updateArrayItem('education', i, 'category', cat)}
                                className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-md transition-colors ${edu.category === cat ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <input className="w-full bg-transparent border-b border-neutral-200 focus:border-neutral-800 outline-none font-bold text-neutral-800" value={edu.degree} onChange={e => updateArrayItem('education', i, 'degree', e.target.value)} placeholder="Degree" />
                        <input className="w-full bg-transparent border-b border-neutral-200 focus:border-neutral-800 outline-none text-neutral-600" value={edu.school} onChange={e => updateArrayItem('education', i, 'school', e.target.value)} placeholder="School" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input className="w-full bg-transparent border-b border-neutral-200 focus:border-neutral-800 outline-none text-xs text-neutral-500" value={edu.year} onChange={e => updateArrayItem('education', i, 'year', e.target.value)} placeholder="Year" />
                         <input className="w-full bg-transparent border-b border-neutral-200 focus:border-neutral-800 outline-none text-xs text-brand-cyan font-semibold" value={edu.gpa || ""} onChange={e => updateArrayItem('education', i, 'gpa', e.target.value)} placeholder="GPA (e.g. 3.8/4.0)" />
                    </div>
                    <textarea 
                        className="w-full bg-transparent border border-neutral-200 rounded-lg p-2 text-sm text-neutral-600 focus:border-neutral-800 outline-none min-h-[60px] mt-2" 
                        value={edu.description || ""} 
                        onChange={e => updateArrayItem('education', i, 'description', e.target.value)} 
                        placeholder="Description (Optional)" 
                    />
                </div>
             ))}
        </div>
      </GlassCard>

      {/* Certifications - NEW */}
      <GlassCard className="p-8 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 text-[100px] text-neutral-50 opacity-20 pointer-events-none font-black leading-none select-none">CERT</div>
        <div className="flex items-center justify-between relative z-10">
            <h2 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                <Trophy size={20} className="text-blue-500" /> Certifications
            </h2>
             <button 
                onClick={() => addItem('certifications', { title: "Certificate Name", issuer: "Issuer", date: "2024", link: "" })}
                className="text-sm bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
                + Add Cert
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
             {profile.certifications?.map((cert, i) => (
                <div key={i} className="p-4 bg-white/50 border border-neutral-100 rounded-xl space-y-2 group relative shadow-sm">
                    <button onClick={() => removeItem('certifications', i)} className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={16} />
                    </button>
                    <input className="w-full bg-transparent border-b border-neutral-200 focus:border-neutral-800 outline-none font-bold text-neutral-800" value={cert.title} onChange={e => updateArrayItem('certifications', i, 'title', e.target.value)} placeholder="Certificate Name" />
                    <div className="grid grid-cols-2 gap-4">
                        <input className="w-full bg-transparent border-b border-neutral-200 focus:border-neutral-800 outline-none text-neutral-600" value={cert.issuer} onChange={e => updateArrayItem('certifications', i, 'issuer', e.target.value)} placeholder="Issuer (e.g. Google)" />
                        <input className="w-full bg-transparent border-b border-neutral-200 focus:border-neutral-800 outline-none text-xs text-neutral-500" value={cert.date} onChange={e => updateArrayItem('certifications', i, 'date', e.target.value)} placeholder="Date" />
                    </div>
                    <input className="w-full bg-transparent border-b border-neutral-200 focus:border-neutral-800 outline-none text-xs text-brand-cyan" value={cert.link || ""} onChange={e => updateArrayItem('certifications', i, 'link', e.target.value)} placeholder="Credential URL (Optional)" />
                </div>
             ))}
        </div>
      </GlassCard>

      {/* Achievements */}
      <GlassCard className={`p-8 space-y-6 relative overflow-hidden transition-opacity ${isHidden('achievements') ? 'opacity-50 grayscale' : 'opacity-100'}`}>
        <div className="absolute top-0 right-0 p-2 text-[100px] text-neutral-50 opacity-20 pointer-events-none font-black leading-none select-none">ACH</div>
        <div className="flex items-center justify-between relative z-10">
            <h2 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                <Trophy size={20} className="text-yellow-500" /> Achievements
            </h2>
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => toggleSectionVisibility('achievements')} 
                    className={`text-xs px-2 py-1 rounded font-bold uppercase ${isHidden('achievements') ? 'bg-neutral-800 text-white' : 'bg-neutral-200 text-neutral-500'}`}
                >
                    {isHidden('achievements') ? 'Hidden' : 'Visible'}
                </button>
                <button 
                    onClick={() => addItem('achievements', { title: "Title", event: "Event Name" })}
                    className="text-sm bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg font-medium transition-colors"
                >
                    + Add Achievement
                </button>
            </div>
        </div>
        {!isHidden('achievements') && (
            <div className="space-y-4 relative z-10">
                {profile.achievements?.map((ach, i) => (
                    <div key={i} className="p-3 bg-white/50 border border-neutral-100 rounded-xl flex items-center gap-4 group relative shadow-sm">
                        <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                            <Trophy size={16} />
                        </div>
                        <div className="flex-1 space-y-1">
                            <input className="w-full bg-transparent border-b border-transparent focus:border-neutral-200 outline-none font-semibold text-neutral-800" value={ach.title} onChange={e => updateArrayItem('achievements', i, 'title', e.target.value)} placeholder="Title" />
                            <input className="w-full bg-transparent border-b border-transparent focus:border-neutral-200 outline-none text-xs text-neutral-500" value={ach.event} onChange={e => updateArrayItem('achievements', i, 'event', e.target.value)} placeholder="Event" />
                        </div>
                        <button onClick={() => removeItem('achievements', i)} className="p-2 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        )}
      </GlassCard>

      {/* Custom Sections */}
      {profile.custom_sections?.map((section, sectionIndex) => (
          <GlassCard key={section.id} className="p-8 space-y-6 relative overflow-hidden border-brand-cyan/20">
             <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3 flex-1">
                    <Layers size={20} className="text-brand-cyan" />
                    <input 
                        className="text-xl font-bold text-neutral-800 bg-transparent border-b border-transparent focus:border-brand-cyan outline-none" 
                        value={section.title}
                        onChange={(e) => updateCustomSection(sectionIndex, 'title', e.target.value)}
                        placeholder="Section Title"
                    />
                </div>
                 <div className="flex items-center gap-2">
                    <button 
                        onClick={() => addCustomItem(sectionIndex)}
                        className="text-sm bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan/20 px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
                        + Add Item
                    </button>
                    <button onClick={() => removeCustomSection(section.id)} className="text-neutral-400 hover:text-red-500 p-2">
                        <Trash2 size={18} />
                    </button>
                 </div>
            </div>

            <div className="space-y-3 relative z-10">
                 {section.items?.map((item, itemIndex) => (
                      <div key={itemIndex} className="p-4 bg-white/50 border border-neutral-100 rounded-xl space-y-3 group relative shadow-sm">
                          <button onClick={() => removeCustomItem(sectionIndex, itemIndex)} className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={16} />
                        </button>
                        <div className="grid grid-cols-2 gap-4">
                            <input className="bg-transparent border-b border-neutral-200 focus:border-neutral-800 outline-none font-bold text-neutral-800" value={item.title} onChange={e => updateCustomItem(sectionIndex, itemIndex, 'title', e.target.value)} placeholder="Title (e.g. Mentor)" />
                            <input className="bg-transparent border-b border-neutral-200 focus:border-neutral-800 outline-none text-neutral-600" value={item.subtitle} onChange={e => updateCustomItem(sectionIndex, itemIndex, 'subtitle', e.target.value)} placeholder="Subtitle (e.g. CodeOrg)" />
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <input className="bg-transparent border-b border-neutral-200 focus:border-neutral-800 outline-none text-sm text-neutral-500" value={item.date} onChange={e => updateCustomItem(sectionIndex, itemIndex, 'date', e.target.value)} placeholder="Date/Period" />
                            <textarea className="w-full bg-transparent border border-neutral-200 rounded-lg p-2 text-sm text-neutral-600 focus:border-neutral-800 outline-none min-h-[40px]" value={item.description} onChange={e => updateCustomItem(sectionIndex, itemIndex, 'description', e.target.value)} placeholder="Description" />
                        </div>
                      </div>
                 ))}
                 {(!section.items || section.items.length === 0) && (
                     <div className="text-center py-6 text-neutral-400 text-sm border-2 border-dashed border-neutral-200 rounded-xl">
                         No items yet. Add one!
                     </div>
                 )}
            </div>
          </GlassCard>
      ))}

      <NotificationModal notification={notification} onClose={() => setNotification(null)} />
    </div>
  );
}
