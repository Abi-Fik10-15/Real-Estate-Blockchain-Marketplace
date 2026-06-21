"use client";

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Property, User } from "@/types";

export function TopAgents({
  users,
  properties,
}: {
  users: User[];
  properties: Property[];
}) {
  const agents = React.useMemo(() => {
    return users
      .filter((u) => u.role === "agent")
      .map((agent) => {
        const assignedProps = properties.filter((p) => p.agentId === agent.id);
        const totalValue = assignedProps.reduce((sum, p) => sum + p.price, 0);
        return {
          ...agent,
          propertyCount: assignedProps.length,
          totalValue,
        };
      })
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 3);
  }, [users, properties]);

  const initials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const formatValue = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v}`;
  };

  const rankStyles = [
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
    "border-border bg-muted/30 text-muted-foreground",
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-400",
  ];

  return (
    <Card className="border-border/60">
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base text-primary">
              Top Performing Agents
            </CardTitle>
            <CardDescription className="mt-1">
              Agents ranked by total assigned listing value.
            </CardDescription>
          </div>
          <Link
            href="/dashboard/admin/users"
            className="shrink-0 text-xs font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 pt-4">
        {agents.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 py-8 text-center text-sm text-muted-foreground">
            No agents registered yet.
          </div>
        ) : (
          agents.map((agent, i) => (
            <div
              key={agent.id}
              className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/10 px-3 py-2.5"
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-bold",
                  rankStyles[i] ?? rankStyles[2],
                )}
              >
                {i + 1}
              </span>
              <Avatar className="h-8 w-8 shrink-0 border border-border/60">
                <AvatarImage src={agent.avatar} alt={agent.name} />
                <AvatarFallback className="text-xs">
                  {initials(agent.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {agent.name}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {agent.propertyCount}{" "}
                  {agent.propertyCount === 1 ? "property" : "properties"}
                </p>
              </div>
              <span className="shrink-0 text-sm font-bold tabular-nums text-primary">
                {formatValue(agent.totalValue)}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
