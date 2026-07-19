"use client";

interface FooterProps {
  name: string;
  onOpenColophon: () => void;
}

export function Footer({ name, onOpenColophon }: FooterProps) {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-10 text-center md:px-8">
        <span className="font-serif text-xl text-ink-soft" aria-hidden>
          ❦
        </span>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
          Set in Source Serif &amp; Archivo · Answers by Retrieval-Augmented Generation
        </p>
        <div className="flex items-center gap-5 font-mono text-[10px] uppercase tracking-[0.18em]">
          <button
            onClick={onOpenColophon}
            className="text-clay underline decoration-1 underline-offset-4 transition-colors hover:text-ink"
          >
            Colophon — about this site
          </button>
          <span className="text-ink-soft">
            © {new Date().getFullYear()} {name}
          </span>
        </div>
      </div>
    </footer>
  );
}
