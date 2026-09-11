import { cn } from "@/lib/utils";
import React from "react";
import { LiquidGlass } from "./liquid-glass";
import { HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, gradient = false, ...props }, ref) => {
    return (
      <LiquidGlass
        ref={ref}
        type="project-card"
        className={cn("rounded-2xl", className)}
        {...props}
        draggable={false}
      >
        <div className="w-full h-full relative">
          {gradient && (
            <div
              className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(600px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(6, 182, 212, 0.1), transparent 40%)",
              }}
            />
          )}
          {children}
        </div>
      </LiquidGlass>
    );
  }
);
GlassCard.displayName = "GlassCard";
