"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSend = React.useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [disabled, onSend, value]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleInput = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="shrink-0 bg-background px-4 pb-3 pt-2">
      <form
        className="relative"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <div
          className={cn(
            "flex items-end gap-1 rounded-2xl border border-border/60 bg-muted/20 px-3 py-2 shadow-sm transition-[border-color,box-shadow]",
            "focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10",
            disabled && "opacity-60"
          )}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            disabled={disabled}
            rows={1}
            aria-label="Message"
            className="max-h-[120px] min-h-[24px] flex-1 resize-none bg-transparent py-1.5 text-sm leading-normal text-foreground placeholder:text-muted-foreground/70 focus:outline-none disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!canSend}
            className={cn(
              "mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-200",
              canSend
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground/50"
            )}
            aria-label="Send message"
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      </form>
    </div>
  );
}
