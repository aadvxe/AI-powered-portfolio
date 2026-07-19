/**
 * Chat Types - Shared TypeScript interfaces for the chat system
 */

/** Anchor targets on the single-page portfolio */
export type SectionId =
  | "works"
  | "skills"
  | "about"
  | "about-experience"
  | "about-education"
  | "about-certifications"
  | "about-achievements"
  | "contact";

/** A navigation chip attached to an AI message ("→ View Projects") */
export interface ChatAction {
  label: string;
  target: SectionId;
  /** Optional keyword filter applied to the Works grid */
  filter?: string;
}

export interface Message {
  role: "user" | "ai";
  content: string;
  action?: ChatAction;
}

export interface ChatState {
  messages: Message[];
  streaming: boolean;
  input: string;
}
