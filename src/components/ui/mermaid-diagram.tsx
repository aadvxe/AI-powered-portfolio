"use client";

import React, { useEffect, useId, useState } from "react";
import { AlertCircle, Copy, Check } from "lucide-react";

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

export function MermaidDiagram({ chart, className = "" }: MermaidDiagramProps) {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const reactId = useId().replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    let isMounted = true;

    async function renderChart() {
      if (!chart || !chart.trim()) {
        if (isMounted) setSvg("");
        return;
      }

      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "neutral",
          securityLevel: "loose",
          fontFamily: "var(--font-sans), 'Poppins', sans-serif",
          themeVariables: {
            fontFamily: "var(--font-sans), 'Poppins', sans-serif",
            primaryColor: "#f3f4f6",
            primaryTextColor: "#171717",
            primaryBorderColor: "#d4d4d8",
            lineColor: "#71717a",
            secondaryColor: "#e4e4e7",
            tertiaryColor: "#fafafa",
          },
        });

        // Clean any leftover error elements injected by mermaid into document.body
        const existingErrors = document.querySelectorAll("[id^='dmermaid'], [id^='mermaid-']");
        existingErrors.forEach((el) => {
          if (el.tagName.toLowerCase() !== "svg" && !el.closest(".mermaid-container")) {
            el.remove();
          }
        });

        const uniqueId = `mermaid-${reactId}-${Math.random().toString(36).substring(2, 7)}`;
        const { svg: renderedSvg } = await mermaid.render(uniqueId, chart.trim());

        if (isMounted) {
          setSvg(renderedSvg);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.warn("[Mermaid] Render error:", err);
          setError(err instanceof Error ? err.message : "Syntax error in diagram definition");
          setSvg("");
        }
        // Cleanup error overlay created by mermaid
        const errorElement = document.getElementById("d" + reactId);
        if (errorElement) errorElement.remove();
      }
    }

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart, reactId]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(chart);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  if (error) {
    return (
      <div className={`my-4 p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-neutral-800 text-xs ${className}`}>
        <div className="flex items-center gap-1.5 font-semibold text-amber-700 mb-2">
          <AlertCircle size={15} />
          <span>Diagram Preview Notice</span>
        </div>
        <p className="text-neutral-600 mb-2 font-mono text-[11px] leading-relaxed">
          {error.replace(/Parse error on line \d+:/, "Parsing issue:")}
        </p>
        <pre className="p-2.5 bg-neutral-900 text-neutral-200 rounded-lg overflow-x-auto text-[11px] font-mono leading-tight">
          <code>{chart}</code>
        </pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className={`my-4 p-6 rounded-xl bg-neutral-50/70 border border-neutral-200/80 flex items-center justify-center text-xs text-neutral-400 animate-pulse ${className}`}>
        Rendering diagram...
      </div>
    );
  }

  return (
    <div className={`relative my-4 group rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-4 transition-all hover:bg-neutral-50/80 ${className}`}>
      {/* Copy Diagram Source Button */}
      <button
        type="button"
        onClick={handleCopyCode}
        title="Copy Mermaid source"
        className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-white/90 border border-neutral-200/70 text-neutral-500 hover:text-neutral-900 hover:bg-white transition-all shadow-xs opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
      >
        {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
      </button>

      {/* SVG Container with horizontal scroll for wide flowcharts */}
      <div
        className="mermaid-container overflow-x-auto flex justify-center py-2 [&_svg]:max-w-full [&_svg]:h-auto select-none"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
