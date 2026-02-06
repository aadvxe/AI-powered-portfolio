"use client";

import { useState, useEffect } from "react";

import { motion, useMotionValue, useTransform, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface LiquidGlassProps extends HTMLMotionProps<"div"> {
  children?: React.ReactNode;
  className?: string;
  type?: "menu" | "button" | "input" | "project-card" | "project-modal";
}

export function LiquidGlass({ children, className, type = "menu", style, ...props }: LiquidGlassProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Balanced stretch settings
  const scaleX = useTransform(x, (val) => 1 + Math.abs(val) / 250);
  const scaleY = useTransform(y, (val) => 1 + Math.abs(val) / 250);

  // Safari Compatibility: Disable complex SVG filters to prevent rendering artifacts
  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
      if (typeof window !== "undefined") {
          // Safari check: explicitly excludes Chrome/Edge (which also have "Safari" in UA)
          const isSafariUA = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
          setIsSafari(isSafariUA);
      }
  }, []);

  // Mobile Optimization: Disable drag gesture to prevent scrolljacking
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
      if (typeof window !== "undefined") {
          const checkMobile = () => setIsMobile(window.innerWidth < 768);
          checkMobile();
          window.addEventListener('resize', checkMobile);
          return () => window.removeEventListener('resize', checkMobile);
      }
  }, []);

  return (
    <motion.div
      className={cn("liquidGlass-wrapper", type, className)}
      style={{
        x, y,
        scaleX, scaleY,
        ...style
      }}
      drag={!isMobile}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
      whileHover={!isMobile ? (props.whileHover ?? { scale: 1.02 }) : undefined}
      whileTap={props.whileTap ?? { cursor: "default", scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
        {/* Safari Fallback: Disable filters to prevent text blurring */}{/* Safari Fallback: Remove SVG filter AND backdrop-blur to prevent blurry text */}
        <motion.div 
            layout 
            className="liquidGlass-effect" 
            style={isSafari ? { 
                filter: "none", 
                backdropFilter: "none", 
                WebkitBackdropFilter: "none" 
            } : undefined}
        />
        <motion.div layout className="liquidGlass-tint" />
        <motion.div layout className="liquidGlass-shine" />
      </div>

      <div className="liquidGlass-text w-full h-full rounded-[inherit] overflow-hidden text-left">
        {children}
      </div>
    </motion.div>
  );
}
