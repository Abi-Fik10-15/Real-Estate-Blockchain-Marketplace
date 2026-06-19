"use client";

export function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 px-2 py-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/5">
        <span className="text-xs font-bold text-primary">AI</span>
      </div>

      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-border/70 bg-background px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block h-2 w-2 rounded-full bg-muted-foreground/60"
            style={{
              animation: "chat-dot-bounce 1s infinite ease-in-out",
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
