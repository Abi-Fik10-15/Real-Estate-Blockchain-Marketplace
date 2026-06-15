"use client";

import {
  Wallet,
  Search,
  ShieldCheck,
  Key,
} from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";

const STEPS = [
  {
    step: 1,
    icon: Wallet,
    title: "Connect Wallet",
    description: "Link your Web3 wallet securely to view property certificates and authenticate transactions.",
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    step: 2,
    icon: Search,
    title: "Browse Properties",
    description: "Search premium, blockchain-verified residential and commercial listings across the globe.",
    color: "text-violet-500 bg-violet-500/10",
  },
  {
    step: 3,
    icon: ShieldCheck,
    title: "Verify Ownership",
    description: "Review immutable title history, agent authorization credentials, and on-chain records.",
    color: "text-cyan-500 bg-cyan-500/10",
  },
  {
    step: 4,
    icon: Key,
    title: "Buy or Rent Securely",
    description: "Transact instantly via audited smart contracts using secure decentralized escrow mechanisms.",
    color: "text-emerald-500 bg-emerald-500/10",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-16 lg:py-20 border-b border-border/40 bg-muted/10">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-muted/10 to-transparent" />

      <div className="container max-w-[1280px]">
        <FadeIn className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How <span className="text-gradient">ChainEstate</span> Works
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Complete your real estate transaction in four simple, secure steps.
          </p>
        </FadeIn>

        {/* Timeline Grid */}
        <StaggerContainer className="relative mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Horizontal connection line for desktop */}
          <div className="absolute top-[32px] left-[15%] right-[15%] h-[2px] bg-border/60 -z-10 hidden lg:block" />

          {STEPS.map((s) => (
            <StaggerItem key={s.step}>
              <div className="group relative rounded-xl border border-border/50 bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-card-hover flex flex-col items-center text-center h-full">
                {/* Step Circle & Icon */}
                <div className="relative mb-4">
                  {/* Step Number Badge */}
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-glow">
                    {s.step}
                  </span>
                  
                  {/* Step Icon Container */}
                  <div className={`grid h-12 w-12 place-items-center rounded-full border-2 border-background bg-card shadow-soft text-foreground transition-transform duration-300 group-hover:scale-105`}>
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-bold text-sm text-foreground mb-2">{s.title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
