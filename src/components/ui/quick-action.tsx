"use client";

import { LiquidGlass } from "@/components/ui/liquid-glass";
import { LucideIcon } from "lucide-react";

interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  layoutId?: string;
  compact?: boolean;
}

export function QuickAction({ icon: Icon, label, onClick, layoutId, compact }: QuickActionProps) {
  return (
    <LiquidGlass 
      layoutId={layoutId}
      className="rounded-[1.5rem] cursor-pointer hover:bg-white/40 transition-colors" 
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
    >
      <div className={`flex items-center gap-3 ${compact ? 'px-4 py-2' : 'px-6 py-4'}`}>
        <Icon size={compact ? 16 : 20} className="text-neutral-700" />
        <span className={`text-sm font-semibold text-neutral-600 whitespace-nowrap ${compact ? 'hidden md:inline' : ''}`}>{label}</span>
      </div>
    </LiquidGlass>
  );
}
