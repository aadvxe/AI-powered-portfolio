import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import React from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, gradient = false, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-neutral-200 bg-white/40 backdrop-blur-xl transition-colors duration-300",
          gradient && "hover:border-brand-cyan/50 hover:bg-white/60",
          className
        )}
        {...props}
      >
        {gradient && (
            <div className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
                 style={{
                    background: "radial-gradient(600px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(6, 182, 212, 0.1), transparent 40%)"
                 }}
            />
        )}
        {children}
      </motion.div>
    );
  }
);
GlassCard.displayName = "GlassCard";
