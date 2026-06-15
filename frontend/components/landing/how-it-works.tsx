"use client";

import {
  BadgeCheck,
  ClipboardCheck,
  FileKey2,
  Link2,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";

const STEPS = [
  {
    step: 1,
    icon: ClipboardCheck,
    title: "Register Property",
    description:
      "Submit property details including title deeds, location data, and ownership documents to the ChainEstate platform.",
    accent: "text-primary",
    iconBg: "bg-primary/8 border-primary/20",
    stepBg: "bg-primary/10 text-primary border-primary/25",
  },
  {
    step: 2,
    icon: FileKey2,
    title: "Verify Ownership Documents",
    description:
      "Our verification engine cross-references submitted documents with government registries and title oracles.",
    accent: "text-violet-500",
    iconBg: "bg-violet-500/8 border-violet-500/20",
    stepBg: "bg-violet-500/10 text-violet-500 border-violet-500/25",
  },
  {
    step: 3,
    icon: Link2,
    title: "Blockchain Record Creation",
    description:
      "A unique, tamper-proof ownership record is created on-chain with cryptographic proof of authenticity.",
    accent: "text-cyan-500",
    iconBg: "bg-cyan-500/8 border-cyan-500/20",
    stepBg: "bg-cyan-500/10 text-cyan-500 border-cyan-500/25",
  },
  {
    step: 4,
    icon: UserCheck,
    title: "Agent Authorization",
    description:
      "Property owners can authorize verified agents to manage listings, schedule viewings, and negotiate on their behalf.",
    accent: "text-emerald-500",
    iconBg: "bg-emerald-500/8 border-emerald-500/20",
    stepBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/25",
  },
  {
    step: 5,
    icon: BadgeCheck,
    title: "Secure Ownership Transfer",
    description:
      "Smart contracts automate the entire transfer process — escrow, verification, and title update — in minutes, not weeks.",
    accent: "text-amber-500",
    iconBg: "bg-amber-500/8 border-amber-500/20",
    stepBg: "bg-amber-500/10 text-amber-500 border-amber-500/25",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-border/50 py-16 lg:py-20">
      <div className="container mx-auto px-6 lg:px-8">

        {/* Header */}
        <FadeIn className="mb-12 flex flex-col items-center gap-3 text-center">
          <Badge
            variant="outline"
            className="border-primary/30 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary"
          >
            How it works
          </Badge>
          <h2 className="max-w-2xl text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            From listing to deed —{" "}
            <span className="text-primary">fully on-chain</span>
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            From property registration to secure ownership transfer — everything
            happens on-chain, transparently, and in minutes.
          </p>
        </FadeIn>

        {/* Steps — vertical timeline on mobile, alternating on desktop */}
        <StaggerContainer className="relative">
          {/* Vertical connector line (desktop) */}
          <div className="absolute left-1/2 hidden h-full w-px -translate-x-1/2 bg-border/50 lg:block" />

          <div className="space-y-6 lg:space-y-0">
            {STEPS.map((s, i) => {
              const isEven = i % 2 === 0;
              return (
                <StaggerItem key={s.step}>
                  <div
                    className={`relative flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-0 ${
                      isEven ? "" : "lg:flex-row-reverse"
                    }`}
                  >
                    {/* Content card */}
                    <div
                      className={`flex-1 ${
                        isEven ? "lg:pr-14 lg:text-right" : "lg:pl-14"
                      }`}
                    >
                      <div className="group rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-border/80 hover:shadow-sm">

                        {/* Icon + step label row */}
                        <div
                          className={`flex items-center gap-3 ${
                            isEven ? "lg:flex-row-reverse" : ""
                          }`}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${s.iconBg}`}
                          >
                            <s.icon className={`h-4 w-4 ${s.accent}`} />
                          </div>
                          <div className={isEven ? "lg:text-right" : ""}>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                              Step {s.step}
                            </p>
                            <h3 className="text-sm font-semibold text-foreground">
                              {s.title}
                            </h3>
                          </div>
                        </div>

                        <p className={`mt-3 text-[12px] leading-relaxed text-muted-foreground ${isEven ? "lg:text-right" : ""}`}>
                          {s.description}
                        </p>
                      </div>
                    </div>

                    {/* Center dot on the connector */}
                    <div className="relative z-10 hidden lg:flex lg:shrink-0 lg:items-center lg:justify-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-card ring-2 ${s.stepBg}`}
                      >
                        <span className={`text-xs font-bold ${s.accent}`}>
                          {s.step}
                        </span>
                      </div>
                    </div>

                    {/* Spacer — other side */}
                    <div className="hidden flex-1 lg:block" />
                  </div>
                </StaggerItem>
              );
            })}
          </div>
        </StaggerContainer>
      </div>
    </section>
  );
}
