/* ------------------------------------------------------------------ */
/*  Chatbot types — isolated from existing domain types               */
/* ------------------------------------------------------------------ */

export type ChatbotProvider = "mock" | "openai" | "gemini" | "claude";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string; // lucide icon name
  prompt: string;
}

export interface ChatbotConfig {
  provider: ChatbotProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  apiKey?: string;
}
