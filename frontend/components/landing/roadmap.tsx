"use client";

import {
  BadgeCheck,
  Building2,
  Coins,
  Globe2,
  Rocket,
  Users,
} from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";

const MILESTONES = [
  {
    period: "2026 Q1",
    title: "Property Verification",
    description:
      "Launch of the core property verification engine with government registry integration and AI-powered document analysis.",
    icon: BadgeCheck,
    status: "completed" as const,
    color: "from-blue-500 to-blue-600",
  },
  {
    period: "2026 Q2",
    title: "Agent Ecosystem",
    description:
      "Release of the complete agent management platform with on-chain authorization, CRM tools, and commission tracking.",
    icon: Users,
    status: "active" as const,
    color: "from-violet-500 to-violet-600",
  },
  {
    period: "2026 Q3",
    title: "Marketplace Expansion",
    description:
      "Launch of the global marketplace with advanced search, smart filtering, and interactive property maps across 50+ countries.",
    icon: Building2,
    status: "upcoming" as const,
    color: "from-cyan-500 to-cyan-600",
  },
  {
    period: "2026 Q4",
    title: "Property Tokenization",
    description:
      "Introduction of fractional property ownership through ERC-721/1155 tokenization, enabling micro-investments in premium real estate.",
    icon: Coins,
    status: "upcoming" as const,
    color: "from-amber-500 to-amber-600",
  },
  {
    period: "2027",
    title: "Global Rollout",
    description:
      "Full-scale international expansion to 100+ countries with multi-chain support, DeFi mortgage integration, and institutional partnerships.",
    icon: Globe2,
    status: "upcoming" as const,
    color: "from-emerald-500 to-emerald-600",
  },
];

function StatusBadge({ status }: { status: "completed" | "active" | "upcoming" }) {
  const styles = {
    completed: "bg-success/10 text-success border-success/20",
    active: "bg-primary/10 text-primary border-primary/20 animate-pulse",
    upcoming: "bg-muted text-muted-foreground border-border/50",
  };
  const labels = {
    completed: "Completed",
    active: "In Progress",
    upcoming: "Upcoming",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export function Roadmap() {
  return (
    <section id="roadmap" className="relative overflow-hidden py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />
        <div className="glow-orb left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 bg-[hsl(262,83%,58%)] opacity-[0.04]" />
      </div>

      <div className="container">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-glow">
            <Rocket className="h-7 w-7" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Platform <span className="text-gradient">Roadmap</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Our vision for transforming real estate ownership — from verification
            to tokenization to global adoption.
          </p>
        </FadeIn>

        {/* Timeline */}
        <div className="relative mx-auto mt-16 max-w-4xl">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 h-full w-px bg-gradient-to-b from-primary/50 via-border to-transparent lg:left-1/2 lg:-translate-x-1/2" />

          <StaggerContainer className="space-y-12">
            {MILESTONES.map((m, i) => {
              const isLeft = i % 2 === 0;
              return (
                <StaggerItem key={m.period}>
                  <div className="relative flex gap-6 lg:gap-0">
                    {/* Left content (desktop) */}
                    <div
                      className={`hidden flex-1 lg:block ${
                        isLeft ? "" : "order-last"
                      }`}
                    >
                      {isLeft && (
                        <div className="group mr-12 overflow-hidden rounded-2xl border border-border/50 bg-card/80 p-6 text-right backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-border hover:shadow-card-hover">
                          <div className="pointer-events-none absolute -left-8 -top-8 h-28 w-28 rounded-full bg-gradient-brand opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-10" />
                          <div className="flex items-center justify-end gap-3">
                            <div>
                              <StatusBadge status={m.status} />
                              <h3 className="mt-2 text-lg font-bold">
                                {m.title}
                              </h3>
                            </div>
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            {m.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Center node */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div
                        className={`grid h-12 w-12 place-items-center rounded-full border-4 border-background bg-gradient-to-br ${m.color} text-white shadow-glow`}
                      >
                        <m.icon className="h-5 w-5" />
                      </div>
                      <span className="mt-2 text-xs font-bold text-muted-foreground">
                        {m.period}
                      </span>
                    </div>

                    {/* Right content (desktop) / mobile content */}
                    <div
                      className={`flex-1 ${isLeft ? "hidden lg:block" : ""}`}
                    >
                      {(!isLeft || true) && (
                        <div className="group overflow-hidden rounded-2xl border border-border/50 bg-card/80 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-border hover:shadow-card-hover lg:ml-12">
                          <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-brand opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-10" />
                          <StatusBadge status={m.status} />
                          <h3 className="mt-2 text-lg font-bold">{m.title}</h3>
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            {m.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
