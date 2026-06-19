"use client";

import { Building2, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ADMIN_NAV } from "@/components/dashboard/nav-configs";
import { StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { useUserStore } from "@/store/user-store";
import { usePropertyStore } from "@/store/property-store";

// New premium components
import { KpiCard } from "@/components/dashboard/admin/kpi-card";
import { PlatformAnalytics } from "@/components/dashboard/admin/platform-analytics";
import { ActivityFeed } from "@/components/dashboard/admin/activity-feed";
import { PropertiesByType, ListingsByCity } from "@/components/dashboard/admin/property-charts";
import { QuickActions } from "@/components/dashboard/admin/quick-actions";
import { TopAgents } from "@/components/dashboard/admin/top-agents";
import { ComplianceStrip } from "@/components/dashboard/admin/compliance-strip";
import { AiInsights } from "@/components/dashboard/admin/ai-insights";

export default function AdminDashboard() {
  const users = useUserStore((s) => s.users);
  const properties = usePropertyStore((s) => s.properties);

  const owners = users.filter((u) => u.role === "owner").length;
  const agents = users.filter((u) => u.role === "agent").length;
  const verified = properties.filter(
    (p) => p.verification.status === "verified"
  ).length;
  const totalValue = properties.reduce((sum, p) => sum + p.price, 0);

  return (
    <DashboardShell title="Admin Dashboard" roleLabel="Administrator" nav={ADMIN_NAV}>
      <StaggerContainer className="space-y-6">
        
        {/* Header Section */}
        <StaggerItem>
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Welcome back, Admin <span className="inline-block animate-wave">👋</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Here's what's happening with your platform today.
            </p>
          </div>
        </StaggerItem>

        {/* Top KPIs */}
        <StaggerItem>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <KpiCard
              label="Total Users"
              value={users.length}
              icon={Users}
              accent="blue"
              trend={{ value: 12.5, label: "vs last week", positive: true }}
            />
            <KpiCard
              label="Total Properties"
              value={properties.length}
              icon={Building2}
              accent="purple"
              trend={{ value: 18.7, label: "vs last week", positive: true }}
            />
            <KpiCard
              label="Total Value Locked"
              value={totalValue}
              icon={TrendingUp}
              accent="amber"
              trend={{ value: 23.4, label: "vs last week", positive: true }}
              prefix="$"
            />
            <KpiCard
              label="Verified Properties"
              value={verified}
              icon={ShieldCheck}
              accent="emerald"
              trend={{ value: 20.1, label: "vs last week", positive: true }}
            />
             <KpiCard
              label="Agents"
              value={agents}
              icon={Users}
              accent="cyan"
              trend={{ value: 5.2, label: "vs last week", positive: true }}
            />
          </div>
        </StaggerItem>

        {/* Main Analytics + Activity Feed */}
        <StaggerItem>
          <div className="grid gap-6 lg:grid-cols-3 xl:grid-cols-4">
            <div className="lg:col-span-2 xl:col-span-3">
              <PlatformAnalytics users={users} properties={properties} />
            </div>
            <div className="flex flex-col gap-6 lg:col-span-1 xl:col-span-1">
              <ActivityFeed users={users} properties={properties} />
              <TopAgents users={users} properties={properties} />
            </div>
          </div>
        </StaggerItem>

        {/* Secondary Charts + Quick Actions */}
        <StaggerItem>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-6 lg:col-span-1">
              <PropertiesByType properties={properties} />
            </div>
            <div className="flex flex-col gap-6 lg:col-span-1">
              <ListingsByCity properties={properties} />
            </div>
            <div className="flex flex-col gap-6 lg:col-span-1">
              <QuickActions />
              <AiInsights users={users} properties={properties} />
            </div>
          </div>
        </StaggerItem>

        {/* Compliance Strip */}
        <StaggerItem>
          <ComplianceStrip users={users} properties={properties} />
        </StaggerItem>

      </StaggerContainer>
    </DashboardShell>
  );
}
