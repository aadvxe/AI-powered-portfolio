"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { useContent } from "@/hooks/use-content";
import { supabase } from "@/lib/supabase";
import { Briefcase, User, Eye, ArrowUp, ArrowRight, Layers, BrainCircuit, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { NotificationModal } from "@/components/admin/notification-modal";
import { ConfirmationModal } from "@/components/admin/confirmation-modal";

export default function AdminDashboard() {
  const { projects, skills } = useContent(); 
  const [reindexing, setReindexing] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [showReindexConfirm, setShowReindexConfirm] = useState(false);

  const handleReindexClick = () => {
    setShowReindexConfirm(true);
  };

  const performReindex = async () => {
    setReindexing(true);
    try {
        const res = await fetch('/api/admin/reindex', { method: 'POST' });
        const data = await res.json();
        if (res.ok) {
            setNotification({ message: `Success! Indexed ${data.count} documents.`, type: "success" });
        } else {
            setNotification({ message: "Error: " + data.error, type: "error" });
        }
    } catch (e) {
        setNotification({ message: "Failed to reach server", type: "error" });
    } finally {
        setReindexing(false);
    }
  };

  const stats = [
    { label: "Total Projects", value: projects.length, icon: Briefcase, color: "text-brand-cyan", bg: "bg-brand-cyan/10" },
    { label: "Active Skills", value: skills.length, icon: Layers, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-800">Dashboard</h1>
        <p className="text-neutral-500 mt-1">Portfolio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
            <GlassCard key={stat.label} className="p-6 flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                    <stat.icon size={24} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-neutral-900">{stat.value}</h3>
                    <p className="text-sm font-medium text-neutral-500">{stat.label}</p>
                </div>
            </GlassCard>
        ))}
      </div>

      {/* Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Recent Projects */}
         <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-neutral-800 flex items-center gap-2">
                    <Briefcase size={20} className="text-neutral-400" />
                    Recent Projects
                </h3>
                <Link href="/admin/projects" className="text-sm font-semibold text-brand-cyan hover:underline flex items-center">
                    View All <ArrowRight size={14} className="ml-1" />
                </Link>
            </div>
            <div className="space-y-3">
                {projects.slice(0, 3).map((p) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer border border-transparent hover:border-neutral-100">
                        <div className={`w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0`}>
                             {p.image_url ? (
                                <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                             ) : (
                                <div className={`w-full h-full ${p.gradient}`} />
                             )}
                        </div>
                        <div className="min-w-0">
                            <div className="font-semibold text-neutral-800 truncate">{p.title}</div>
                            <div className="text-xs text-neutral-500">{p.category}</div>
                        </div>
                    </div>
                ))}
            </div>
         </GlassCard>

         {/* Quick Actions */}
         <GlassCard className="p-6">
            <h3 className="font-bold text-neutral-800 flex items-center gap-2 mb-6">
                <User size={20} className="text-neutral-400" />
                Quick Actions
            </h3>
            <div className="space-y-3">
                 <Link href="/admin/profile" className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors group">
                    <span className="font-medium text-neutral-700">Update "About Me"</span>
                    <ArrowRight size={16} className="text-neutral-400 group-hover:text-neutral-800 transition-colors" />
                </Link>
                <Link href="/admin/skills" className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors group">
                    <span className="font-medium text-neutral-700">Manage Skills</span>
                    <ArrowRight size={16} className="text-neutral-400 group-hover:text-neutral-800 transition-colors" />
                </Link>
                
                <button 
                    onClick={handleReindexClick}
                    disabled={reindexing}
                    className="w-full flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors group text-left"
                >
                    <span className="font-medium text-neutral-700 flex items-center gap-2">
                        {reindexing ? <Loader2 size={16} className="animate-spin text-brand-cyan" /> : <BrainCircuit size={16} className="text-brand-cyan" />}
                        {reindexing ? "Re-indexing..." : "Rebuild AI Index"}
                    </span>
                    <ArrowRight size={16} className="text-neutral-400 group-hover:text-neutral-800 transition-colors" />
                </button>
            </div>
         </GlassCard>
      </div>

      <NotificationModal 
        notification={notification} 
        onClose={() => setNotification(null)} 
      />

      <ConfirmationModal
        isOpen={showReindexConfirm}
        onClose={() => setShowReindexConfirm(false)}
        onConfirm={performReindex}
        title="Rebuild Knowledge Base?"
        message="This will re-scan your profile, projects, and skills to update the AI's memory. This process usually takes a few seconds."
      />
    </div>
  );
}
