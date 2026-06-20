"use client";

import * as React from "react";
import {
  ArrowLeftRight,
  Building2,
  ShieldCheck,
  UserCheck,
  UserPlus,
} from "lucide-react";
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

interface ActivityItem {
  id: string;
  icon: React.ElementType;
  iconClass: string;
  title: string;
  subtitle: string;
  time: string;
  avatar?: string;
}

function generateActivities(users: User[], properties: Property[]): ActivityItem[] {
  const items: ActivityItem[] = [];

  properties.slice(0, 2).forEach((p, i) => {
    items.push({
      id: `prop-${p.id}`,
      icon: Building2,
      iconClass: "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400",
      title: "New property listed",
      subtitle: `${p.title} in ${p.location?.city || "Unknown"}`,
      time: `${2 + i * 3}m ago`,
    });
  });

  users.slice(0, 2).forEach((u, i) => {
    items.push({
      id: `user-${u.id}`,
      icon: UserPlus,
      iconClass: "border-purple-200 bg-purple-50 text-purple-600 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-400",
      title: "New user registered",
      subtitle: u.email,
      time: `${5 + i * 4}m ago`,
      avatar: u.avatar,
    });
  });

  properties
    .filter((p) => p.verification.status === "verified")
    .slice(0, 1)
    .forEach((p) => {
      items.push({
        id: `verify-${p.id}`,
        icon: ShieldCheck,
        iconClass: "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400",
        title: "Property verified",
        subtitle: p.title,
        time: "8m ago",
      });
    });

  items.push({
    id: "tx-1",
    icon: ArrowLeftRight,
    iconClass: "border-cyan-200 bg-cyan-50 text-cyan-600 dark:border-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-400",
    title: "Transaction completed",
    subtitle: "0x7f3a...8b2c",
    time: "12m ago",
  });

  const agentUser = users.find((u) => u.role === "agent");
  if (agentUser) {
    items.push({
      id: "agent-1",
      icon: UserCheck,
      iconClass: "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
      title: "New agent approved",
      subtitle: agentUser.name,
      time: "15m ago",
      avatar: agentUser.avatar,
    });
  }

  return items.slice(0, 6);
}

export function ActivityFeed({
  users,
  properties,
}: {
  users: User[];
  properties: Property[];
}) {
  const activities = React.useMemo(
    () => generateActivities(users, properties),
    [users, properties],
  );

  return (
    <Card className="border-border/60">
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base text-primary">
              Real-time Activity
            </CardTitle>
            <CardDescription className="mt-1">
              Latest platform events and updates.
            </CardDescription>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 pt-4">
        {activities.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 py-8 text-center text-sm text-muted-foreground">
            No recent activity yet.
          </div>
        ) : (
          activities.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/10 px-3 py-2.5"
            >
              {item.avatar ? (
                <Avatar className="h-8 w-8 shrink-0 border border-border/60">
                  <AvatarImage src={item.avatar} />
                  <AvatarFallback className="text-xs">
                    {item.subtitle?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border",
                    item.iconClass,
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-tight text-foreground">
                  {item.title}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.subtitle}
                </p>
              </div>
              <span className="shrink-0 text-[11px] text-muted-foreground">
                {item.time}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
