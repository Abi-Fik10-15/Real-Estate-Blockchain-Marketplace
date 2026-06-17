"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Building2,
  UserPlus,
  ShieldCheck,
  ArrowLeftRight,
  UserCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { User, Property } from "@/types";

/* ------------------------------------------------------------------ */
/*  Activity item types                                                */
/* ------------------------------------------------------------------ */
interface ActivityItem {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  time: string;
  avatar?: string;
}

/* ------------------------------------------------------------------ */
/*  Generate activities from real data                                 */
/* ------------------------------------------------------------------ */
function generateActivities(users: User[], properties: Property[]): ActivityItem[] {
  const items: ActivityItem[] = [];

  // Recent property listings
  properties.slice(0, 2).forEach((p, i) => {
    items.push({
      id: `prop-${p.id}`,
      icon: Building2,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-500/10",
      title: "New property listed",
      subtitle: `${p.title} in ${p.location?.city || "Unknown"}`,
      time: `${2 + i * 3}m ago`,
      avatar: undefined,
    });
  });

  // Recent user registrations
  users.slice(0, 2).forEach((u, i) => {
    items.push({
      id: `user-${u.id}`,
      icon: UserPlus,
      iconColor: "text-purple-500",
      iconBg: "bg-purple-500/10",
      title: "New user registered",
      subtitle: u.email,
      time: `${5 + i * 4}m ago`,
      avatar: u.avatar,
    });
  });

  // Verified properties
  properties
    .filter((p) => p.verification.status === "verified")
    .slice(0, 1)
    .forEach((p) => {
      items.push({
        id: `verify-${p.id}`,
        icon: ShieldCheck,
        iconColor: "text-emerald-500",
        iconBg: "bg-emerald-500/10",
        title: "Property verified",
        subtitle: p.title,
        time: "8m ago",
      });
    });

  // Simulated transaction
  items.push({
    id: "tx-1",
    icon: ArrowLeftRight,
    iconColor: "text-cyan-500",
    iconBg: "bg-cyan-500/10",
    title: "Transaction completed",
    subtitle: "0x7f3a...8b2c",
    time: "12m ago",
  });

  // Agent approved
  const agentUser = users.find((u) => u.role === "agent");
  if (agentUser) {
    items.push({
      id: "agent-1",
      icon: UserCheck,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-500/10",
      title: "New agent approved",
      subtitle: agentUser.name,
      time: "15m ago",
      avatar: agentUser.avatar,
    });
  }

  return items.sort(() => 0.5 - Math.random()).slice(0, 6);
}

/* ------------------------------------------------------------------ */
/*  Activity Feed Component                                            */
/* ------------------------------------------------------------------ */
export function ActivityFeed({
  users,
  properties,
}: {
  users: User[];
  properties: Property[];
}) {
  const activities = React.useMemo(
    () => generateActivities(users, properties),
    [users, properties]
  );

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Real-time Activity
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Live
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1 px-4 pb-4">
        {activities.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35, ease: "easeOut" }}
            className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50"
          >
            {item.avatar ? (
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={item.avatar} />
                <AvatarFallback className="text-xs">
                  {item.subtitle?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full",
                  item.iconBg
                )}
              >
                <item.icon className={cn("h-3.5 w-3.5", item.iconColor)} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-tight">{item.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {item.subtitle}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {item.time}
            </span>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
