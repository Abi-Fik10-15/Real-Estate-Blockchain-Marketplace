"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { User, Property } from "@/types";

/* ------------------------------------------------------------------ */
/*  Top Agents Component                                               */
/* ------------------------------------------------------------------ */
export function TopAgents({
  users,
  properties,
}: {
  users: User[];
  properties: Property[];
}) {
  const agents = React.useMemo(() => {
    const agentUsers = users.filter((u) => u.role === "agent");
    return agentUsers
      .map((agent) => {
        const assignedProps = properties.filter(
          (p) => p.agentId === agent.id
        );
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

  const rankColors = [
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    "bg-slate-500/10 text-slate-500 border-slate-500/20",
    "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  ];

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Top Performing Agents
          </CardTitle>
          <Link
            href="/dashboard/admin/users"
            className="text-xs font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pb-4">
        {agents.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No agents registered yet
          </p>
        )}
        {agents.map((agent, i) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.35 }}
            className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/40"
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${rankColors[i] || rankColors[2]}`}
            >
              {i + 1}
            </span>
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback className="text-xs">
                {initials(agent.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{agent.name}</p>
            </div>
            <Badge
              variant="secondary"
              className="shrink-0 text-[10px] font-semibold"
            >
              {agent.propertyCount} Properties
            </Badge>
            <span className="shrink-0 text-sm font-bold tabular-nums">
              {formatValue(agent.totalValue)}
            </span>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
