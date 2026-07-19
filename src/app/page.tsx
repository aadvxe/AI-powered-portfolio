"use client";

import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useContent, ProjectData } from "@/hooks/use-content";
import { SectionId } from "@/types/chat";
import { Nav } from "@/components/site/nav";
import { Hero } from "@/components/site/hero";
import { WorksSection } from "@/components/site/works-section";
import { SkillsSection } from "@/components/site/skills-section";
import { AboutSection } from "@/components/site/about-section";
import { ContactSection } from "@/components/site/contact-section";
import { Footer } from "@/components/site/footer";
import { ChatDock } from "@/components/site/chat-dock";
import { ProjectModal } from "@/components/site/project-modal";
import { Colophon } from "@/components/site/colophon";
import { TornDivider } from "@/components/site/torn-divider";

export default function Home() {
  const { projects, skills, profile } = useContent();

  const [chatOpen, setChatOpen] = useState(false);
  const [queuedQuestion, setQueuedQuestion] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [colophonOpen, setColophonOpen] = useState(false);
  const [worksFilter, setWorksFilter] = useState<string | undefined>(undefined);

  const scrollTo = (target: SectionId) => {
    // Sub-anchors live inside #about; fall back to the parent section
    const el = document.getElementById(target) || document.getElementById(target.split("-")[0]);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleNavigate = (target: SectionId, filter?: string) => {
    if (target === "works") setWorksFilter(filter);
    // The centered panel covers the page — close it so the section is visible
    setChatOpen(false);
    // Let the close animation start before scrolling
    setTimeout(() => scrollTo(target), 80);
  };

  const askQuestion = (question: string) => {
    setColophonOpen(false);
    setQueuedQuestion(question);
    setChatOpen(true);
  };

  const name = profile?.name || "Rangga";

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="grain" aria-hidden />

      <Nav name={name} onNavigate={scrollTo} onOpenChat={() => setChatOpen(true)} />

      <main>
        <Hero
          profile={profile}
          onNavigate={scrollTo}
          onAsk={askQuestion}
          onOpenChat={() => setChatOpen(true)}
        />
        <WorksSection
          projects={projects}
          onSelect={setSelectedProject}
          chatFilter={worksFilter}
          onClearChatFilter={() => setWorksFilter(undefined)}
        />
        <TornDivider fill="var(--paper-deep)" variant={0} />
        <SkillsSection skills={skills} />
        <TornDivider fill="var(--paper-deep)" variant={1} flip />
        <AboutSection profile={profile} />
        <TornDivider fill="var(--paper-deep)" variant={1} />
        <ContactSection profile={profile} />
        <TornDivider fill="var(--paper-deep)" variant={0} flip />
        <Footer name={name} onOpenColophon={() => setColophonOpen(true)} />
      </main>

      <ChatDock
        open={chatOpen}
        onOpen={() => setChatOpen(true)}
        onClose={() => setChatOpen(false)}
        onNavigate={handleNavigate}
        queuedQuestion={queuedQuestion}
        onQuestionConsumed={() => setQueuedQuestion(null)}
      />

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {colophonOpen && (
          <Colophon onClose={() => setColophonOpen(false)} onAsk={askQuestion} />
        )}
      </AnimatePresence>
    </div>
  );
}
