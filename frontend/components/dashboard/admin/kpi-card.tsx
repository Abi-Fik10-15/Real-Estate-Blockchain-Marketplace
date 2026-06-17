"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";
import { AnimatedCounter } from "@/components/ui/motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Sparkline data generator                                           */
/* ------------------------------------------------------------------ */
function generateSparkline(base: number, points = 7): { v: number }[] {
  const data: { v: number }[] = [];
  let current = base * 0.7;
  for (let i = 0; i < points; i++) {
    current += (base * 0.3 * Math.random()) / points;
    data.push({ v: Math.round(current) });
  }
  data.push({ v: base });
  return data;
}

/* ------------------------------------------------------------------ */
/*  Accent presets                                                     */
/* ------------------------------------------------------------------ */
const accentPresets = {
  blue: {
    iconBg: "from-blue-500/20 to-blue-600/10",
    iconText: "text-blue-500",
    sparkline: "#3b82f6",
    sparklineFill: "rgba(59,130,246,0.15)",
    glowColor: "hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]",
  },
  purple: {
    iconBg: "from-purple-500/20 to-purple-600/10",
    iconText: "text-purple-500",
    sparkline: "#8b5cf6",
    sparklineFill: "rgba(139,92,246,0.15)",
    glowColor: "hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)]",
  },
  emerald: {
    iconBg: "from-emerald-500/20 to-emerald-600/10",
    iconText: "text-emerald-500",
    sparkline: "#10b981",
    sparklineFill: "rgba(16,185,129,0.15)",
    glowColor: "hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]",
  },
  amber: {
    iconBg: "from-amber-500/20 to-amber-600/10",
    iconText: "text-amber-500",
    sparkline: "#f59e0b",
    sparklineFill: "rgba(245,158,11,0.15)",
    glowColor: "hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]",
  },
  cyan: {
    iconBg: "from-cyan-500/20 to-cyan-600/10",
    iconText: "text-cyan-500",
    sparkline: "#06b6d4",
    sparklineFill: "rgba(6,182,212,0.15)",
    glowColor: "hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)]",
  },
} as const;

export type KpiAccent = keyof typeof accentPresets;

/* ------------------------------------------------------------------ */
/*  KpiCard component                                                  */
/* ------------------------------------------------------------------ */
export function KpiCard({
  label,
  value,
  icon: Icon,
  accent = "blue",
  trend,
  prefix = "",
  suffix = "",
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  accent?: KpiAccent;
  trend?: { value: number; label: string };
  prefix?: string;
  suffix?: string;
}) {
  const preset = accentPresets[accent];
  const sparkData = React.useMemo(() => generateSparkline(value), [value]);
  const isPositive = trend ? trend.value >= 0 : true;

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/60 bg-card p-5 transition-shadow duration-300",
        preset.glowColor
      )}
    >
      {/* Subtle gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/[0.03] dark:to-primary/[0.06]" />

      <div className="relative flex items-start justify-between gap-3">
        {/* Left: Icon + Label + Value + Trend */}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br",
                preset.iconBg
              )}
            >
              <Icon className={cn("h-5 w-5", preset.iconText)} />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {label}
            </span>
          </div>

          <div className="pl-0.5">
            <AnimatedCounter
              target={value}
              prefix={prefix}
              suffix={suffix}
              className="text-2xl font-bold tracking-tight text-foreground"
            />
          </div>

          {trend && (
            <div className="flex items-center gap-1.5 pl-0.5">
              <span
                className={cn(
                  "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold",
                  isPositive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                )}
              >
                {isPositive ? "▲" : "▼"} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-muted-foreground">
                {trend.label}
              </span>
            </div>
          )}
        </div>

        {/* Right: Sparkline */}
        <div className="hidden h-12 w-20 shrink-0 sm:block">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient
                  id={`spark-${accent}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={preset.sparkline} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={preset.sparkline} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={preset.sparkline}
                strokeWidth={1.5}
                fill={`url(#spark-${accent})`}
                dot={false}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
