"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ADMIN_NAV } from "@/components/dashboard/nav-configs";
import { useUserStore } from "@/store/user-store";
import { usePropertyStore } from "@/store/property-store";
import { useAuthStore } from "@/store/auth-store";
import { formatCurrency } from "@/lib/utils";

import { KpiCard } from "@/components/dashboard/admin/kpi-card";
import { PlatformAnalytics } from "@/components/dashboard/admin/platform-analytics";
import { ActivityFeed } from "@/components/dashboard/admin/activity-feed";
import {
  PropertiesByType,
  ListingsByCity,
} from "@/components/dashboard/admin/property-charts";
import { TopAgents } from "@/components/dashboard/admin/top-agents";
import { ComplianceStrip } from "@/components/dashboard/admin/compliance-strip";
import { AiInsights } from "@/components/dashboard/admin/ai-insights";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  );
}

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const users = useUserStore((s) => s.users);
  const properties = usePropertyStore((s) => s.properties);

  const verified = properties.filter(
    (p) => p.verification.status === "verified",
  ).length;
  const totalValue = properties.reduce((sum, p) => sum + p.price, 0);
  const agents = users.filter((u) => u.role === "agent").length;
  const activeListings = properties.filter((p) => p.status === "active").length;

  const headlineStats = [
    { label: "Total Users", value: users.length.toLocaleString() },
    { label: "Active Listings", value: activeListings.toLocaleString() },
    { label: "Platform Value", value: formatCurrency(totalValue) },
  ];

  return (
    <DashboardShell title="Admin Dashboard" roleLabel="Administrator" nav={ADMIN_NAV}>
      <div className="space-y-5">
        {/* Summary bar */}
        <div className="rounded-xl border border-border/60 bg-card px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">
                Welcome back,{" "}
                <span className="text-primary">{user?.name ?? "Admin"}</span>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                <span className="text-primary">{users.length}</span> users ·{" "}
                <span className="text-primary">{properties.length}</span>{" "}
                listings ·{" "}
                <span className="text-primary">{formatCurrency(totalValue)}</span>{" "}
                total value —{" "}
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {headlineStats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg border border-border/50 bg-muted/10 px-3 py-2 text-right"
                >
                  <p className="text-sm font-bold tabular-nums text-primary">
                    {s.value}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KPI cards */}
        <div className="space-y-3">
          <SectionLabel>Platform Overview</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            <KpiCard
              label="Total Users"
              value={users.length}
              trend={{ value: 12.5, label: "vs last week", positive: true }}
            />
            <KpiCard
              label="Properties"
              value={properties.length}
              trend={{ value: 18.7, label: "vs last week", positive: true }}
            />
            <KpiCard
              label="Value Locked"
              value={totalValue}
              trend={{ value: 23.4, label: "vs last week", positive: true }}
              prefix="$"
            />
            <KpiCard
              label="Verified"
              value={verified}
              trend={{ value: 20.1, label: "vs last week", positive: true }}
            />
            <KpiCard
              label="Agents"
              value={agents}
              trend={{ value: 5.2, label: "vs last week", positive: true }}
            />
          </div>
        </div>

        {/* Analytics + Activity */}
        <div className="space-y-3">
          <SectionLabel>Analytics &amp; Activity</SectionLabel>
          <div className="grid gap-5 lg:grid-cols-3 xl:grid-cols-4">
            <div className="lg:col-span-2 xl:col-span-3">
              <PlatformAnalytics users={users} properties={properties} />
            </div>
            <ActivityFeed users={users} properties={properties} />
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-3">
          <SectionLabel>Breakdown</SectionLabel>
          <div className="grid gap-5 lg:grid-cols-3">
            <PropertiesByType properties={properties} />
            <ListingsByCity properties={properties} />
            <div className="flex flex-col gap-5">
              <TopAgents users={users} properties={properties} />
              <AiInsights users={users} properties={properties} />
            </div>
          </div>
        </div>

        {/* Operations */}
        <div className="space-y-3">
          <SectionLabel>Operations</SectionLabel>
          <ComplianceStrip users={users} properties={properties} />
        </div>
      </div>
    </DashboardShell>
  );
}
