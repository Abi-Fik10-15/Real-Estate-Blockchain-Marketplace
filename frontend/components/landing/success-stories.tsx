"use client";

import {
  ArrowDown,
  BadgeCheck,
  Building2,
  Clock,
  DollarSign,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AnimatedCounter,
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion";

const STORIES = [
  {
    title: "Luxury Villa Transfer — Dubai",
    icon: Building2,
    propertyValue: "$1.2M",
    transferTime: "18 Minutes",
    traditionalProcess: "14 Days",
    improvement: "99%",
    result: "Faster Ownership Transfer",
    badge: "Residential",
    gradient: "from-blue-500/20 to-violet-500/20",
    borderGlow: "hover:border-blue-500/30",
  },
  {
    title: "Commercial Office — Singapore",
    icon: Building2,
    propertyValue: "$4.8M",
    transferTime: "22 Minutes",
    traditionalProcess: "21 Days",
    improvement: "99.8%",
    result: "Reduction in Processing Time",
    badge: "Commercial",
    gradient: "from-emerald-500/20 to-cyan-500/20",
    borderGlow: "hover:border-emerald-500/30",
  },
  {
    title: "Apartment Portfolio — Miami",
    icon: Building2,
    propertyValue: "$2.4M",
    transferTime: "12 Minutes",
    traditionalProcess: "18 Days",
    improvement: "100%",
    result: "Fraud-Free Transaction",
    badge: "Multi-Unit",
    gradient: "from-amber-500/20 to-rose-500/20",
    borderGlow: "hover:border-amber-500/30",
  },
  {
    title: "Smart Home — Barcelona",
    icon: Building2,
    propertyValue: "$890K",
    transferTime: "15 Minutes",
    traditionalProcess: "10 Days",
    improvement: "97%",
    result: "Cost Savings on Intermediaries",
    badge: "Smart Home",
    gradient: "from-violet-500/20 to-pink-500/20",
    borderGlow: "hover:border-violet-500/30",
  },
  {
    title: "Resort Property — Bali",
    icon: Building2,
    propertyValue: "$3.6M",
    transferTime: "25 Minutes",
    traditionalProcess: "30 Days",
    improvement: "99.9%",
    result: "Faster Cross-Border Transfer",
    badge: "Hospitality",
    gradient: "from-cyan-500/20 to-blue-500/20",
    borderGlow: "hover:border-cyan-500/30",
  },
  {
    title: "Industrial Warehouse — Toronto",
    icon: Building2,
    propertyValue: "$6.2M",
    transferTime: "30 Minutes",
    traditionalProcess: "25 Days",
    improvement: "98%",
    result: "Reduced Legal Overhead",
    badge: "Industrial",
    gradient: "from-rose-500/20 to-orange-500/20",
    borderGlow: "hover:border-rose-500/30",
  },
];

export function SuccessStories() {
  return (
    <section id="success-stories" className="relative overflow-hidden py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />
        <div className="glow-orb left-1/4 bottom-0 h-[500px] w-[500px] bg-[hsl(221,83%,53%)] opacity-[0.04]" />
      </div>

      <div className="container">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Real <span className="text-gradient">Success Stories</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See how ChainEstate has transformed property transactions for owners,
            agents, and investors across the globe.
          </p>
        </FadeIn>

        <StaggerContainer className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {STORIES.map((s) => (
            <StaggerItem key={s.title}>
              <div
                className={`group relative h-full overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-card-hover ${s.borderGlow}`}
              >
                {/* Gradient top strip */}
                <div
                  className={`h-1.5 bg-gradient-to-r ${s.gradient}`}
                />

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <h3 className="text-base font-bold leading-tight">
                      {s.title}
                    </h3>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {s.badge}
                    </Badge>
                  </div>

                  {/* Stats grid */}
                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-muted/50 p-3 text-center">
                      <DollarSign className="mx-auto h-4 w-4 text-muted-foreground" />
                      <p className="mt-1 text-lg font-bold">{s.propertyValue}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Property Value
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-3 text-center">
                      <Zap className="mx-auto h-4 w-4 text-success" />
                      <p className="mt-1 text-lg font-bold text-success">
                        {s.transferTime}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Transfer Time
                      </p>
                    </div>
                  </div>

                  {/* Traditional comparison */}
                  <div className="mt-4 flex items-center justify-between rounded-xl border border-border/50 bg-destructive/[0.03] px-4 py-2.5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      Traditional: {s.traditionalProcess}
                    </div>
                    <ArrowDown className="h-3.5 w-3.5 text-destructive" />
                  </div>

                  {/* Result */}
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-success/10 px-4 py-3">
                    <BadgeCheck className="h-5 w-5 shrink-0 text-success" />
                    <div>
                      <p className="text-sm font-bold text-success">
                        {s.improvement} {s.result}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
