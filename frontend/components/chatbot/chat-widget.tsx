"use client";

import * as React from "react";
import { AnimatePresence } from "framer-motion";
import { ChatToggle } from "./chat-toggle";
import { ChatWindow } from "./chat-window";
import { createChatbotService } from "@/services/chatbot";
import type { ChatMessage } from "@/types/chatbot";

const WELCOME_MESSAGE: ChatMessage = {
  id: "msg-welcome",
  role: "assistant",
  content: "👋 Welcome to ChainEstate.\n\nI'm your AI Real Estate Assistant.\n\nI can help you discover properties, explain blockchain ownership, guide you through property transactions, and answer questions about the platform.\n\nHow can I help you today?",
  timestamp: new Date(),
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Initialize service lazily
  const service = React.useMemo(() => createChatbotService("mock"), []);

  const handleToggle = () => setIsOpen((prev) => !prev);

  const handleSendMessage = async (content: string) => {
    // 1. Add user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // 2. Get AI response
      const responseText = await service.sendMessage(content, messages);

      // 3. Add assistant message
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          content: "I'm sorry, I encountered an error while trying to respond. Please try again or contact support.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            onClose={() => setIsOpen(false)}
            onSendMessage={handleSendMessage}
          />
        )}
      </AnimatePresence>

      <ChatToggle isOpen={isOpen} onClick={handleToggle} />
    </div>
  );
}
