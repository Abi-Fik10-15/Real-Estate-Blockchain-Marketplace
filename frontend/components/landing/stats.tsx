"use client";

import {
  Building2,
  ShieldCheck,
  Users,
  History,
} from "lucide-react";
import {
  AnimatedCounter,
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion";

const STATS = [
  {
    icon: Building2,
    value: 15200,
    suffix: "+",
    label: "Properties Listed",
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    icon: ShieldCheck,
    value: 12400,
    suffix: "+",
    label: "Verified Properties",
    color: "text-emerald-500 bg-emerald-500/10",
  },
  {
    icon: Users,
    value: 1800,
    suffix: "+",
    label: "Verified Agents",
    color: "text-violet-500 bg-violet-500/10",
  },
  {
    icon: History,
    value: 45000,
    suffix: "+",
    label: "Blockchain Transactions",
    color: "text-cyan-500 bg-cyan-500/10",
  },
];

export function Stats() {
  return (
    <section className="relative border-b border-border/40 bg-muted/10 py-10 lg:py-12">
      {/* Subtle background mesh */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-mesh opacity-30" />

      <div className="container max-w-[1280px]">
        <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <StaggerItem key={s.label}>
              <FadeIn className="h-full">
                <div className="h-full rounded-xl border border-border/50 bg-card p-4 shadow-soft text-center group transition-all duration-300 hover:border-border hover:shadow-card-hover flex flex-col items-center justify-center">
                  <div className={`mb-3 grid h-10 w-10 place-items-center rounded-lg ${s.color} transition-transform duration-300 group-hover:scale-105`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-bold tracking-tight sm:text-3xl text-gradient">
                    <AnimatedCounter
                      target={s.value}
                      suffix={s.suffix}
                    />
                  </p>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              </FadeIn>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
