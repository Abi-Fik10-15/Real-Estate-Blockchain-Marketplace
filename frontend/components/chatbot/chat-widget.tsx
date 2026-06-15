"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChatToggle } from "./chat-toggle";
import { ChatWindow } from "./chat-window";
import { createChatbotService } from "@/services/chatbot";
import type { ChatMessage } from "@/types/chatbot";

const WELCOME_MESSAGE: ChatMessage = {
  id: "msg-welcome",
  role: "assistant",
  content:
    "👋 Welcome to **ChainEstate AI**.\n\nI'm your on-chain real estate assistant. I can help you:\n\n• **Discover** properties & investment opportunities\n• **Understand** blockchain ownership & NFT deeds\n• **Navigate** transfers, verification & agent workflows\n• **Estimate** gas fees & transaction costs\n\nHow can I help you today?",
  timestamp: new Date(),
};

const UNREAD_DELAY_MS = 3000; // show badge after 3s of being closed

export function ChatWidget() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const wasOpenRef = React.useRef(false);

  const service = React.useMemo(() => createChatbotService("mock"), []);

  // Track unread messages when window is closed
  React.useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      wasOpenRef.current = true;
    }
  }, [isOpen]);

  const handleToggle = () => setIsOpen((prev) => !prev);

  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const responseText = await service.sendMessage(content, messages);

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Increment unread badge if window is closed
      if (!isOpen) {
        setUnreadCount((c) => c + 1);
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          content:
            "I'm sorry, I encountered an error while trying to respond. Please try again or contact support.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setUnreadCount(0);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.28, ease: [0.25, 0.4, 0, 1] }}
          >
            <ChatWindow
              messages={messages}
              isLoading={isLoading}
              onClose={() => setIsOpen(false)}
              onSendMessage={handleSendMessage}
              onClearChat={handleClearChat}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ChatToggle isOpen={isOpen} onClick={handleToggle} unreadCount={unreadCount} />
    </div>
  );
}
