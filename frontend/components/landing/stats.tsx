"use client";

import {
  Building2,
  FileCheck,
  TrendingUp,
  Users,
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
    value: 12500,
    suffix: "+",
    label: "Properties Verified",
  },
  {
    icon: FileCheck,
    value: 8000,
    suffix: "+",
    label: "Ownership Transfers",
  },
  {
    icon: Users,
    value: 2500,
    suffix: "+",
    label: "Active Agents",
  },
  {
    icon: TrendingUp,
    value: 99.9,
    suffix: "%",
    label: "Verification Accuracy",
  },
];

export function Stats() {
  return (
    <section className="relative border-y border-border/40 bg-muted/20">
      {/* Subtle background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-mesh opacity-50" />

      <div className="container py-16">
        <StaggerContainer className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <StaggerItem key={s.label}>
              <FadeIn className="group text-center">
                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow transition-transform duration-300 group-hover:scale-110">
                  <s.icon className="h-6 w-6" />
                </div>
                <p className="text-4xl font-bold tracking-tight sm:text-5xl">
                  <AnimatedCounter
                    target={s.value}
                    suffix={s.suffix}
                    className="text-gradient"
                  />
                </p>
                <p className="mt-2 text-sm font-medium text-muted-foreground">
                  {s.label}
                </p>
              </FadeIn>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
