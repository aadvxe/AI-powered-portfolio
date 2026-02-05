"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { supabase } from "@/lib/supabase";
import { MessageSquare, User, Calendar, Trash2 } from "lucide-react";

interface Message {
  id: string;
  content: string;
  user_contact?: string;
  created_at: string;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setMessages(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this message?")) return;
    
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (!error) {
        setMessages(prev => prev.filter(m => m.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-800">Inbox</h1>
        <span className="text-sm text-neutral-500 bg-white px-3 py-1 rounded-full border border-neutral-200">
            {messages.length} Messages
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
            <div className="text-center py-12 text-neutral-500">Loading messages...</div>
        ) : messages.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 bg-white/50 rounded-2xl border border-dashed border-neutral-300">
                <MessageSquare size={32} className="mx-auto mb-3 text-neutral-300" />
                No messages yet.
            </div>
        ) : (
            messages.map((msg) => (
                <GlassCard key={msg.id} className="p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3 w-full">
                            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                <Calendar size={14} />
                                {new Date(msg.created_at).toLocaleDateString()} • {new Date(msg.created_at).toLocaleTimeString()}
                            </div>
                            
                            <p className="text-neutral-800 text-lg leading-relaxed">
                                {msg.content}
                            </p>

                            {msg.user_contact && (
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-cyan/10 text-brand-cyan rounded-lg text-sm font-medium">
                                    <User size={16} />
                                    {msg.user_contact}
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={() => handleDelete(msg.id)}
                            className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                            title="Delete"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </GlassCard>
            ))
        )}
      </div>
    </div>
  );
}
