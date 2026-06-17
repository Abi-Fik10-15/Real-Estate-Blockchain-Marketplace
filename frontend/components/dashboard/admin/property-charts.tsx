"use client";

import * as React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Property } from "@/types";

/* ------------------------------------------------------------------ */
/*  Colors                                                             */
/* ------------------------------------------------------------------ */
const TYPE_COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444"];

/* ------------------------------------------------------------------ */
/*  Custom Tooltip                                                     */
/* ------------------------------------------------------------------ */
function MiniTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-lg border border-border/60 bg-card/95 px-3 py-2 text-sm shadow-lg backdrop-blur-sm">
      <span className="font-medium">{d.name}</span>:{" "}
      <span className="font-bold">{d.value?.toLocaleString()}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Properties by Type (Donut)                                         */
/* ------------------------------------------------------------------ */
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
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Properties by Type
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Donut */}
          <div className="relative h-[160px] w-[160px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={1000}
                >
                  {data.map((_, i) => (
                    <Cell
                      key={i}
                      fill={TYPE_COLORS[i % TYPE_COLORS.length]}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip content={<MiniTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold">
                {total.toLocaleString()}
              </span>
              <span className="text-[10px] text-muted-foreground">Total</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2">
            {data.map((entry, i) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: TYPE_COLORS[i % TYPE_COLORS.length],
                  }}
                />
                <span className="text-muted-foreground">{entry.name}</span>
                <span className="ml-auto font-semibold">
                  {entry.value.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({total ? ((entry.value / total) * 100).toFixed(1) : 0}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Listings by City (Horizontal Bars)                                 */
/* ------------------------------------------------------------------ */
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
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Listings by City
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((entry, i) => (
          <div key={entry.city} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-muted text-[10px] font-semibold text-muted-foreground">
                  {i + 1}
                </span>
                <span className="font-medium">{entry.city}</span>
              </div>
              <span className="font-bold tabular-nums">
                {entry.count.toLocaleString()}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(entry.count / max) * 100}%`,
                  backgroundColor: TYPE_COLORS[i % TYPE_COLORS.length],
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
