"use client";

import * as React from "react";
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

type QuickActionWithIcon = QuickAction & {
  Icon: React.ComponentType<{ className?: string }>;
};

const QUICK_ACTIONS: QuickActionWithIcon[] = [
  {
    id: "find",
    label: "Find Properties",
    Icon: Search,
    icon: "Search",
    prompt: "How do I find properties on ChainEstate?",
  },
  {
    id: "blockchain",
    label: "How Blockchain Ownership Works",
    Icon: Link2,
    icon: "Link2",
    prompt: "How does blockchain ownership work?",
  },
  {
    id: "agent",
    label: "Become an Agent",
    Icon: UserPlus,
    icon: "UserPlus",
    prompt: "How do I become a real estate agent on ChainEstate?",
  },
  { id: "rent", label: "Rent a Property", Icon: Home, icon: "Home", prompt: "How do I rent a property?" },
  {
    id: "list",
    label: "List My Property",
    Icon: FileText,
    icon: "FileText",
    prompt: "How do I list my property for sale?",
  },
  {
    id: "verify",
    label: "Verify Ownership",
    Icon: ShieldCheck,
    icon: "ShieldCheck",
    prompt: "How does property verification work?",
  },
  {
    id: "wallet",
    label: "Wallet Connection Help",
    Icon: Wallet,
    icon: "Wallet",
    prompt: "How do I connect my wallet?",
  },
  {
    id: "features",
    label: "Platform Features",
    Icon: Sparkles,
    icon: "Sparkles",
    prompt: "What features does ChainEstate offer?",
  },
];

interface SuggestedQuestionsProps {
  onSelect: (prompt: string) => void;
}

export const SuggestedQuestions = React.memo(function SuggestedQuestions({
  onSelect,
}: SuggestedQuestionsProps) {
  return (
    <div className="flex flex-wrap gap-2 px-4 py-3">
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.Icon;
        return (
          <button
            key={action.id}
            type="button"
            onClick={() => onSelect(action.prompt)}
            className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground/80 transition-all duration-200 hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
          >
            <Icon className="h-3 w-3 text-primary" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
});
