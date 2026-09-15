"use client";

import { motion, type Transition, useReducedMotion } from "framer-motion";
import { type ElementType, type ReactNode } from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

type SplitMode = "word" | "char";

export interface TextRevealProps {
  text: string | string[];
  as?: ElementType;
  className?: string;
  split?: SplitMode;
  stagger?: number;
  delay?: number;
  blur?: number;
  yOffset?: string | number;
  spring?: { stiffness?: number; damping?: number; mass?: number };
  once?: boolean;
  whileInView?: boolean;
  children?: ReactNode;
}

const DEFAULT_SPRING = { type: "spring", stiffness: 140, damping: 26, mass: 1.2 } as const;
const REVEALED = { opacity: 1, y: 0, filter: "blur(0px)" };

type WordGroup = { text: string; trailing: string };

function splitWords(line: string): WordGroup[] {
  const groups: WordGroup[] = [];
  const regex = /(\S+)(\s*)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(line)) !== null) {
    groups.push({ text: match[1], trailing: match[2] });
  }
  return groups;
}

function splitChars(line: string): string[] {
  return Array.from(line);
}

export function TextReveal({
  text,
  as: Component = "div",
  className,
  split = "word",
  stagger = 0.035,
  delay = 0,
  blur = 8,
  yOffset = "0.6em",
  spring,
  once = true,
  whileInView = true,
  children,
}: TextRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  // Only use spring physics when the caller explicitly opts in via `spring`. Splitting
  // opacity onto its own fixed-duration tween while y/filter follow spring physics (no
  // fixed duration) lets them finish at different times — text reads as fully visible
  // while still clearly blurred, which looks like a rendering glitch, not a reveal.
  // Keeping every property on one unified curve guarantees they land in lockstep.
  const useSpringPhysics = Boolean(spring);
  const mergedSpring = { ...DEFAULT_SPRING, ...spring };
  const lines = Array.isArray(text) ? text : [text];

  // Reduced motion: skip the animation entirely, render already-revealed.
  const initial = prefersReducedMotion ? REVEALED : { opacity: 0, y: yOffset, filter: `blur(${blur}px)` };

  let unitIndex = 0;

  return (
    <Component className={cn("inline-block", className)}>
      {lines.map((line, lineIndex) => {
        const units = split === "char" ? splitChars(line) : splitWords(line);

        return (
          <span key={lineIndex} className="block overflow-hidden">
            {units.map((unit, unitIdx) => {
              const currentIndex = unitIndex++;
              const unitTransition: Transition = prefersReducedMotion
                ? { duration: 0 }
                : useSpringPhysics
                  ? { ...mergedSpring, delay: delay + currentIndex * stagger }
                  : { duration: 0.5, ease: EASE_OUT, delay: delay + currentIndex * stagger };

              // Prefer Framer Motion's own built-in `whileInView` (native IntersectionObserver
              // handling per element) over a hand-rolled useInView+ref — fewer moving parts,
              // and it doesn't need a ref forwarded through a polymorphic `as` element.
              const revealProps = prefersReducedMotion
                ? {}
                : whileInView
                  ? { whileInView: REVEALED, viewport: { once, margin: "0px 0px -10% 0px" } }
                  : { animate: REVEALED };

              if (split === "char") {
                const char = unit as string;
                return (
                  <span
                    key={unitIdx}
                    className="inline-block overflow-hidden"
                    style={char === " " ? { whiteSpace: "pre" } : undefined}
                  >
                    <motion.span
                      className="inline-block"
                      style={{ willChange: "opacity, transform, filter" }}
                      initial={initial}
                      transition={unitTransition}
                      {...revealProps}
                    >
                      {char}
                    </motion.span>
                  </span>
                );
              }

              const word = unit as WordGroup;
              return (
                <span key={unitIdx} className="inline-block overflow-hidden">
                  <motion.span
                    className="inline-block"
                    style={{ willChange: "opacity, transform, filter" }}
                    initial={initial}
                    transition={unitTransition}
                    {...revealProps}
                  >
                    {word.text}
                  </motion.span>
                  {word.trailing && <span style={{ whiteSpace: "pre" }}>{word.trailing}</span>}
                </span>
              );
            })}
          </span>
        );
      })}
      {children}
    </Component>
  );
}
