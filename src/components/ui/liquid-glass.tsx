"use client";

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

  return (
    <motion.div
      className={cn("liquidGlass-wrapper", type, className)}
      style={{
        x, y,
        scaleX, scaleY,
        ...style
      }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
      whileHover={props.whileHover ?? { scale: 1.02 }}
      whileTap={props.whileTap ?? { cursor: "default", scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
        <motion.div layout className="liquidGlass-effect" />
        <motion.div layout className="liquidGlass-tint" />
        <motion.div layout className="liquidGlass-shine" />
      </div>

      <div className="liquidGlass-text w-full h-full rounded-[inherit] overflow-hidden text-left">
        {children}
      </div>
    </motion.div>
  );
}
