"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Trash2, ChevronDown, Bot } from "lucide-react";
import { ChatMessageBubble } from "./chat-message";
import { ChatInput } from "./chat-input";
import { SuggestedQuestions } from "./suggested-questions";
import { TypingIndicator } from "./typing-indicator";
import type { ChatMessage } from "@/types/chatbot";

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => void;
  onClearChat?: () => void;
}

const STARTER_CHIPS = [
  { label: "🏠 Properties", prompt: "Show me available properties" },
  { label: "⛓️ Blockchain", prompt: "How does blockchain ownership work?" },
  { label: "💸 Transfers", prompt: "How do I transfer property ownership?" },
  { label: "🔐 Verification", prompt: "How does property verification work?" },
  { label: "💼 Agents", prompt: "How do I become a real estate agent?" },
] as const;

export function ChatWindow({
  messages,
  isLoading,
  onClose,
  onSendMessage,
  onClearChat,
}: ChatWindowProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = React.useState(false);
  const showScrollBtnRef = React.useRef(false);
  const rafRef = React.useRef<number | null>(null);

  const scrollToBottom = React.useCallback((smooth = true) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }, []);

  React.useEffect(() => {
    // Avoid expensive smooth scrolling on every render update.
    const id = window.requestAnimationFrame(() => scrollToBottom(false));
    return () => window.cancelAnimationFrame(id);
  }, [messages.length, isLoading, scrollToBottom]);

  const handleScroll = React.useCallback(() => {
    if (!scrollRef.current) return;
    if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    rafRef.current = window.requestAnimationFrame(() => {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current!;
      const shouldShow = scrollHeight - scrollTop - clientHeight > 120;
      if (shouldShow !== showScrollBtnRef.current) {
        showScrollBtnRef.current = shouldShow;
        setShowScrollBtn(shouldShow);
      }
    });
  }, []);

  React.useEffect(() => {
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const hasConversation = React.useMemo(() => messages.length > 1, [messages.length]);

  return (
    <section
      aria-label="ChainEstate AI Chat"
      className="flex h-full w-full flex-col overflow-hidden bg-background"
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-primary/5">
            <Bot className="h-4 w-4 text-primary" />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold leading-tight text-foreground">
              ChainEstate AI
            </h3>
            <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              Online · Real Estate Assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {hasConversation && onClearChat && (
            <button
              type="button"
              onClick={onClearChat}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors duration-200 hover:bg-destructive/10 hover:text-destructive"
              aria-label="Clear chat"
              title="Clear conversation"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!hasConversation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex flex-wrap gap-2 border-b border-border/50 bg-muted/20 px-4 py-2"
        >
          {STARTER_CHIPS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => onSendMessage(chip.prompt)}
              className="rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[11px] font-medium text-foreground/75 transition-colors duration-200 hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
            >
              {chip.label}
            </button>
          ))}
        </motion.div>
      )}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        className="relative flex-1 overflow-y-auto scroll-smooth p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/30"
      >
        <div className="flex flex-col gap-3">
          {messages.map((message) => (
            <ChatMessageBubble key={message.id} message={message} />
          ))}

          {messages.length <= 1 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-2"
            >
              <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Suggested topics
              </p>
              <SuggestedQuestions onSelect={onSendMessage} />
            </motion.div>
          )}

          {isLoading && <TypingIndicator />}
        </div>

        <AnimatePresence>
          {showScrollBtn && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              onClick={() => scrollToBottom()}
              className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background/95 shadow-md transition-colors duration-200 hover:bg-muted"
              aria-label="Scroll to latest message"
            >
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <ChatInput onSend={onSendMessage} disabled={isLoading} />

      <div className="flex items-center justify-center gap-1.5 border-t border-border/50 bg-muted/20 px-4 py-1.5">
        <Sparkles className="h-2.5 w-2.5 text-muted-foreground/50" />
        <span className="text-[9px] font-medium text-muted-foreground/60">
          Powered by ChainEstate AI · Responses are illustrative
        </span>
      </div>
    </section>
  );
}
