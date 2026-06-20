"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Property, User } from "@/types";

const ROLE_COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b"];

function generateGrowthData(userCount: number, propertyCount: number) {
  const labels = ["Apr 26", "May 01", "May 06", "May 11", "May 16", "May 21", "May 26"];
  return labels.map((name, i) => {
    const factor = (i + 1) / labels.length;
    const wave = 0.9 + (i % 3) * 0.05;
    return {
      name,
      users: Math.round(userCount * factor * wave),
      properties: Math.round(propertyCount * factor * (wave - 0.05)),
      transactions: Math.round(propertyCount * 0.3 * factor * wave),
    };
  });
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-card px-3 py-2 text-sm shadow-sm">
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}</span>
          <span className="font-semibold text-foreground">
            {entry.value?.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export function PlatformAnalytics({
  users,
  properties,
}: {
  users: User[];
  properties: Property[];
}) {
  const growthData = React.useMemo(
    () => generateGrowthData(users.length, properties.length),
    [users.length, properties.length],
  );

  const roleData = React.useMemo(() => {
    const counts = {
      Buyers: users.filter((u) => u.role === "buyer").length,
      Owners: users.filter((u) => u.role === "owner").length,
      Agents: users.filter((u) => u.role === "agent").length,
      Admins: users.filter((u) => u.role === "admin").length,
    };
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      pct: users.length ? ((value / users.length) * 100).toFixed(1) : "0",
    }));
  }, [users]);

  const totalGrowth = users.length > 0 ? "+24.8%" : "+0%";

  return (
    <Card className="border-border/60">
      <CardHeader className="border-b border-border/60 pb-4">
        <CardTitle className="text-base text-primary">Platform Analytics</CardTitle>
        <CardDescription>
          Growth trends and user role distribution over the last 30 days.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-5">
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Area chart */}
          <div>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Total platform growth
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-primary">
                  {totalGrowth}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  vs previous 30 days
                </p>
              </div>
              <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                ▲ Growing
              </span>
            </div>

            <div className="flex flex-wrap gap-3 pb-3 text-xs text-muted-foreground">
              {[
                { label: "Users", color: "#3b82f6" },
                { label: "Properties", color: "#8b5cf6" },
                { label: "Transactions", color: "#06b6d4" },
              ].map((item) => (
                <span key={item.label} className="inline-flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.label}
                </span>
              ))}
            </div>

            <div className="h-[240px] w-full rounded-lg border border-border/60 bg-muted/10 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    strokeOpacity={0.5}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="users"
                    name="Users"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="#3b82f6"
                    fillOpacity={0.08}
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="properties"
                    name="Properties"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="#8b5cf6"
                    fillOpacity={0.08}
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="transactions"
                    name="Transactions"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fill="#06b6d4"
                    fillOpacity={0.08}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Users by role */}
          <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Users by role
            </p>

            <div className="relative mx-auto mt-3 h-[160px] w-full max-w-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  >
                    {roleData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={ROLE_COLORS[index % ROLE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold tabular-nums text-primary">
                  {users.length.toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground">Total</span>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {roleData.map((entry, i) => (
                <div
                  key={entry.name}
                  className="flex items-center gap-2 rounded-md border border-border/50 bg-card px-2.5 py-1.5 text-xs"
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: ROLE_COLORS[i] }}
                  />
                  <span className="text-muted-foreground">{entry.name}</span>
                  <span className="ml-auto font-semibold text-primary">
                    {entry.value}
                  </span>
                  <span className="text-muted-foreground">({entry.pct}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
