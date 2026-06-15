"use client";

import { ShieldCheck, UserCheck, RefreshCw, Lock, BadgeCheck } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";

const VERIFICATIONS = [
  {
    icon: ShieldCheck,
    title: "Ownership Verification",
    description: "Every property title is cryptographically anchored to the blockchain, eliminating dual-sales and title disputes.",
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    icon: UserCheck,
    title: "Agent Authorization",
    description: "Owners explicitly delegate listing permissions to licensed agents on-chain, securing buyer-agent relations.",
    color: "text-violet-500 bg-violet-500/10",
  },
  {
    icon: RefreshCw,
    title: "Transparent Transfers",
    description: "Every transaction, historic transfer, and change of ownership is permanently tracked in a public ledger.",
    color: "text-cyan-500 bg-cyan-500/10",
  },
  {
    icon: Lock,
    title: "Smart Contract Security",
    description: "Funds and deeds are held in fully audited, decentralized escrows, completing transfers instantly upon agreement.",
    color: "text-emerald-500 bg-emerald-500/10",
  },
];

export function BlockchainVerification() {
  return (
    <section id="blockchain-verification" className="relative overflow-hidden py-16 lg:py-20 border-b border-border/40 bg-muted/10">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />
      <div className="glow-orb left-1/3 top-1/2 h-[400px] w-[400px] bg-primary/5 blur-[120px]" />

      <div className="container max-w-[1280px]">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left column - Content */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <FadeIn direction="left">
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <BadgeCheck className="h-3.5 w-3.5" /> Immutable Security
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl leading-tight">
                Decentralized Trust for <span className="text-gradient">Real Estate</span>
              </h2>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                ChainEstate replaces legacy bureaucracy with blockchain validation. 
                By encoding ownership rules directly into smart contracts, we eliminate the need for manual title reviews, reduce settlement time from weeks to minutes, and protect buyers from transaction fraud.
              </p>
              <div className="mt-8 border-t border-border/60 pt-6">
                <div className="flex gap-4">
                  <div>
                    <h4 className="text-2xl font-bold text-primary">100%</h4>
                    <p className="text-xs text-muted-foreground mt-1">Tamper-Proof Records</p>
                  </div>
                  <div className="border-l border-border/60 pl-6">
                    <h4 className="text-2xl font-bold text-primary">Zero</h4>
                    <p className="text-xs text-muted-foreground mt-1">Intermediary Markup</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right column - 2x2 Grid of Icon Cards */}
          <div className="lg:col-span-7">
            <StaggerContainer className="grid gap-4 sm:grid-cols-2">
              {VERIFICATIONS.map((item) => (
                <StaggerItem key={item.title}>
                  <div className="group relative rounded-xl border border-border/50 bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-card-hover">
                    <div className="flex items-center gap-4">
                      <div className={`grid h-12 w-12 place-items-center rounded-lg ${item.color} transition-transform group-hover:scale-105`}>
                        <item.icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold text-base">{item.title}</h3>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
