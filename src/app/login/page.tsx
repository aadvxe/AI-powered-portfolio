"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { GlassCard } from "@/components/ui/glass-card";
import { Lock, Mail, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Trigger full page reload to refresh session state
      window.location.href = "/admin"; 
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-4 relative overflow-hidden">
      {/* Background ambient effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-brand-cyan/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/20 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <GlassCard className="w-full max-w-md p-8 relative z-10">
           <div className="flex flex-col items-center mb-8">
                <div className="p-4 bg-white/50 rounded-full mb-4 shadow-sm">
                    <Lock size={24} className="text-neutral-700" />
                </div>
                <h1 className="text-2xl font-bold text-neutral-800">Admin Access</h1>
                <p className="text-neutral-500 text-sm mt-2">Enter credentials to unlock dashboard</p>
           </div>

           <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-500 uppercase ml-1">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/50 border border-neutral-200 rounded-xl py-3 pl-10 pr-4 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 focus:border-brand-cyan focus:bg-white transition-all"
                            placeholder="admin@example.com"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-500 uppercase ml-1">Password</label>
                     {/* Password input field */}
                    <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/50 border border-neutral-200 rounded-xl py-3 px-4 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 focus:border-brand-cyan focus:bg-white transition-all"
                        placeholder="••••••••"
                    />
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-neutral-900 text-white rounded-xl py-3 font-semibold hover:bg-neutral-800 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <>Unlock <ArrowRight size={18} /></>}
                </button>
           </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}
