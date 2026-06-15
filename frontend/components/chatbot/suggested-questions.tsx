"use client";

import { motion } from "framer-motion";
import {
  Search,
  Link2,
  UserPlus,
  Home,
  FileText,
  ShieldCheck,
  Wallet,
  Sparkles,
} from "lucide-react";
import type { QuickAction } from "@/types/chatbot";

const QUICK_ACTIONS: QuickAction[] = [
  { id: "find", label: "Find Properties", icon: "Search", prompt: "How do I find properties on ChainEstate?" },
  { id: "blockchain", label: "How Blockchain Ownership Works", icon: "Link2", prompt: "How does blockchain ownership work?" },
  { id: "agent", label: "Become an Agent", icon: "UserPlus", prompt: "How do I become a real estate agent on ChainEstate?" },
  { id: "rent", label: "Rent a Property", icon: "Home", prompt: "How do I rent a property?" },
  { id: "list", label: "List My Property", icon: "FileText", prompt: "How do I list my property for sale?" },
  { id: "verify", label: "Verify Ownership", icon: "ShieldCheck", prompt: "How does property verification work?" },
  { id: "wallet", label: "Wallet Connection Help", icon: "Wallet", prompt: "How do I connect my wallet?" },
  { id: "features", label: "Platform Features", icon: "Sparkles", prompt: "What features does ChainEstate offer?" },
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Search,
  Link2,
  UserPlus,
  Home,
  FileText,
  ShieldCheck,
  Wallet,
  Sparkles,
};

interface SuggestedQuestionsProps {
  onSelect: (prompt: string) => void;
}

export function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="flex flex-wrap gap-2 px-4 py-3">
      {QUICK_ACTIONS.map((action, i) => {
        const Icon = ICON_MAP[action.icon];
        return (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.3, ease: [0.25, 0.4, 0, 1] }}
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(action.prompt)}
            className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:border-[hsl(var(--brand-1)/0.4)] hover:bg-[hsl(var(--brand-1)/0.08)] hover:text-foreground"
          >
            {Icon && <Icon className="h-3 w-3 text-[hsl(var(--brand-2))]" />}
            {action.label}
          </motion.button>
        );
      })}
    </div>
  );
}
