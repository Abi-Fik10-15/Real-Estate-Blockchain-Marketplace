"use client";

import { AnimatedCounter } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

export type KpiAccent = "blue" | "purple" | "emerald" | "amber" | "cyan";

export function KpiCard({
  label,
  value,
  trend,
  prefix = "",
  suffix = "",
}: {
  label: string;
  value: number;
  accent?: KpiAccent;
  trend?: { value: number; label: string; positive?: boolean };
  prefix?: string;
  suffix?: string;
}) {
  const isPositive = trend ? (trend.positive ?? trend.value >= 0) : true;

  return (
    <div className="rounded-xl border border-border/60 bg-card px-4 py-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <AnimatedCounter
        target={value}
        prefix={prefix}
        suffix={suffix}
        className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight text-primary"
      />
      {trend && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "rounded-md border px-1.5 py-0.5 text-[11px] font-medium",
              isPositive
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400",
            )}
          >
            {isPositive ? "▲" : "▼"} {Math.abs(trend.value)}%
          </span>
          <span className="text-[11px] text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
