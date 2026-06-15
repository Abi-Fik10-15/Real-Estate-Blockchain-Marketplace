"use client";

import { motion } from "framer-motion";

export function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 px-4 py-2">
      {/* AI avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--brand-1))] to-[hsl(var(--brand-3))]">
        <span className="text-xs font-bold text-white">AI</span>
      </div>

      {/* Dots bubble */}
      <div className="glass-card flex items-center gap-1.5 rounded-2xl rounded-bl-sm px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block h-2 w-2 rounded-full bg-muted-foreground/60"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
