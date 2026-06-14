"use client";

import Link from "next/link";
import { BarChart3, Building2, ShieldCheck, Users } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { ADMIN_NAV } from "@/components/dashboard/nav-configs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/user-store";
import { usePropertyStore } from "@/store/property-store";

export default function AdminDashboard() {
  const users = useUserStore((s) => s.users);
  const properties = usePropertyStore((s) => s.properties);

  const owners = users.filter((u) => u.role === "owner").length;
  const agents = users.filter((u) => u.role === "agent").length;
  const buyers = users.filter((u) => u.role === "buyer").length;
  const verified = properties.filter((p) => p.verification.status === "verified").length;

  return (
    <DashboardShell title="Admin Dashboard" roleLabel="Administrator" nav={ADMIN_NAV}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Users" value={users.length} icon={Users} />
        <StatCard label="Property Owners" value={owners} icon={Building2} accent="accent" />
        <StatCard label="Property Agents" value={agents} icon={Users} accent="success" />
        <StatCard label="Buyers" value={buyers} icon={Users} />
        <StatCard
          label="Total Properties"
          value={properties.length}
          icon={Building2}
          accent="accent"
        />
        <StatCard
          label="Verified Properties"
          value={verified}
          icon={ShieldCheck}
          accent="success"
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <QuickLink href="/dashboard/admin/users" icon={Users} label="Manage Users" />
        <QuickLink href="/dashboard/admin/properties" icon={Building2} label="All Properties" />
        <QuickLink href="/dashboard/admin/reports" icon={BarChart3} label="Platform Reports" />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Platform Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
          <Row label="Suspended accounts" value={users.filter((u) => u.status === "suspended").length} />
          <Row label="Unverified users" value={users.filter((u) => !u.verified).length} />
          <Row label="Pending verifications" value={properties.length - verified} />
          <Row label="Active listings" value={properties.filter((p) => p.status === "active").length} />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Users;
  label: string;
}) {
  return (
    <Button variant="outline" className="h-auto justify-start gap-3 p-4" asChild>
      <Link href={href}>
        <Icon className="h-5 w-5 text-primary" />
        <span className="font-medium">{label}</span>
      </Link>
    </Button>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-lg font-bold">{value}</span>
    </div>
  );
}
