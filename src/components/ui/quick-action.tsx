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
      role="button"
      tabIndex={0}
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="rounded-[1.5rem] cursor-pointer hover:bg-white/40 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 landing-obstacle"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
    >
      <div className={`flex items-center gap-2 sm:gap-3 ${compact ? 'px-3 py-2 sm:py-2' : 'px-3.5 py-2.5 sm:px-6 sm:py-4'}`}>
        <Icon size={compact ? 18 : 20} className="text-neutral-700" />
        <span className={`text-sm font-semibold text-neutral-600 whitespace-nowrap ${compact ? 'hidden md:inline' : ''}`}>{label}</span>
      </div>
    </LiquidGlass>
  );
}
