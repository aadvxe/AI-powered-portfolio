"use client";

import { useState } from "react";
import { Copy, Check, ArrowUpRight } from "lucide-react";
import { ProfileData } from "@/hooks/use-content";
import { GithubIcon, LinkedInIcon } from "@/components/ui/social-icons";
import { SectionHeading } from "./section-heading";

interface ContactSectionProps {
  profile: ProfileData | null;
}

export function ContactSection({ profile }: ContactSectionProps) {
  const [copied, setCopied] = useState(false);
  const email = profile?.email || "ranggahardiyantowibowo@gmail.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socials = [
    { name: "GitHub", icon: GithubIcon, url: profile?.social_links?.github },
    { name: "LinkedIn", icon: LinkedInIcon, url: profile?.social_links?.linkedin },
  ].filter((s) => s.url);

  return (
    <section id="contact" className="scroll-mt-20 bg-paper-deep">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <SectionHeading
          index="04"
          label="Correspondence"
          title="Let’s build something."
          subtitle="Currently open to new opportunities and interesting projects."
        />

        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="overline-label mb-3">Write to</div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${email}`}
                className="break-all font-serif text-2xl italic text-ink underline decoration-line-strong decoration-1 underline-offset-4 transition-colors hover:text-clay hover:decoration-clay md:text-3xl"
              >
                {email}
              </a>
              <button
                onClick={handleCopy}
                className="border border-line-strong p-2.5 text-ink-soft transition-colors hover:border-clay hover:text-clay"
                title="Copy email"
              >
                {copied ? <Check size={15} className="text-moss" /> : <Copy size={15} />}
              </button>
            </div>
          </div>

          {socials.length > 0 && (
            <div className="flex gap-3">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 border border-line-strong px-5 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ink transition-colors hover:border-clay hover:text-clay"
                >
                  <social.icon size={16} />
                  {social.name}
                  <ArrowUpRight size={13} className="text-ink-soft" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
