"use client";

import React from "react";
import { motion, useMotionValue, useTransform, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface LiquidGlassProps extends Omit<HTMLMotionProps<"div">, "draggable"> {
  children?: React.ReactNode;
  className?: string;
  type?: "menu" | "button" | "input" | "project-card" | "project-modal";
  draggable?: boolean | "true" | "false";
}

export const LiquidGlass = React.forwardRef<HTMLDivElement, LiquidGlassProps>(
  ({ children, className, type = "menu", style, draggable = true, ...props }, ref) => {
    const isDraggable = draggable !== false && draggable !== "false" && type !== "project-card" && type !== "project-modal";
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Balanced stretch settings (only active when draggable)
    const scaleX = useTransform(x, (val) => 1 + Math.abs(val) / 250);
    const scaleY = useTransform(y, (val) => 1 + Math.abs(val) / 250);

    // Safari Compatibility: Disable complex SVG filters to prevent rendering artifacts
    const isSafari = React.useSyncExternalStore(
      () => () => {},
      () => typeof navigator !== "undefined" && /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
      () => false
    );

    // Mobile Optimization: Disable drag gesture to prevent scrolljacking
    const isMobile = React.useSyncExternalStore(
      (callback) => {
        window.addEventListener("resize", callback);
        return () => window.removeEventListener("resize", callback);
      },
      () => window.innerWidth < 768,
      () => false
    );

    return (
      <motion.div
        ref={ref}
        className={cn("liquidGlass-wrapper", type, className)}
        style={{
          ...(isDraggable ? { x, y, scaleX, scaleY } : {}),
          ...style,
        }}
        drag={isDraggable && !isMobile}
        dragConstraints={isDraggable ? { left: 0, right: 0, top: 0, bottom: 0 } : undefined}
        dragElastic={isDraggable ? 0.1 : undefined}
        whileHover={
          props.whileHover ??
          (isDraggable ? (!isMobile ? { scale: 1.02 } : undefined) : undefined)
        }
        whileTap={
          props.whileTap ??
          (isDraggable ? { scale: 0.98 } : undefined)
        }
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        {...props}
      >
        <div className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
          {/* Safari Fallback: Disable filters to prevent text blurring */}
          <div
            className="liquidGlass-effect"
            style={
              isSafari
                ? {
                    filter: "none",
                    backdropFilter: "none",
                    WebkitBackdropFilter: "none",
                  }
                : undefined
            }
          />
          <div className="liquidGlass-tint" />
          <div className="liquidGlass-shine" />
        </div>

        <div className="liquidGlass-text w-full h-full rounded-[inherit] overflow-hidden text-left flex flex-col">
          {children}
        </div>
      </motion.div>
    );
  }
);
LiquidGlass.displayName = "LiquidGlass";
