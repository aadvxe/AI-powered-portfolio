"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { X, Check } from "lucide-react";

interface NotificationModalProps {
  notification: { message: string; type: "success" | "error" } | null;
  onClose: () => void;
}

export function NotificationModal({ notification, onClose }: NotificationModalProps) {
  return (
    <AnimatePresence>
      {notification && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm pointer-events-auto"
          >
            <GlassCard className="p-6 bg-white !backdrop-blur-none shadow-2xl flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full mb-4 bg-neutral-100 border border-neutral-200/80 text-neutral-800 flex items-center justify-center">
                {notification.type === "error" ? (
                  <X size={22} className="text-neutral-800" />
                ) : (
                  <Check size={22} className="text-neutral-800" strokeWidth={2.5} />
                )}
              </div>
              <h3 className="text-lg font-bold text-neutral-800 mb-2">
                {notification.type === "error" ? "Oops!" : "Success!"}
              </h3>
              <p className="text-neutral-600 mb-6 text-sm leading-relaxed">
                {notification.message}
              </p>
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors"
              >
                Close
              </button>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
