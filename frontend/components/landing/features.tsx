"use client";

import {
  ArrowLeftRight,
  ArrowRight,
  MapPinned,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Ownership Verification",
    description:
      "Verify property ownership through immutable blockchain records with cryptographic proof.",
    accent: "text-primary",
    iconBg: "bg-primary/8 border-primary/20",
  },
  {
    icon: UserCheck,
    title: "Agent Authorization",
    description:
      "Property owners can authorize trusted agents to manage listings securely on-chain.",
    accent: "text-indigo-500",
    iconBg: "bg-indigo-500/8 border-indigo-500/20",
  },
  {
    icon: ArrowLeftRight,
    title: "Transparent Transfers",
    description:
      "Track ownership transfers with complete audit trails, recorded permanently on the blockchain.",
    accent: "text-emerald-500",
    iconBg: "bg-emerald-500/8 border-emerald-500/20",
  },
  {
    icon: MapPinned,
    title: "Smart Property Discovery",
    description:
      "Search and explore properties through advanced filters and interactive maps worldwide.",
    accent: "text-amber-500",
    iconBg: "bg-amber-500/8 border-amber-500/20",
  },
];

export function Features() {
  return (
    <section id="features" className="border-b border-border/50 py-16 lg:py-20 bg-primary-50/20">
      <div className="container mx-auto px-6 lg:px-8">

        {/* Header */}
        <FadeIn className="mb-12 flex flex-col items-center gap-3 text-center">
          <Badge
            variant="outline"
            className="border-primary/30 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary"
          >
            Platform features
          </Badge>
          <h2 className="max-w-2xl text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Everything you need to{" "}
            <span className="text-primary">trust the transaction</span>
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            A complete toolkit for owners, agents, and buyers — backed by
            verifiable on-chain records.
          </p>
        </FadeIn>

        {/* Feature cards */}
        <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <StaggerItem key={f.title}>
              <div className="group flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-border/80 hover:shadow-sm">

                {/* Icon */}
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${f.iconBg}`}>
                  <f.icon className={`h-4 w-4 ${f.accent}`} />
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-1.5">
                  <h3 className="text-lg font-bold text-primary-500">
                    {f.title}
                  </h3>
                  <p className="text-[12px] leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                </div>

                {/* Learn more */}
                <div className={`flex items-center gap-1 text-[11px] font-semibold ${f.accent} opacity-0 transition-all duration-200 group-hover:opacity-100`}>
                  Learn more
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
