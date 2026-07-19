"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { motion } from "framer-motion";
import { ExternalLink, ArrowUpRight } from "lucide-react";
import { ProfileData } from "@/hooks/use-content";
import { SectionHeading } from "./section-heading";

interface AboutSectionProps {
  profile: ProfileData | null;
}

function BulletText({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <>
      {text.split("\n").map((line, idx) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("-") || trimmed.startsWith("•")) {
          return (
            <div key={idx} className="mb-1.5 flex items-start gap-3">
              <span className="mt-2.5 h-px w-3 shrink-0 bg-clay" aria-hidden />
              <span>{trimmed.substring(1).trim()}</span>
            </div>
          );
        }
        return trimmed ? (
          <p key={idx} className="mb-1.5">
            {line}
          </p>
        ) : null;
      })}
    </>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <h3 className="overline-label shrink-0 !text-ink">{children}</h3>
      <span className="h-px flex-1 bg-line" aria-hidden />
    </div>
  );
}

function Entry({
  left,
  title,
  subtitle,
  meta,
  children,
}: {
  left?: string;
  title: string;
  subtitle?: string;
  meta?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 border-b border-line py-6 last:border-b-0 md:grid-cols-[160px_1fr] md:gap-8">
      <div className="font-mono text-[11px] uppercase leading-5 tracking-[0.15em] text-ink-soft">
        {left}
      </div>
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h4 className="font-serif text-xl tracking-tight text-ink">{title}</h4>
          {meta && (
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
              {meta}
            </span>
          )}
        </div>
        {subtitle && <div className="mt-0.5 font-serif italic text-ink-soft">{subtitle}</div>}
        {children}
      </div>
    </div>
  );
}

export function AboutSection({ profile }: AboutSectionProps) {
  const hidden = profile?.hidden_sections || [];
  const experiences = profile?.experiences || [];
  const education = profile?.education || [];
  const certifications = profile?.certifications || [];
  const achievements = profile?.achievements || [];
  const customSections = profile?.custom_sections || [];

  const defaultOrder = ["experiences", "education", "certifications", "achievements"];
  const order = (profile?.section_order || defaultOrder).filter((s) => s !== "about");
  // Ensure standard sections missing from a legacy order still appear
  const fullOrder = [
    ...order,
    ...defaultOrder.filter((s) => !order.includes(s)),
    ...customSections.map((s) => s.id).filter((id) => !order.includes(id)),
  ].filter((s, i, arr) => arr.indexOf(s) === i && !hidden.includes(s));

  const blocks: Record<string, React.ReactNode> = {
    experiences: experiences.length > 0 && (
      <div key="experiences" id="about-experience" className="scroll-mt-24">
        <SubHeading>Work Experience</SubHeading>
        <div className="border-t border-line">
          {experiences.map((exp: any, i: number) => (
            <Entry key={i} left={exp.period} title={exp.role} subtitle={exp.company}>
              <div className="mt-3 font-serif text-[15px] leading-relaxed text-ink-soft">
                <BulletText text={exp.description} />
              </div>
              {exp.skills && (
                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft/80">
                  {exp.skills.split(",").map((skill: string, idx: number) => (
                    <span key={idx}>#{skill.trim()}</span>
                  ))}
                </div>
              )}
            </Entry>
          ))}
        </div>
      </div>
    ),
    education: education.length > 0 && (
      <div key="education" id="about-education" className="scroll-mt-24">
        <SubHeading>Education</SubHeading>
        <div className="border-t border-line">
          {education.map((edu: any, i: number) => (
            <Entry
              key={i}
              left={edu.year}
              title={edu.degree}
              subtitle={edu.school}
              meta={edu.gpa ? `GPA ${edu.gpa}` : undefined}
            >
              {edu.description && (
                <div className="mt-3 font-serif text-[15px] leading-relaxed text-ink-soft">
                  <BulletText text={edu.description} />
                </div>
              )}
            </Entry>
          ))}
        </div>
      </div>
    ),
    certifications: certifications.length > 0 && (
      <div key="certifications" id="about-certifications" className="scroll-mt-24">
        <SubHeading>Certifications</SubHeading>
        <div className="border-t border-line">
          {certifications.map((cert: any, i: number) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 border-b border-line py-4 last:border-b-0"
            >
              <div>
                <div className="font-serif text-base text-ink">{cert.title}</div>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
                  {cert.issuer} · {cert.date}
                </div>
              </div>
              {cert.link && (
                <a
                  href={cert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 border border-line p-2 text-ink-soft transition-colors hover:border-clay hover:text-clay"
                  title="View credential"
                >
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    ),
    achievements: achievements.length > 0 && (
      <div key="achievements" id="about-achievements" className="scroll-mt-24">
        <SubHeading>Achievements</SubHeading>
        <div className="border-t border-line">
          {achievements.map((ach: any, i: number) => (
            <div key={i} className="flex items-baseline gap-4 border-b border-line py-4 last:border-b-0">
              <span className="font-serif italic text-clay" aria-hidden>
                ✳
              </span>
              <div>
                <div className="font-serif text-base text-ink">{ach.title}</div>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
                  {ach.event}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  };

  customSections.forEach((section) => {
    blocks[section.id] = (section.items?.length ?? 0) > 0 && (
      <div key={section.id} className="scroll-mt-24">
        <SubHeading>{section.title}</SubHeading>
        <div className="border-t border-line">
          {section.items.map((item: any, i: number) => (
            <Entry key={i} left={item.date} title={item.title} subtitle={item.subtitle}>
              {item.description && (
                <div className="mt-3 font-serif text-[15px] leading-relaxed text-ink-soft">
                  <BulletText text={item.description} />
                </div>
              )}
            </Entry>
          ))}
        </div>
      </div>
    );
  });

  return (
    <section id="about" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 md:px-8 md:py-28">
      <SectionHeading
        index="03"
        label="Curriculum Vitae"
        title="About the Author"
      />

      {/* Portrait + bio */}
      <div className="mb-16 grid grid-cols-1 gap-10 md:grid-cols-[280px_1fr] md:gap-14">
        <motion.figure
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative aspect-[4/5] w-full max-w-[280px] overflow-hidden border border-line-strong bg-paper-deep plate-shadow">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-serif text-6xl italic text-ink-soft/30">
                ✳
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-clay/5 mix-blend-multiply" />
          </div>
          <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
            Fig. 1 — The author
          </figcaption>
        </motion.figure>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col justify-center"
        >
          <h3 className="font-serif text-3xl tracking-tight text-ink">
            {profile?.name || "Your Name"}
          </h3>
          <div className="overline-label mt-2 !text-clay">{profile?.role || "Engineer"}</div>
          <p className="mt-6 max-w-xl font-serif text-lg leading-relaxed text-ink-soft">
            {profile?.bio ||
              "A passionate engineer building at the intersection of software, hardware, and machine intelligence."}
          </p>
          {profile?.resume_url && (
            <a
              href={profile.resume_url}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex w-fit items-center gap-2 border border-line-strong px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink transition-colors hover:border-clay hover:text-clay"
            >
              View Résumé <ArrowUpRight size={14} />
            </a>
          )}
        </motion.div>
      </div>

      <div className="flex flex-col gap-16">
        {fullOrder.map((id) => blocks[id] || null)}
      </div>
    </section>
  );
}
