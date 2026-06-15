"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  FileSearch,
  RotateCcw,
  Shield,
  XCircle,
} from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";

const COMPARISONS = [
  {
    feature: "Verification Speed",
    icon: Clock,
    traditional: "2–4 weeks average",
    chainEstate: "Under 30 seconds",
    traditionalBad: true,
  },
  {
    feature: "Security Level",
    icon: Shield,
    traditional: "Paper-based, forgeable",
    chainEstate: "Cryptographic proof",
    traditionalBad: true,
  },
  {
    feature: "Transparency",
    icon: Eye,
    traditional: "Opaque, siloed records",
    chainEstate: "Full audit trail",
    traditionalBad: true,
  },
  {
    feature: "Fraud Risk",
    icon: AlertTriangle,
    traditional: "High — duplicate titles common",
    chainEstate: "Near-zero — immutable ledger",
    traditionalBad: true,
  },
  {
    feature: "Ownership Tracking",
    icon: FileSearch,
    traditional: "Manual, error-prone",
    chainEstate: "Automated, real-time",
    traditionalBad: true,
  },
  {
    feature: "Transfer Process",
    icon: RotateCcw,
    traditional: "Multiple intermediaries",
    chainEstate: "Direct smart contract",
    traditionalBad: true,
  },
];

export function Comparison() {
  return (
    <section id="comparison" className="relative overflow-hidden py-20 lg:py-28">
      {/* Background */}
      <div className="absolute inset-0 -z-10 section-gradient-alt" />
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="glow-orb left-0 top-1/3 h-[400px] w-[400px] bg-[hsl(262,83%,58%)] opacity-[0.05]" />
        <div className="glow-orb right-0 bottom-1/3 h-[400px] w-[400px] bg-[hsl(199,89%,48%)] opacity-[0.05]" />
      </div>

      <div className="container">
        <FadeIn className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Traditional System vs{" "}
            <span className="text-gradient">ChainEstate</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See how blockchain-powered property verification outperforms
            traditional real estate processes at every step.
          </p>
        </FadeIn>

        {/* Comparison grid */}
        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          {/* Traditional column header */}
          <FadeIn direction="left" className="hidden lg:block">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
                <XCircle className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-muted-foreground">
                Traditional System
              </h3>
              <p className="mt-1 text-sm text-muted-foreground/60">
                Paper-based, slow, vulnerable
              </p>
            </div>
          </FadeIn>

          {/* ChainEstate column header */}
          <FadeIn direction="right" className="hidden lg:block">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand text-white shadow-glow">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold">ChainEstate</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Blockchain-powered, instant, secure
              </p>
            </div>
          </FadeIn>

          {/* Comparison rows */}
          {COMPARISONS.map((c, i) => (
            <StaggerContainer key={c.feature} className="contents">
              {/* Traditional */}
              <StaggerItem>
                <div className="group flex items-start gap-4 rounded-2xl border border-border/50 bg-card/60 p-5 transition-all duration-300 hover:border-destructive/30 hover:bg-destructive/[0.02]">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:hidden">
                      {c.feature} — Traditional
                    </p>
                    <p className="font-medium lg:hidden">{c.feature}</p>
                    <p className="text-sm text-muted-foreground">
                      <XCircle className="mr-1.5 inline h-3.5 w-3.5 text-destructive" />
                      {c.traditional}
                    </p>
                  </div>
                </div>
              </StaggerItem>

              {/* ChainEstate */}
              <StaggerItem>
                <div className="group flex items-start gap-4 rounded-2xl border border-border/50 bg-card/80 p-5 transition-all duration-300 hover:border-success/30 hover:shadow-card-hover">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-success/10 text-success">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:hidden">
                      {c.feature} — ChainEstate
                    </p>
                    <p className="font-medium text-sm">
                      <CheckCircle2 className="mr-1.5 inline h-3.5 w-3.5 text-success" />
                      {c.chainEstate}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            </StaggerContainer>
          ))}
        </div>
      </div>
    </section>
  );
}
