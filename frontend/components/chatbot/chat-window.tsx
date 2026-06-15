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

export function ChatWindow({
  messages,
  isLoading,
  onClose,
  onSendMessage,
  onClearChat,
}: ChatWindowProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = React.useState(false);

  const scrollToBottom = (smooth = true) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 120);
  };

  const hasConversation = messages.length > 1;

  return (
    <div className="glass-card flex h-[calc(100dvh-6rem)] max-h-[640px] w-full flex-col overflow-hidden shadow-2xl sm:w-[430px]">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-[hsl(var(--brand-1)/0.12)] to-[hsl(var(--brand-3)/0.08)] px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Avatar with pulse ring */}
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--brand-1))] to-[hsl(var(--brand-3))] shadow-sm">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="absolute bottom-0 right-0 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500" />
            </span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground leading-tight">ChainEstate AI</h3>
            <p className="text-[10px] text-emerald-500 font-medium">Online · Real Estate Assistant</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {hasConversation && onClearChat && (
            <button
              onClick={onClearChat}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-destructive"
              aria-label="Clear chat"
              title="Clear conversation"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Category Chips ──────────────────────────────────── */}
      {!hasConversation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex items-center gap-2 overflow-x-auto border-b border-border/30 bg-muted/20 px-4 py-2 scrollbar-none"
        >
          {[
            { label: "🏠 Properties", prompt: "Show me available properties" },
            { label: "⛓️ Blockchain", prompt: "How does blockchain ownership work?" },
            { label: "💸 Transfers", prompt: "How do I transfer property ownership?" },
            { label: "🔐 Verification", prompt: "How does property verification work?" },
            { label: "💼 Agents", prompt: "How do I become a real estate agent?" },
          ].map((chip) => (
            <button
              key={chip.label}
              onClick={() => onSendMessage(chip.prompt)}
              className="shrink-0 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-[11px] font-medium text-foreground/70 transition-colors hover:border-[hsl(var(--brand-1)/0.5)] hover:bg-[hsl(var(--brand-1)/0.08)] hover:text-foreground"
            >
              {chip.label}
            </button>
          ))}
        </motion.div>
      )}

      {/* ── Messages ────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="relative flex-1 overflow-y-auto scroll-smooth p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/30"
      >
        <div className="flex flex-col gap-3">
          {messages.map((message) => (
            <ChatMessageBubble key={message.id} message={message} />
          ))}

          {/* Suggested questions after welcome message */}
          {messages.length <= 1 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
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

        {/* Scroll-to-bottom button */}
        <AnimatePresence>
          {showScrollBtn && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => scrollToBottom()}
              className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background/90 shadow-md backdrop-blur-sm transition-colors hover:bg-muted"
            >
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Input ────────────────────────────────────────────── */}
      <ChatInput onSend={onSendMessage} disabled={isLoading} />

      {/* ── Powered-by footer ────────────────────────────────── */}
      <div className="flex items-center justify-center gap-1.5 border-t border-border/30 bg-muted/20 px-4 py-1.5">
        <Sparkles className="h-2.5 w-2.5 text-muted-foreground/50" />
        <span className="text-[9px] text-muted-foreground/50 font-medium">
          Powered by ChainEstate AI · Responses are illustrative
        </span>
      </div>
    </div>
  );
}
