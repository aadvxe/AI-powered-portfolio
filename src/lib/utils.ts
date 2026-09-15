import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function stripMarkdown(text: string): string {
  if (!text) return "";
  return text
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, "")
    // Remove inline code
    .replace(/`([^`]+)`/g, "$1")
    // Remove images: ![alt](url) -> alt
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    // Convert links to link text: [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove HTML tags
    .replace(/<[^>]*>/g, "")
    // Remove headers (# Header)
    .replace(/^#{1,6}\s+/gm, "")
    // Remove blockquotes (> quote)
    .replace(/^>\s+/gm, "")
    // Remove bullet points (*, -, +, •, ·) and numbered lists (1. )
    .replace(/^[•·\-\*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    // Remove bold and italic (***text***, **text**, *text*, ___text___, __text__, _text_)
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
    // Remove strikethrough (~~text~~)
    .replace(/~~([^~]+)~~/g, "$1")
    // Remove horizontal rules
    .replace(/^(-{3,}|\*{3,}|_{3,})$/gm, "")
    // Collapse newlines and whitespace into single spaces
    .replace(/\s+/g, " ")
    .trim();
}
