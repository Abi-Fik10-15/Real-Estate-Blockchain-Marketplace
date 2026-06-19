"use client";

import { Building2, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ADMIN_NAV } from "@/components/dashboard/nav-configs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserStore } from "@/store/user-store";
import { usePropertyStore } from "@/store/property-store";
import { formatCurrency } from "@/lib/utils";
import type { PropertyType } from "@/types";

export default function AdminReportsPage() {
  const users = useUserStore((s) => s.users);
  const properties = usePropertyStore((s) => s.properties);

  const verified = properties.filter((p) => p.verification.status === "verified").length;
  const totalValue = properties.reduce((sum, p) => sum + p.price, 0);
  const verifyRate = properties.length
    ? Math.round((verified / properties.length) * 100)
    : 0;

  const byType = properties.reduce<Record<string, number>>((acc, p) => {
    acc[p.type] = (acc[p.type] ?? 0) + 1;
    return acc;
  }, {});
  const maxType = Math.max(1, ...Object.values(byType));

  const byCity = properties.reduce<Record<string, number>>((acc, p) => {
    acc[p.location.city] = (acc[p.location.city] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <DashboardShell title="Platform Reports" roleLabel="Administrator" nav={ADMIN_NAV}>
      <PageHeader
        title="Platform Reports"
        description="Aggregated analytics across users, listings, and on-chain verifications."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Value Listed" value={formatCurrency(totalValue)} icon={TrendingUp} />
        <StatCard label="Active Users" value={users.filter((u) => u.status === "active").length} icon={Users} accent="accent" />
        <StatCard label="Listings" value={properties.length} icon={Building2} accent="success" />
        <StatCard label="Verification Rate" value={`${verifyRate}%`} icon={ShieldCheck} accent="warning" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Properties by Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(byType).map(([type, count]) => (
              <div key={type} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{type as PropertyType}</span>
                  <span className="font-medium">{count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-brand"
                    style={{ width: `${(count / maxType) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Listings by City</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {Object.entries(byCity).map(([city, count]) => (
              <div
                key={city}
                className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm"
              >
                <span className="truncate">{city}</span>
                <span className="font-bold">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
