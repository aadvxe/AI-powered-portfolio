"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { GlassCard } from "@/components/ui/glass-card";
import { Loader2, Plus, Trash2, Edit2, Code2, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SkillData } from "@/hooks/use-content";
import { NotificationModal } from "@/components/admin/notification-modal";

export default function AdminSkills() {
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [renamingCategory, setRenamingCategory] = useState<{oldName: string, newName: string} | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [currentSkill, setCurrentSkill] = useState<Partial<SkillData>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setLoading(true);
    const { data } = await supabase.from('skills').select('*').order('category', { ascending: true });
    if (data) setSkills(data);
    setLoading(false);
  };

  const handleEdit = (skill: SkillData) => {
    setCurrentSkill(skill);
    setIsEditing(true);
  };

  const handleNew = () => {
    setCurrentSkill({
        name: "",
        category: "Frontend",
        proficiency: 80
    });
    setIsEditing(true);
  };

  const handleNewInCategory = (category: string) => {
    setCurrentSkill({
        name: "",
        category: category,
        proficiency: 80
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
      if(!confirm("Delete this skill?")) return;
      const { error } = await supabase.from('skills').delete().eq('id', id);
      if (!error) {
          setSkills(prev => prev.filter(s => s.id !== id));
          setNotification({ message: "Skill deleted successfully.", type: "success" });
      } else {
            setNotification({ message: "Failed to delete skill: " + error.message, type: "error" });
      }
  };

  const handleRenameCategory = (oldCategory: string) => {
      setRenamingCategory({ oldName: oldCategory, newName: oldCategory });
  };

  const handleConfirmRename = async () => {
      if (!renamingCategory || renamingCategory.newName === renamingCategory.oldName) {
          setRenamingCategory(null);
          return;
      }
      
      setLoading(true);
      const { oldName, newName } = renamingCategory;

      // Bulk update
      const { error } = await supabase
          .from('skills')
          .update({ category: newName })
          .eq('category', oldName);

      if (error) {
          setNotification({ message: "Error renaming category: " + error.message, type: "error" });
      } else {
          // Refresh locally
          setSkills(prev => prev.map(s => s.category === oldName ? { ...s, category: newName } : s));
          setRenamingCategory(null);
          setNotification({ message: `Renamed "${oldName}" to "${newName}" successfully!`, type: "success" });
      }
      setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Auto-assign icon based on category for data consistency if backend requires it
    // But mostly frontend handles display logic. We'll just save specific fields.
    const s = { ...currentSkill };
    
    let result;
    if (s.id) {
        result = await supabase.from('skills').update(s).eq('id', s.id).select();
    } else {
        result = await supabase.from('skills').insert([s]).select();
    }

    const { data, error } = result;

    if (error) {
        setNotification({ message: "Error saving skill: " + error.message, type: "error" });
    } else if (data) {
        if (s.id) {
            setSkills(prev => prev.map(item => item.id === data[0].id ? data[0] as SkillData : item));
        } else {
            setSkills(prev => [...prev, data[0] as SkillData]);
        }
        setIsEditing(false);
        setNotification({ message: "Skill saved successfully!", type: "success" });
    }
    setSaving(false);
  };

  // Grouping for Display
  const groupedSkills = skills.reduce((acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
  }, {} as Record<string, SkillData[]>);

  if (loading) return <div className="p-12 text-center text-neutral-500">Loading skills...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-800">Skills Manager</h1>
        <button 
            onClick={handleNew}
            className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-neutral-800 transition-colors"
        >
            <Plus size={16} /> Add Skill
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(groupedSkills).map(([category, list]) => (
            <GlassCard key={category} className="p-6 space-y-4">
                <h3 className="font-bold text-neutral-800 border-b border-neutral-100 pb-2 mb-2 flex items-center justify-between group/header">
                    <div className="flex items-center gap-2">
                        {category}
                        <button 
                             onClick={() => handleNewInCategory(category)}
                             className="opacity-0 group-hover/header:opacity-100 p-1 hover:bg-neutral-100 rounded text-neutral-400 hover:text-brand-cyan transition-all"
                             title="Add Skill to Category"
                        >
                            <Plus size={12} />
                        </button>
                        <button 
                            onClick={() => handleRenameCategory(category)}
                            className="opacity-0 group-hover/header:opacity-100 p-1 hover:bg-neutral-100 rounded text-neutral-400 hover:text-brand-cyan transition-all"
                            title="Rename Category"
                        >
                            <Edit2 size={12} />
                        </button>
                    </div>
                    <span className="text-xs font-normal text-neutral-400">{list.length} skills</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                    {list.map(skill => (
                        <div key={skill.id} className="group relative px-3 py-1.5 bg-white border border-neutral-100 rounded-lg flex items-center gap-2 hover:border-brand-cyan/30 transition-colors">
                            <span className="text-sm font-medium text-neutral-700">{skill.name}</span>
                            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity border-l border-neutral-100 pl-2 ml-1">
                                <button onClick={() => handleEdit(skill)} className="text-neutral-400 hover:text-brand-cyan">
                                    <Edit2 size={12} />
                                </button>
                                <button onClick={() => handleDelete(skill.id)} className="text-neutral-400 hover:text-red-500">
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        ))}
        {skills.length === 0 && (
             <div className="col-span-2 text-center py-12 text-neutral-400 bg-neutral-50/50 rounded-2xl border border-dashed border-neutral-200">
                 No skills found. Add your first one!
             </div>
        )}
      </div>

        {/* Edit Modal */}
        <AnimatePresence>
         {isEditing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-md"
                >
                    <GlassCard className="p-6 bg-white !backdrop-blur-none shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-neutral-800">{currentSkill.id ? "Edit Skill" : "New Skill"}</h2>
                            <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-neutral-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-neutral-500 uppercase">Skill Name</label>
                                <input 
                                    className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                                    value={currentSkill.name || ""}
                                    onChange={e => setCurrentSkill({...currentSkill, name: e.target.value})}
                                    required
                                    placeholder="e.g. React.js"
                                />
                            </div>
                            
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-neutral-500 uppercase">Category</label>
                                <div className="space-y-2">
                                    <input 
                                        type="text"
                                        className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                                        value={currentSkill.category || ""}
                                        onChange={e => setCurrentSkill({...currentSkill, category: e.target.value})}
                                        placeholder="Type category..."
                                    />
                                    <div className="flex flex-wrap gap-2">
                                        {["Frontend Development", "Backend & Infrastructure", "AI & Data Science", "Tools & DevOps"].map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setCurrentSkill({...currentSkill, category: cat})}
                                                className="px-2 py-1 bg-neutral-100 text-[10px] text-neutral-600 rounded-md hover:bg-neutral-200 transition-colors"
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-neutral-500 uppercase">Proficiency ({currentSkill.proficiency}%)</label>
                                <input 
                                    type="range"
                                    min="0" max="100" step="10"
                                    className="w-full"
                                    value={currentSkill.proficiency || 50}
                                    onChange={e => setCurrentSkill({...currentSkill, proficiency: parseInt(e.target.value)})}
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 flex items-center gap-2"
                                >
                                    {saving && <Loader2 size={16} className="animate-spin" />}
                                    Save
                                </button>
                            </div>
                        </form>
                    </GlassCard>
                </motion.div>
            </div>
        )}
        </AnimatePresence>

        {/* Rename Modal */}
        <AnimatePresence>
            {renamingCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-sm"
                    >
                        <GlassCard className="p-6 bg-white !backdrop-blur-none shadow-2xl">
                            <h2 className="text-xl font-bold text-neutral-800 mb-4">Rename Category</h2>
                            <form onSubmit={(e) => { e.preventDefault(); handleConfirmRename(); }} className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-neutral-500 uppercase">New Name</label>
                                    <input 
                                        autoFocus
                                        className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 mt-1"
                                        value={renamingCategory.newName}
                                        onChange={e => setRenamingCategory({...renamingCategory, newName: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="pt-2 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setRenamingCategory(null)}
                                        className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 flex items-center gap-2"
                                    >
                                        {loading && <Loader2 size={16} className="animate-spin" />}
                                        Rename
                                    </button>
                                </div>
                            </form>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

      <NotificationModal notification={notification} onClose={() => setNotification(null)} />
    </div>
  );
}
