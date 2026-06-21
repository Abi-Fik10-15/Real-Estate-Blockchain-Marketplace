"use client";

import { Building2, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ADMIN_NAV } from "@/components/dashboard/nav-configs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserStore } from "@/store/user-store";
import { usePropertyStore } from "@/store/property-store";
import { formatCurrency } from "@/lib/utils";
import type { PropertyType } from "@/types";

function StatPill({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accent}`}>
        <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
      </div>
      <div>
        <p className="text-base font-bold text-primary">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function AdminReportsPage() {
  const users = useUserStore((s) => s.users);
  const properties = usePropertyStore((s) => s.properties);

  const verified = properties.filter(
    (p) => p.verification.status === "verified",
  ).length;
  const totalValue = properties.reduce((sum, p) => sum + p.price, 0);
  const verifyRate = properties.length
    ? Math.round((verified / properties.length) * 100)
    : 0;
  const activeUsers = users.filter((u) => u.status === "active").length;

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
      <div className="space-y-5">
        {/* Summary bar */}
        <div className="rounded-xl border border-border/60 bg-card px-4 py-3">
          <p className="text-sm font-medium text-foreground">
            <span className="text-primary">{properties.length}</span>{" "}
            {properties.length === 1 ? "listing" : "listings"} ·{" "}
            <span className="text-primary">{verifyRate}%</span> verification rate
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Aggregated analytics across users, listings, and on-chain verifications.
          </p>
        </div>

        {/* Stat pills */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatPill
            label="Total Value Listed"
            value={formatCurrency(totalValue)}
            icon={TrendingUp}
            accent="bg-blue-500/10 text-blue-500"
          />
          <StatPill
            label="Active Users"
            value={activeUsers}
            icon={Users}
            accent="bg-purple-500/10 text-purple-500"
          />
          <StatPill
            label="Listings"
            value={properties.length}
            icon={Building2}
            accent="bg-emerald-500/10 text-emerald-500"
          />
          <StatPill
            label="Verification Rate"
            value={`${verifyRate}%`}
            icon={ShieldCheck}
            accent="bg-amber-500/10 text-amber-500"
          />
        </div>

        {/* Charts */}
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-primary">
                Properties by Type
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(byType).map(([type, count]) => (
                <div key={type} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize">{type as PropertyType}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary/70"
                      style={{ width: `${(count / maxType) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-primary">
                Listings by City
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {Object.entries(byCity).map(([city, count]) => (
                <div
                  key={city}
                  className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm"
                >
                  <span className="truncate text-muted-foreground">{city}</span>
                  <span className="ml-2 font-bold text-foreground">{count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
