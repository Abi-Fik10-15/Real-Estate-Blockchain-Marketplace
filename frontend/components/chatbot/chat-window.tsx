"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { X, Sparkles } from "lucide-react";
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
}

export function ChatWindow({ messages, isLoading, onClose, onSendMessage }: ChatWindowProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change or loading state changes
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.25, 0.4, 0, 1] }}
      className="glass-card flex h-[calc(100dvh-6rem)] max-h-[600px] w-full flex-col overflow-hidden shadow-2xl sm:w-[420px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-[hsl(var(--brand-1)/0.1)] to-[hsl(var(--brand-3)/0.1)] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--brand-1))] to-[hsl(var(--brand-3))] shadow-sm">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-background bg-success"></span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">ChainEstate AI</h3>
            <p className="text-xs text-muted-foreground">Real Estate Assistant</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground dark:hover:bg-white/5"
          aria-label="Close chat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scroll-smooth p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/30"
      >
        <div className="flex flex-col gap-4">
          {messages.map((message) => (
            <ChatMessageBubble key={message.id} message={message} />
          ))}

          {/* Show suggestions if conversation is short */}
          {messages.length <= 2 && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4"
            >
              <p className="mb-2 px-4 text-xs font-medium text-muted-foreground">Suggested topics</p>
              <SuggestedQuestions onSelect={onSendMessage} />
            </motion.div>
          )}

          {isLoading && <TypingIndicator />}
        </div>
      </div>

      {/* Input Area */}
      <ChatInput onSend={onSendMessage} disabled={isLoading} />
    </motion.div>
  );
}
