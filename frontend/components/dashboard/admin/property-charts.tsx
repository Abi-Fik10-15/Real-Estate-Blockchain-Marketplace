"use client";

import * as React from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Property } from "@/types";

const TYPE_COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444"];

function MiniTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-lg border border-border/60 bg-card px-3 py-2 text-sm shadow-sm">
      <span className="text-muted-foreground">{d.name}</span>:{" "}
      <span className="font-semibold text-primary">{d.value?.toLocaleString()}</span>
    </div>
  );
}

export function PropertiesByType({ properties }: { properties: Property[] }) {
  const data = React.useMemo(() => {
    const byType: Record<string, number> = {};
    properties.forEach((p) => {
      byType[p.type] = (byType[p.type] ?? 0) + 1;
    });
    return Object.entries(byType)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [properties]);

  const total = properties.length;

  return (
    <Card className="border-border/60">
      <CardHeader className="border-b border-border/60 pb-4">
        <CardTitle className="text-base text-primary">Properties by Type</CardTitle>
        <CardDescription className="mt-1">
          Distribution of listings across property categories.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        {data.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 py-10 text-center text-sm text-muted-foreground">
            No properties to chart yet.
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative mx-auto h-[140px] w-[140px] shrink-0 rounded-lg border border-border/60 bg-muted/10 p-2 sm:mx-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={58}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  >
                    {data.map((_, i) => (
                      <Cell
                        key={i}
                        fill={TYPE_COLORS[i % TYPE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<MiniTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold tabular-nums text-primary">
                  {total.toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground">Total</span>
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              {data.map((entry, i) => (
                <div
                  key={entry.name}
                  className="flex items-center gap-2 rounded-md border border-border/50 bg-muted/10 px-2.5 py-1.5 text-xs"
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: TYPE_COLORS[i % TYPE_COLORS.length] }}
                  />
                  <span className="capitalize text-muted-foreground">{entry.name}</span>
                  <span className="ml-auto font-semibold text-primary">
                    {entry.value}
                  </span>
                  <span className="text-muted-foreground">
                    ({total ? ((entry.value / total) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ListingsByCity({ properties }: { properties: Property[] }) {
  const data = React.useMemo(() => {
    const byCity: Record<string, number> = {};
    properties.forEach((p) => {
      const city = p.location?.city || "Unknown";
      byCity[city] = (byCity[city] ?? 0) + 1;
    });
    return Object.entries(byCity)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [properties]);

  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <Card className="border-border/60">
      <CardHeader className="border-b border-border/60 pb-4">
        <CardTitle className="text-base text-primary">Listings by City</CardTitle>
        <CardDescription className="mt-1">
          Top markets by number of active listings.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2 pt-4">
        {data.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 py-10 text-center text-sm text-muted-foreground">
            No listings to show yet.
          </div>
        ) : (
          data.map((entry, i) => (
            <div
              key={entry.city}
              className="rounded-lg border border-border/50 bg-muted/10 px-3 py-2.5"
            >
              <div className="mb-2 flex items-center justify-between gap-2 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-border/60 bg-card text-[10px] font-semibold text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="truncate font-medium text-foreground">
                    {entry.city}
                  </span>
                </div>
                <span className="shrink-0 font-bold tabular-nums text-primary">
                  {entry.count}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full border border-border/40 bg-muted/50">
                <div
                  className="h-full rounded-full bg-primary/60"
                  style={{ width: `${(entry.count / max) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
