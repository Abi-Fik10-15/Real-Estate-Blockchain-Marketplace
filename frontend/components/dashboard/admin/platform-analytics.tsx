"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { User, Property } from "@/types";

/* ------------------------------------------------------------------ */
/*  Growth data generator (simulates last 30 days)                     */
/* ------------------------------------------------------------------ */
function generateGrowthData(userCount: number, propertyCount: number) {
  const labels = ["Apr 26", "May 01", "May 06", "May 11", "May 16", "May 21", "May 26"];
  return labels.map((name, i) => {
    const factor = (i + 1) / labels.length;
    return {
      name,
      users: Math.round(userCount * factor * (0.85 + Math.random() * 0.15)),
      properties: Math.round(propertyCount * factor * (0.8 + Math.random() * 0.2)),
      transfers: Math.round(propertyCount * 0.15 * factor * (0.7 + Math.random() * 0.3)),
      transactions: Math.round(propertyCount * 0.3 * factor * (0.75 + Math.random() * 0.25)),
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Role distribution colors                                           */
/* ------------------------------------------------------------------ */
const ROLE_COLORS = [
  { role: "Buyers", color: "#3b82f6" },
  { role: "Owners", color: "#8b5cf6" },
  { role: "Agents", color: "#06b6d4" },
  { role: "Admins", color: "#f59e0b" },
];

/* ------------------------------------------------------------------ */
/*  Custom Tooltip                                                     */
/* ------------------------------------------------------------------ */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-card/95 px-3 py-2 shadow-lg backdrop-blur-sm">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold">{entry.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Platform Analytics Component                                       */
/* ------------------------------------------------------------------ */
export function PlatformAnalytics({
  users,
  properties,
}: {
  users: User[];
  properties: Property[];
}) {
  const [activeTab, setActiveTab] = React.useState("Overview");
  const tabs = ["Overview", "Users", "Properties", "Transactions"];

  /* Growth data */
  const growthData = React.useMemo(
    () => generateGrowthData(users.length, properties.length),
    [users.length, properties.length]
  );

  /* Role distribution */
  const roleData = React.useMemo(() => {
    const buyers = users.filter((u) => u.role === "buyer").length;
    const owners = users.filter((u) => u.role === "owner").length;
    const agents = users.filter((u) => u.role === "agent").length;
    const admins = users.filter((u) => u.role === "admin").length;
    return [
      { name: "Buyers", value: buyers, pct: users.length ? ((buyers / users.length) * 100).toFixed(1) : "0" },
      { name: "Owners", value: owners, pct: users.length ? ((owners / users.length) * 100).toFixed(1) : "0" },
      { name: "Agents", value: agents, pct: users.length ? ((agents / users.length) * 100).toFixed(1) : "0" },
      { name: "Admins", value: admins, pct: users.length ? ((admins / users.length) * 100).toFixed(1) : "0" },
    ];
  }, [users]);

  const totalGrowth = users.length > 0 ? "+24.8%" : "+0%";

  return (
    <Card className="overflow-hidden border-border/60">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base font-semibold">
            Platform Analytics
          </CardTitle>
          <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-0.5">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                  activeTab === tab
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Area Chart */}
          <div>
            <div className="mb-4 space-y-0.5">
              <p className="text-sm text-muted-foreground">
                Total Platform Growth
              </p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {totalGrowth}
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  ▲ Growing
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                vs previous 30 days
              </p>
            </div>

            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="growthUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="growthProps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="growthTx" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    strokeOpacity={0.4}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="users"
                    name="Users"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#growthUsers)"
                    animationDuration={1200}
                  />
                  <Area
                    type="monotone"
                    dataKey="properties"
                    name="Properties"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="url(#growthProps)"
                    animationDuration={1400}
                  />
                  <Area
                    type="monotone"
                    dataKey="transactions"
                    name="Transactions"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fill="url(#growthTx)"
                    animationDuration={1600}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut Chart — Users by Role */}
          <div>
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              Users by Role
            </p>
            <div className="relative h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={1200}
                  >
                    {roleData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={ROLE_COLORS[index].color}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{users.length.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">Total Users</span>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {roleData.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-2 text-sm">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: ROLE_COLORS[i].color }}
                  />
                  <span className="text-muted-foreground">{entry.name}</span>
                  <span className="ml-auto font-medium">
                    {entry.value.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({entry.pct}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
