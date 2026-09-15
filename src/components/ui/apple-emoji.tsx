"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AppleEmojiProps {
  emoji: string;
  className?: string;
  size?: number | string;
  alt?: string;
  style?: React.CSSProperties;
}

/**
 * Standardized Apple Emoji Component
 * Renders high-resolution Apple emoji across all operating systems & browsers.
 */
export function AppleEmoji({
  emoji,
  className = "",
  size,
  alt = emoji,
  style,
}: AppleEmojiProps) {
  // Convert unicode emoji characters to hex sequence (e.g. "👋" -> "1f44b")
  const codePoints = Array.from(emoji)
    .map((char) => char.codePointAt(0)?.toString(16).toLowerCase())
    .filter(Boolean)
    .join("-");

  const emojiUrl = `https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/${codePoints}.png`;

  return (
    <img
      src={emojiUrl}
      alt={alt}
      className={cn(
        "inline-block align-middle select-none pointer-events-none w-[1.15em] h-[1.15em]",
        className
      )}
      style={{
        verticalAlign: "-0.18em",
        ...(size
          ? {
              width: typeof size === "number" ? `${size}px` : size,
              height: typeof size === "number" ? `${size}px` : size,
            }
          : {}),
        ...style,
      }}
      loading="lazy"
      onError={(e) => {
        // Fallback gracefully to system font emoji if image fails to load
        e.currentTarget.style.display = "none";
        const fallback = document.createElement("span");
        fallback.innerText = emoji;
        fallback.className = "font-['Apple_Color_Emoji',sans-serif]";
        e.currentTarget.parentNode?.insertBefore(fallback, e.currentTarget);
      }}
    />
  );
}
