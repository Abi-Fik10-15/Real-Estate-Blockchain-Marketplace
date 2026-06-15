"use client";

import { Building2, FileCheck, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter, FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";

const STATS = [
  {
    icon: Building2,
    value: 12500,
    suffix: "+",
    label: "Properties Verified",
    description: "Title deeds confirmed on-chain",
    color: "text-primary",
    bg: "bg-primary/8 border-primary/20",
    iconColor: "text-primary",
  },
  {
    icon: FileCheck,
    value: 8000,
    suffix: "+",
    label: "Ownership Transfers",
    description: "Immutable deed transfers settled",
    color: "text-indigo-500",
    bg: "bg-indigo-500/8 border-indigo-500/20",
    iconColor: "text-indigo-500",
  },
  {
    icon: Users,
    value: 2500,
    suffix: "+",
    label: "Active Agents",
    description: "Wallet-authorised real estate agents",
    color: "text-emerald-500",
    bg: "bg-emerald-500/8 border-emerald-500/20",
    iconColor: "text-emerald-500",
  },
  {
    icon: TrendingUp,
    value: 99.9,
    suffix: "%",
    label: "Verification Accuracy",
    description: "Oracle-confirmed registry precision",
    color: "text-amber-500",
    bg: "bg-amber-500/8 border-amber-500/20",
    iconColor: "text-amber-500",
  },
];

export function Stats() {
  return (
    <section className="border-y border-border/50 py-16">
      <div className="container mx-auto px-6 lg:px-8">

        {/* Section header */}
        <FadeIn className="mb-10 flex flex-col items-center gap-3 text-center">
          <Badge
            variant="outline"
            className="border-primary/30 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary"
          >
            Platform metrics
          </Badge>
          <h2 className="max-w-2xl text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Trusted by thousands <span className="text-primary">across the globe</span>
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Real numbers from real transactions — every figure backed by immutable on-chain records.
          </p>
        </FadeIn>

        {/* Stats grid */}
        <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <StaggerItem key={s.label}>
              <div className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-border/80 hover:shadow-sm">

                {/* Icon */}
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${s.bg}`}>
                  <s.icon className={`h-4 w-4 ${s.iconColor}`} />
                </div>

                {/* Value */}
                <div>
                  <p className={`text-3xl font-bold tracking-tight ${s.color} sm:text-4xl`}>
                    <AnimatedCounter
                      target={s.value}
                      suffix={s.suffix}
                    />
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {s.label}
                  </p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
                    {s.description}
                  </p>
                </div>

                {/* Bottom divider accent */}
                <div className={`h-0.5 w-8 rounded-full ${s.bg.split(" ")[0].replace("/8", "/40")} transition-all duration-300 group-hover:w-16`} />
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
