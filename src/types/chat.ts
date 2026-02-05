/**
 * Chat Types - Shared TypeScript interfaces for the chat system
 */

export type ComponentType = "projects" | "skills" | "contact" | "about";

export interface Message {
  role: "user" | "ai";
  content: string;
  type?: "text" | "component";
  componentType?: ComponentType;
  componentFilter?: string;
}

export interface ChatState {
  messages: Message[];
  streaming: boolean;
  input: string;
}
