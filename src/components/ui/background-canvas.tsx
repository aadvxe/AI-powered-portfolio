"use client";

import { useEffect, memo } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";

export const BackgroundCanvas = memo(function BackgroundCanvas() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Center light initially
    mouseX.set(window.innerWidth / 2);
    mouseY.set(window.innerHeight / 3);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const backgroundStyle = useMotionTemplate`
    radial-gradient(
      circle at ${springX}px ${springY}px, 
      rgba(180, 220, 255, 0.3) 0%, 
      rgba(255, 200, 220, 0.2) 25%, 
      rgba(255, 255, 255, 0) 60%
    ),
    linear-gradient(to bottom right, #ffffff, #f8f9fa)
  `;

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Interactive Light Gradient */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{ background: backgroundStyle }}
      />
      {/* Tahoe Grid Overlay */}
      <div className="absolute inset-0 tahoe-grid-bg opacity-70" />
    </div>
  );
});
