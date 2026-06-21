"use client";

import {
  Activity,
  AlertTriangle,
  Building2,
  Fingerprint,
  ShieldCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Property, User } from "@/types";

interface StatItem {
  label: string;
  value: string;
  icon: React.ElementType;
  iconClass: string;
  trend?: { value: number; positive: boolean };
  badge?: { text: string; className: string };
}

function OperationStat({
  label,
  value,
  icon: Icon,
  iconClass,
  trend,
  badge,
}: StatItem) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/10 px-3 py-3">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border",
            iconClass,
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-0.5 text-lg font-bold tabular-nums text-primary">
            {value}
          </p>
        </div>
      </div>
      {(trend || badge) && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {trend && (
            <span
              className={cn(
                "rounded-md border px-1.5 py-0.5 text-[11px] font-medium",
                trend.positive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400",
              )}
            >
              {trend.positive ? "▲" : "▼"} {Math.abs(trend.value)}%
            </span>
          )}
          {badge && (
            <span
              className={cn(
                "rounded-md border px-1.5 py-0.5 text-[11px] font-medium",
                badge.className,
              )}
            >
              {badge.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function ComplianceStrip({
  users,
  properties,
}: {
  users: User[];
  properties: Property[];
}) {
  const activeListings = properties.filter((p) => p.status === "active").length;
  const pendingVerifications = properties.filter(
    (p) => p.verification.status === "pending",
  ).length;
  const unverifiedUsers = users.filter((u) => !u.verified).length;

  const stats: StatItem[] = [
    {
      label: "Active Listings",
      value: activeListings.toLocaleString(),
      icon: Building2,
      iconClass:
        "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400",
      trend: { value: 14.2, positive: true },
    },
    {
      label: "Pending Verifications",
      value: pendingVerifications.toLocaleString(),
      icon: ShieldCheck,
      iconClass:
        "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
      trend: { value: 8.7, positive: true },
    },
    {
      label: "Open Disputes",
      value: "0",
      icon: AlertTriangle,
      iconClass:
        "border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400",
      trend: { value: 12.3, positive: true },
    },
    {
      label: "KYC Pending",
      value: unverifiedUsers.toLocaleString(),
      icon: Fingerprint,
      iconClass:
        "border-purple-200 bg-purple-50 text-purple-600 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-400",
      trend: { value: 9.1, positive: false },
    },
    {
      label: "System Health",
      value: "99.9%",
      icon: Activity,
      iconClass:
        "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400",
      badge: {
        text: "Excellent",
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400",
      },
    },
  ];

  return (
    <Card className="border-border/60">
      <CardHeader className="border-b border-border/60 pb-4">
        <CardTitle className="text-base text-primary">Platform Operations</CardTitle>
        <CardDescription className="mt-1">
          Live compliance, verification, and system health metrics.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((s) => (
            <OperationStat key={s.label} {...s} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
