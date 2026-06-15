"use client";

import {
  BadgeCheck,
  ClipboardCheck,
  FileKey2,
  Link2,
  UserCheck,
} from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";

const STEPS = [
  {
    step: 1,
    icon: ClipboardCheck,
    title: "Register Property",
    description:
      "Submit property details including title deeds, location data, and ownership documents to the ChainEstate platform.",
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-500/10 text-blue-500",
  },
  {
    step: 2,
    icon: FileKey2,
    title: "Verify Ownership Documents",
    description:
      "Our AI-powered verification engine cross-references submitted documents with government registries and title oracles.",
    color: "from-violet-500 to-violet-600",
    bg: "bg-violet-500/10 text-violet-500",
  },
  {
    step: 3,
    icon: Link2,
    title: "Blockchain Record Creation",
    description:
      "A unique, tamper-proof ownership record is created on the blockchain with cryptographic proof of authenticity.",
    color: "from-cyan-500 to-cyan-600",
    bg: "bg-cyan-500/10 text-cyan-500",
  },
  {
    step: 4,
    icon: UserCheck,
    title: "Agent Authorization",
    description:
      "Property owners can authorize verified agents to manage listings, schedule viewings, and negotiate on their behalf.",
    color: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-500/10 text-emerald-500",
  },
  {
    step: 5,
    icon: BadgeCheck,
    title: "Secure Ownership Transfer",
    description:
      "Smart contracts automate the entire transfer process — escrow, verification, and title update — in minutes, not weeks.",
    color: "from-amber-500 to-amber-600",
    bg: "bg-amber-500/10 text-amber-500",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden py-20 lg:py-28">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />
        <div className="glow-orb left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 bg-[hsl(199,89%,48%)] opacity-[0.04]" />
      </div>

      <div className="container">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            How <span className="text-gradient">ChainEstate</span> Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From property registration to secure ownership transfer — everything
            happens on-chain, transparently, and in minutes.
          </p>
        </FadeIn>

        {/* Timeline */}
        <StaggerContainer className="relative mt-16">
          {/* Vertical connector line (desktop) */}
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-border to-transparent lg:block" />

          <div className="space-y-8 lg:space-y-0">
            {STEPS.map((s, i) => {
              const isEven = i % 2 === 0;
              return (
                <StaggerItem key={s.step}>
                  <div
                    className={`relative flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-0 ${
                      isEven ? "" : "lg:flex-row-reverse"
                    }`}
                  >
                    {/* Content card */}
                    <div
                      className={`flex-1 ${
                        isEven ? "lg:pr-16 lg:text-right" : "lg:pl-16"
                      }`}
                    >
                      <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-border hover:shadow-card-hover">
                        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-brand opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-10" />

                        <div
                          className={`flex items-center gap-4 ${
                            isEven ? "lg:flex-row-reverse" : ""
                          }`}
                        >
                          <div
                            className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${s.bg} transition-transform duration-300 group-hover:scale-110`}
                          >
                            <s.icon className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Step {s.step}
                            </p>
                            <h3 className="text-lg font-bold">{s.title}</h3>
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                          {s.description}
                        </p>
                      </div>
                    </div>

                    {/* Center dot */}
                    <div className="relative z-10 hidden lg:block">
                      <div
                        className={`grid h-12 w-12 place-items-center rounded-full border-4 border-background bg-gradient-to-br ${s.color} text-white shadow-glow`}
                      >
                        <span className="text-sm font-bold">{s.step}</span>
                      </div>
                    </div>

                    {/* Spacer for the other side */}
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
