"use client";

import * as React from "react";
import { ChatToggle } from "./chat-toggle";
import { ChatWindow } from "./chat-window";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { createChatbotService } from "@/services/chatbot";
import type { ChatMessage } from "@/types/chatbot";

const WELCOME_MESSAGE: ChatMessage = {
  id: "msg-welcome",
  role: "assistant",
  content:
    "👋 Welcome to **ChainEstate AI**.\n\nI'm your on-chain real estate assistant. I can help you:\n\n• **Discover** properties & investment opportunities\n• **Understand** blockchain ownership & NFT deeds\n• **Navigate** transfers, verification & agent workflows\n• **Estimate** gas fees & transaction costs\n\nHow can I help you today?",
  timestamp: new Date(),
};

function generateMessageId(prefix: "msg-user" | "msg-assistant"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const messagesRef = React.useRef<ChatMessage[]>([WELCOME_MESSAGE]);
  const isOpenRef = React.useRef(false);
  const mountedRef = React.useRef(true);

  const service = React.useMemo(() => createChatbotService("mock"), []);

  React.useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  React.useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  React.useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Track unread messages when window is closed
  React.useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const handleSendMessage = React.useCallback(async (content: string) => {
    if (isLoading) return;

    const userMessage: ChatMessage = {
      id: generateMessageId("msg-user"),
      role: "user",
      content,
      timestamp: new Date(),
    };

    const nextHistory = [...messagesRef.current, userMessage];
    setMessages(nextHistory);
    setIsLoading(true);

    try {
      const responseText = await service.sendMessage(content, nextHistory);

      const assistantMessage: ChatMessage = {
        id: generateMessageId("msg-assistant"),
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Increment unread badge if window is closed
      if (!isOpenRef.current) {
        setUnreadCount((c) => c + 1);
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      if (!mountedRef.current) return;
      setMessages((prev) => {
        const fallback: ChatMessage = {
          id: generateMessageId("msg-assistant"),
          role: "assistant",
          content:
            "I'm sorry, I encountered an error while trying to respond. Please try again or contact support.",
          timestamp: new Date(),
        };
        return [...prev, fallback];
      });
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [isLoading, service]);

  const handleClearChat = React.useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    setUnreadCount(0);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 max-sm:bottom-4 max-sm:right-4">
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <div>
            <ChatToggle isOpen={isOpen} unreadCount={unreadCount} />
          </div>
        </DrawerTrigger>
        <DrawerContent className="p-0">
          <DrawerTitle className="sr-only">ChainEstate AI Chat</DrawerTitle>
          <DrawerDescription className="sr-only">
            Chat with the ChainEstate AI real estate assistant.
          </DrawerDescription>
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            onClose={() => setIsOpen(false)}
            onSendMessage={handleSendMessage}
            onClearChat={handleClearChat}
          />
        </DrawerContent>
      </Drawer>
    </div>
  );
}
