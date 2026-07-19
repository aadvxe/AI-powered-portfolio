"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { SkillData } from "@/hooks/use-content";
import { SectionHeading } from "./section-heading";

interface SkillsSectionProps {
  skills: SkillData[];
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

export function SkillsSection({ skills }: SkillsSectionProps) {
  const groups = useMemo(() => {
    const map: Record<string, string[]> = {};
    skills.forEach((skill) => {
      if (!map[skill.category]) map[skill.category] = [];
      map[skill.category].push(skill.name);
    });
    return Object.entries(map);
  }, [skills]);

  return (
    <section id="skills" className="scroll-mt-20 bg-paper-deep">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <SectionHeading
          index="02"
          label="Fields of Practice"
          title="Skills"
          subtitle="Instruments and materials, arranged by discipline."
        />

        {groups.length === 0 ? (
          <p className="font-serif italic text-ink-soft">The inventory is being catalogued…</p>
        ) : (
          <div className="grid grid-cols-1 gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map(([category, names], i) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.07 }}
              >
                <div className="flex items-baseline gap-3 border-b border-line-strong pb-2">
                  <span className="font-serif text-sm italic text-clay">{ROMAN[i] || i + 1}.</span>
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink">
                    {category}
                  </h3>
                </div>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {names.map((name) => (
                    <li
                      key={name}
                      className="border border-line bg-paper px-2.5 py-1 font-mono text-[11px] tracking-[0.05em] text-ink-soft transition-colors hover:border-clay hover:text-clay"
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
