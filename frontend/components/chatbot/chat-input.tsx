"use client";

import * as React from "react";
import { SendHorizontal } from "lucide-react";
import { motion } from "framer-motion";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  return (
    <div className="flex items-end gap-2 border-t border-border/50 bg-background/80 px-4 py-3 backdrop-blur-sm">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Ask me anything..."
        disabled={disabled}
        rows={1}
        className="max-h-[120px] min-h-[40px] flex-1 resize-none rounded-xl border border-border/60 bg-muted/40 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[hsl(var(--brand-1)/0.5)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-1)/0.15)] disabled:cursor-not-allowed disabled:opacity-50"
      />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSend}
        disabled={!value.trim() || disabled}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--brand-1))] to-[hsl(var(--brand-2))] text-white shadow-md transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Send message"
      >
        <SendHorizontal className="h-4 w-4" />
      </motion.button>
    </div>
  );
}
