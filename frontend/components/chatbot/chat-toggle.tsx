"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";

interface ChatToggleProps {
  isOpen: boolean;
  onClick?: () => void;
  unreadCount?: number;
}

export function ChatToggle({ isOpen, onClick, unreadCount = 0 }: ChatToggleProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95 ${
        isOpen
          ? "bg-muted-foreground/80"
          : "bg-primary"
      }`}
      aria-label={isOpen ? "Close chat" : "Open AI Assistant"}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
    >
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="close"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <X className="h-6 w-6" />
          </motion.div>
        ) : (
          <motion.div
            key="open"
            initial={{ opacity: 0, rotate: 90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: -90 }}
            transition={{ duration: 0.2 }}
          >
            <Sparkles className="h-6 w-6" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unread badge */}
      <AnimatePresence>
        {!isOpen && unreadCount > 0 && (
          <motion.span
            key="badge"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 360, damping: 20 }}
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-destructive text-[10px] font-bold text-white"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Idle pulse ring (shown when no unread count) */}
      {!isOpen && unreadCount === 0 && (
        <span className="absolute right-0 top-0 flex h-3 w-3">
          <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-[hsl(var(--brand-2))] bg-white" />
        </span>
      )}
    </motion.button>
  );
}
