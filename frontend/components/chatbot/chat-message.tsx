"use client";

import { motion } from "framer-motion";
import type { ChatMessage } from "@/types/chatbot";

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.25, 0.4, 0, 1] }}
      className={`flex items-end gap-3 px-4 py-1.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--brand-1))] to-[hsl(var(--brand-3))]">
          <span className="text-xs font-bold text-white">AI</span>
        </div>
      )}
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
          <span className="text-xs font-semibold text-muted-foreground">U</span>
        </div>
      )}

      {/* Bubble */}
      <div className="flex max-w-[80%] flex-col gap-1">
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "rounded-br-sm bg-gradient-to-br from-[hsl(var(--brand-1))] to-[hsl(var(--brand-2))] text-white"
              : "glass-card rounded-bl-sm"
          }`}
        >
          {/* Render markdown-like bold text */}
          {message.content.split("\n").map((line, i) => {
            const parts = line.split(/(\*\*[^*]+\*\*)/g);
            return (
              <span key={i}>
                {i > 0 && <br />}
                {parts.map((part, j) => {
                  if (part.startsWith("**") && part.endsWith("**")) {
                    return (
                      <strong key={j} className="font-semibold">
                        {part.slice(2, -2)}
                      </strong>
                    );
                  }
                  return <span key={j}>{part}</span>;
                })}
              </span>
            );
          })}
        </div>

        {/* Timestamp */}
        <span
          className={`text-[10px] text-muted-foreground/60 ${isUser ? "text-right" : "text-left"} px-1`}
        >
          {formatRelativeTime(message.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}
