interface SectionHeadingProps {
  index: string; // "01"
  label: string; // "SELECTED WORKS"
  title: string; // "Projects"
  subtitle?: string;
}

export function SectionHeading({ index, label, title, subtitle }: SectionHeadingProps) {
  return (
    <header className="mb-10 md:mb-14">
      <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
        <span className="overline-label">
          № {index} — {label}
        </span>
        <span className="hidden select-none font-serif text-sm italic text-ink-soft sm:block" aria-hidden>
          ✳
        </span>
      </div>
      <h2 className="mt-6 font-serif text-4xl tracking-tight text-ink md:text-5xl">{title}</h2>
      {subtitle && (
        <p className="mt-3 max-w-xl font-serif text-base italic leading-relaxed text-ink-soft">
          {subtitle}
        </p>
      )}
    </header>
  );
}
