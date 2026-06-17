"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  ShieldCheck,
  Users,
  FileBarChart,
  ArrowLeftRight,
  Settings,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Actions config                                                     */
/* ------------------------------------------------------------------ */
const actions = [
  {
    label: "Add Property",
    icon: Building2,
    href: "/dashboard/admin/properties",
    color: "text-blue-500",
    bg: "bg-blue-500/10 group-hover:bg-blue-500/20",
  },
  {
    label: "Verify Property",
    icon: ShieldCheck,
    href: "/dashboard/admin/records",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
  },
  {
    label: "Manage Users",
    icon: Users,
    href: "/dashboard/admin/users",
    color: "text-purple-500",
    bg: "bg-purple-500/10 group-hover:bg-purple-500/20",
  },
  {
    label: "Generate Report",
    icon: FileBarChart,
    href: "/dashboard/admin/reports",
    color: "text-amber-500",
    bg: "bg-amber-500/10 group-hover:bg-amber-500/20",
  },
  {
    label: "View Transactions",
    icon: ArrowLeftRight,
    href: "/dashboard/sandbox",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10 group-hover:bg-cyan-500/20",
  },
  {
    label: "System Settings",
    icon: Settings,
    href: "/dashboard/admin",
    color: "text-slate-500",
    bg: "bg-slate-500/10 group-hover:bg-slate-500/20",
  },
];

/* ------------------------------------------------------------------ */
/*  Quick Actions Component                                            */
/* ------------------------------------------------------------------ */
export function QuickActions() {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {actions.map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
            >
              <Link
                href={action.href}
                className="group flex flex-col items-center gap-2 rounded-xl border border-transparent p-3 text-center transition-all hover:border-border/60 hover:bg-muted/30"
              >
                <div
                  className={cn(
                    "grid h-10 w-10 place-items-center rounded-lg transition-colors",
                    action.bg
                  )}
                >
                  <action.icon className={cn("h-5 w-5", action.color)} />
                </div>
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                  {action.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
