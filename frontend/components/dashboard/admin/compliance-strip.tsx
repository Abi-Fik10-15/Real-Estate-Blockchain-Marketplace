"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Building2,
  ShieldCheck,
  AlertTriangle,
  Fingerprint,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { User, Property } from "@/types";

/* ------------------------------------------------------------------ */
/*  Mini stat card                                                     */
/* ------------------------------------------------------------------ */
function MiniStat({
  label,
  value,
  icon: Icon,
  trend,
  accent,
  badge,
  delay = 0,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { value: number; positive: boolean };
  accent: string;
  badge?: { text: string; color: string };
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-xl border border-border/60 bg-card p-4 transition-shadow hover:shadow-soft"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className={cn("h-4 w-4", accent)} />
        <span>{label}</span>
        {trend && (
          <span
            className={cn(
              "ml-auto text-xs font-semibold",
              trend.positive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-500"
            )}
          >
            {trend.positive ? "▲" : "▼"} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight">{value}</span>
        {badge && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold",
              badge.color
            )}
          >
            {badge.text}
          </span>
        )}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Compliance Strip Component                                         */
/* ------------------------------------------------------------------ */
export function ComplianceStrip({
  users,
  properties,
}: {
  users: User[];
  properties: Property[];
}) {
  const activeListings = properties.filter((p) => p.status === "active").length;
  const pendingVerifications = properties.filter(
    (p) => p.verification.status === "pending"
  ).length;
  const unverifiedUsers = users.filter((u) => !u.verified).length;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <MiniStat
        label="Active Listings"
        value={activeListings.toLocaleString()}
        icon={Building2}
        trend={{ value: 14.2, positive: true }}
        accent="text-blue-500"
        delay={0}
      />
      <MiniStat
        label="Pending Verifications"
        value={pendingVerifications.toLocaleString()}
        icon={ShieldCheck}
        trend={{ value: 8.7, positive: true }}
        accent="text-amber-500"
        delay={0.05}
      />
      <MiniStat
        label="Disputes Open"
        value="0"
        icon={AlertTriangle}
        trend={{ value: 12.3, positive: true }}
        accent="text-red-500"
        delay={0.1}
      />
      <MiniStat
        label="KYC Pendings"
        value={unverifiedUsers.toLocaleString()}
        icon={Fingerprint}
        trend={{ value: 9.1, positive: false }}
        accent="text-purple-500"
        delay={0.15}
      />
      <MiniStat
        label="System Health"
        value="99.9%"
        icon={Activity}
        accent="text-emerald-500"
        badge={{
          text: "Excellent",
          color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        }}
        delay={0.2}
      />
    </div>
  );
}
