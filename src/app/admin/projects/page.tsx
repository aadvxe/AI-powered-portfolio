"use client";

import { useState } from "react";
import { useContent, ProjectData } from "@/hooks/use-content";
import { GlassCard } from "@/components/ui/glass-card";
import { supabase } from "@/lib/supabase";
import { Plus, Edit2, Trash2, Loader2, Save, X, Link as LinkIcon, Github, Star, Minus, PlusCircle, ArrowUp, ArrowDown, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageUploader } from "@/components/admin/image-uploader";
import { MarkdownEditor } from "@/components/admin/markdown-editor";

import { NotificationModal } from "@/components/admin/notification-modal";

export default function AdminProjects() {
  const { projects: initialProjects } = useContent();
  const [projects, setProjects] = useState<ProjectData[]>(initialProjects);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<ProjectData>>({});
  const [saving, setSaving] = useState(false);
  const [isAutofillingTags, setIsAutofillingTags] = useState(false);
  const [tagsString, setTagsString] = useState("");
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Sync with hook (simple version)
  if (projects.length === 0 && initialProjects.length > 0) {
      setProjects(initialProjects);
  }

  const handleEdit = (project: ProjectData) => {
    setCurrentProject({
        ...project,
        custom_links: project.custom_links || []
    });
    setTagsString(project.tags?.join(", ") || "");
    setIsEditing(true);
  };

  const handleNew = () => {
    setCurrentProject({
        title: "",
        category: "Personal Project",
        tags: [],
        description: "",
        gradient: "bg-gradient-to-br from-neutral-200 to-neutral-300",
        featured: false,
        custom_links: []
    });
    setTagsString("");
    setIsEditing(true);
  };

  const handleAutofillTags = async () => {
    if (!currentProject.title && !currentProject.description) {
      setNotification({ message: "Please provide a project title or description first.", type: "error" });
      return;
    }

    setIsAutofillingTags(true);
    try {
      const res = await fetch("/api/admin/autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "project-tags",
          data: {
            title: currentProject.title || "",
            category: currentProject.category || "",
            description: currentProject.description || "",
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to generate tags");
      }

      const generatedTags: string[] = json.tags || [];
      if (generatedTags.length === 0) {
        setNotification({ message: "No tags could be detected from this description.", type: "error" });
        return;
      }

      // Merge with existing tags (case-insensitive deduplication)
      const existingTags = currentProject.tags || [];
      const lowerExisting = new Set(existingTags.map(t => t.toLowerCase()));
      const newUniqueTags = generatedTags.filter(t => !lowerExisting.has(t.toLowerCase()));
      const mergedTags = [...existingTags, ...newUniqueTags];

      setTagsString(mergedTags.join(", "));
      setCurrentProject(prev => ({
        ...prev,
        tags: mergedTags,
      }));

      setNotification({
        message: newUniqueTags.length > 0 
          ? `Added ${newUniqueTags.length} tag${newUniqueTags.length === 1 ? "" : "s"} with AI!` 
          : "All suggested tags are already present.",
        type: "success",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error generating tags";
      setNotification({ message, type: "error" });
    } finally {
      setIsAutofillingTags(false);
    }
  };

  const addCustomLink = () => {
      setCurrentProject(prev => ({
          ...prev,
          custom_links: [...(prev.custom_links || []), { label: "", url: "" }]
      }));
  };

  const removeCustomLink = (index: number) => {
      setCurrentProject(prev => ({
          ...prev,
          custom_links: prev.custom_links?.filter((_, i) => i !== index)
      }));
  };

  const updateCustomLink = (index: number, key: 'label' | 'url', value: string) => {
      setCurrentProject(prev => {
          const newLinks = [...(prev.custom_links || [])];
          newLinks[index] = { ...newLinks[index], [key]: value };
          return { ...prev, custom_links: newLinks };
      });
  };

  const handleDelete = async (id: string) => {
      if(!confirm("Are you sure? This cannot be undone.")) return;
      
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) {
          setNotification({ message: "Error deleting: " + error.message, type: "error" });
      } else {
          setProjects(prev => prev.filter(p => p.id !== id));
          setNotification({ message: "Project deleted successfully", type: "success" });
      }
  };

  const moveProject = async (id: string, direction: 'up' | 'down') => {
      const index = projects.findIndex(p => p.id === id);
      if (index === -1) return;
      
      const newProjects = [...projects];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= newProjects.length) return;

      // Swap in local state for instant feedback
      [newProjects[index], newProjects[targetIndex]] = [newProjects[targetIndex], newProjects[index]];
      setProjects(newProjects);

      // We need to update the display_order for ALL items to ensure consistency
      // Or at least swap the orders of the two items. 
      // Simplest robust way: Update the swapped items' display_order.
      
      // Let's assume the local index IS the display order desired.
      const updates = newProjects.map((p, i) => ({ id: p.id, display_order: i }));
      
      // Batch update (Supabase doesn't have a direct batch update, so promise.all)
      // Optimization: Only update the two changed items if possible, but safe is all.
      // Let's just update the two swapped items.
      
      const itemA = newProjects[index]; // Note: these are swapped positions now
      const itemB = newProjects[targetIndex];

      await Promise.all([
          supabase.from('projects').update({ display_order: index }).eq('id', itemA.id),
          supabase.from('projects').update({ display_order: targetIndex }).eq('id', itemB.id)
      ]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Auto populate ID for new projects if not exists (supabase does this, but for local state opt)
    
    const isNew = !currentProject.id;
    const p = { ...currentProject };
    
    // Ensure array fields
    if (!p.tags) p.tags = [];
    if (!p.custom_links) p.custom_links = [];

    let result;
    if (isNew) {
        result = await supabase.from('projects').insert([p]).select();
    } else {
        result = await supabase.from('projects').update(p).eq('id', p.id).select();
    }

    const { data, error } = result;

    if (error) {
        setNotification({ message: "Error saving: " + error.message, type: "error" });
    } else if (data) {
        if (isNew) {
            setProjects(prev => [data[0] as ProjectData, ...prev]);
        } else {
            setProjects(prev => prev.map(item => item.id === data[0].id ? data[0] as ProjectData : item));
        }
        setIsEditing(false);
        setNotification({ message: "Project saved successfully", type: "success" });
    }
    
    setSaving(false);
  };


  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-800">Projects</h1>
        <button 
            onClick={handleNew}
            className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-neutral-800 transition-colors"
        >
            <Plus size={16} /> New Project
        </button>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-neutral-100 bg-neutral-50/50 text-xs font-semibold uppercase text-neutral-500 tracking-wider">
            <div className="col-span-1">Img</div>
            <div className="col-span-3">Title</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Links</div>
            <div className="col-span-2">Feat</div>
            <div className="col-span-2 text-right">Actions</div>
        </div>
        
        {/* Table Body */}
        <div className="divide-y divide-neutral-100">
            {projects.map((p) => (
                <div key={p.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-neutral-50 transition-colors">
                     <div className="col-span-1">
                        <div className={`w-10 h-10 rounded-lg bg-neutral-100 overflow-hidden relative`}>
                            {p.image_url && <img src={p.image_url} alt="" className="w-full h-full object-cover" />}
                        </div>
                    </div>
                    <div className="col-span-3 font-medium text-neutral-800 truncate">{p.title}</div>
                    <div className="col-span-2 text-sm text-neutral-500 truncate">
                        <span className="px-2 py-1 bg-white border border-neutral-100 rounded-md shadow-sm">
                            {p.category}
                        </span>
                    </div>
                    <div className="col-span-2 flex gap-2">
                        {p.demo_link && <a href={p.demo_link} target="_blank" className="text-neutral-400 hover:text-neutral-900"><LinkIcon size={14} /></a>}
                        {p.repo_link && <a href={p.repo_link} target="_blank" className="text-neutral-400 hover:text-black"><Github size={14} /></a>}
                    </div>
                     <div className="col-span-2">
                         {p.featured ? <Star size={14} className="text-yellow-500 fill-yellow-500" /> : <span className="text-neutral-300">-</span>}
                     </div>
                    <div className="col-span-2 flex items-center justify-end gap-2">
                        {/* Reordering Buttons */}
                        <div className="flex flex-col gap-0.5 mr-2">
                            <button 
                                onClick={(e) => { e.stopPropagation(); moveProject(p.id, 'up'); }} 
                                className="text-neutral-400 hover:text-neutral-900 disabled:opacity-30"
                                disabled={projects.findIndex(proj => proj.id === p.id) === 0}
                            >
                                <ArrowUp size={12} />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); moveProject(p.id, 'down'); }} 
                                className="text-neutral-400 hover:text-neutral-900 disabled:opacity-30"
                                disabled={projects.findIndex(proj => proj.id === p.id) === projects.length - 1}
                            >
                                <ArrowDown size={12} />
                            </button>
                        </div>
                        <button onClick={() => handleEdit(p)} className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors">
                            <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ))}
            {projects.length === 0 && (
                <div className="p-8 text-center text-neutral-500">
                    No projects found. Create your first one!
                </div>
            )}
        </div>
      </GlassCard>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="w-full max-w-6xl lg:max-w-7xl h-[92vh] flex flex-col my-auto"
                >
                    <GlassCard className="h-full flex flex-col p-5 sm:p-7 bg-white !backdrop-blur-none shadow-2xl rounded-2xl overflow-hidden">
                        {/* Pinned Modal Header */}
                        <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100 flex-shrink-0">
                            <h2 className="text-xl font-bold text-neutral-800">{currentProject.id ? "Edit Project" : "New Project"}</h2>
                            <button onClick={() => setIsEditing(false)} className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSave} className="flex-1 min-h-0 flex flex-col pt-3 overflow-hidden">
                            {/* Main Split Grid: Left is Core Info & Image, Right is Dedicated Full-Height Markdown Editor */}
                            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-y-auto lg:overflow-hidden pr-0.5">
                                
                                {/* Left Column: Image & Core Details (Independently scrollable on desktop) */}
                                <div className="lg:col-span-5 flex flex-col space-y-3.5 lg:overflow-y-auto lg:pr-2.5 custom-scrollbar">
                                    {/* Project Image */}
                                    <ImageUploader 
                                        value={currentProject.image_url || ""}
                                        onChange={url => setCurrentProject({...currentProject, image_url: url})}
                                        bucket="portfolio"
                                    />

                                    {/* Title */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-neutral-500 uppercase">Title</label>
                                        <input 
                                            className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-800/30 text-sm"
                                            value={currentProject.title || ""}
                                            onChange={e => setCurrentProject({...currentProject, title: e.target.value})}
                                            required
                                        />
                                    </div>

                                    {/* Category & Date */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-neutral-500 uppercase">Category</label>
                                            <input 
                                                className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-800/30 text-sm"
                                                value={currentProject.category || ""}
                                                onChange={e => setCurrentProject({...currentProject, category: e.target.value})}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-neutral-500 uppercase">Year</label>
                                                <input 
                                                    type="number"
                                                    className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-800/30 text-sm"
                                                    value={currentProject.year || ""}
                                                    onChange={e => setCurrentProject({...currentProject, year: parseInt(e.target.value) || undefined})}
                                                    placeholder="2025"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-neutral-500 uppercase">Month</label>
                                                <input 
                                                    className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-800/30 text-sm"
                                                    value={currentProject.month || ""}
                                                    onChange={e => setCurrentProject({...currentProject, month: e.target.value})}
                                                    placeholder="Jan"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-semibold text-neutral-500 uppercase">Tags</label>
                                            <button
                                                type="button"
                                                onClick={handleAutofillTags}
                                                disabled={isAutofillingTags || (!currentProject.title && !currentProject.description)}
                                                title="Autofill tags based on title, category, and description using AI"
                                                className="text-xs flex items-center gap-1.5 text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-2.5 py-0.5 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium cursor-pointer"
                                            >
                                                {isAutofillingTags ? (
                                                    <Loader2 size={12} className="animate-spin text-purple-600" />
                                                ) : (
                                                    <Sparkles size={12} className="text-purple-600" />
                                                )}
                                                <span>{isAutofillingTags ? "Generating..." : "Auto-fill Tags"}</span>
                                            </button>
                                        </div>
                                        <input 
                                            className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-800/30 text-sm"
                                            value={tagsString}
                                            onChange={e => {
                                                setTagsString(e.target.value);
                                                setCurrentProject(prev => ({
                                                    ...prev,
                                                    tags: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                                                }));
                                            }}
                                            placeholder="React, Next.js, Tailwind (comma separated)"
                                        />
                                    </div>

                                    {/* Links */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-neutral-500 uppercase">Demo Link</label>
                                            <input 
                                                className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-800/30 text-sm"
                                                value={currentProject.demo_link || ""}
                                                onChange={e => setCurrentProject({...currentProject, demo_link: e.target.value})}
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-neutral-500 uppercase">GitHub Repo</label>
                                            <input 
                                                className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-800/30 text-sm"
                                                value={currentProject.repo_link || ""}
                                                onChange={e => setCurrentProject({...currentProject, repo_link: e.target.value})}
                                                placeholder="https://github.com/..."
                                            />
                                        </div>
                                    </div>

                                    {/* Custom Links */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-semibold text-neutral-500 uppercase">Custom Buttons (Deck, Paper, etc)</label>
                                            <button type="button" onClick={addCustomLink} className="text-xs flex items-center gap-1 text-neutral-900 hover:underline font-medium">
                                                <PlusCircle size={14} /> Add Link
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {currentProject.custom_links?.map((link, i) => (
                                                <div key={i} className="flex gap-2 items-center">
                                                    <input 
                                                        className="flex-1 p-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-neutral-800/30"
                                                        placeholder="Label"
                                                        value={link.label}
                                                        onChange={e => updateCustomLink(i, 'label', e.target.value)}
                                                    />
                                                    <input 
                                                        className="flex-[2] p-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-neutral-800/30"
                                                        placeholder="URL"
                                                        value={link.url}
                                                        onChange={e => updateCustomLink(i, 'url', e.target.value)}
                                                    />
                                                    <button type="button" onClick={() => removeCustomLink(i)} className="text-neutral-400 hover:text-red-500 transition-colors">
                                                        <Minus size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                            {(!currentProject.custom_links || currentProject.custom_links.length === 0) && (
                                                <div className="text-xs text-neutral-400 italic">No custom buttons added.</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Gradient & Featured Toggle */}
                                    <div className="flex items-center justify-between pt-1">
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="checkbox"
                                                id="featured"
                                                checked={currentProject.featured || false}
                                                onChange={e => setCurrentProject({...currentProject, featured: e.target.checked})}
                                                className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                                            />
                                            <label htmlFor="featured" className="text-xs font-medium text-neutral-700 select-none cursor-pointer">Feature this project</label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs font-semibold text-neutral-500 uppercase">Gradient</label>
                                            <input 
                                                className="w-32 p-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-neutral-800/30 font-mono"
                                                value={currentProject.gradient || ""}
                                                onChange={e => setCurrentProject({...currentProject, gradient: e.target.value})}
                                                placeholder="bg-neutral-100"
                                            />
                                            <div className={`h-7 w-7 rounded-md flex-shrink-0 ${currentProject.gradient || 'bg-neutral-100'}`} />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Dedicated Full-Height Markdown Editor (With Independent Scrolling) */}
                                <div className="lg:col-span-7 flex flex-col min-h-[420px] lg:min-h-0 h-full overflow-hidden">
                                    <div className="flex items-center justify-between mb-1.5 flex-shrink-0">
                                        <label className="text-xs font-semibold text-neutral-500 uppercase">
                                            Description (Markdown, Images & Mermaid Supported)
                                        </label>
                                    </div>
                                    <MarkdownEditor 
                                        value={currentProject.description || ""}
                                        onChange={(val) => setCurrentProject(prev => ({ ...prev, description: val }))}
                                        placeholder="Supports Markdown: # Headings, **bold**, - lists, [links](url), image uploads, and ```mermaid diagrams..."
                                        className="flex-1 min-h-0 h-full"
                                    />
                                </div>
                            </div>

                            {/* Modal Footer (Pinned at bottom) */}
                            <div className="pt-3.5 flex justify-end gap-2 border-t border-neutral-100 mt-3 flex-shrink-0 bg-white">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2 text-sm bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 flex items-center gap-2 shadow-xs transition-colors"
                                >
                                    {saving && <Loader2 size={16} className="animate-spin" />}
                                    Save Project
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
