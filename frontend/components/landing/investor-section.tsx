"use client";

import {
  BarChart3,
  DollarSign,
  Globe2,
  Layers,
  Map,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AnimatedCounter,
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion";

const INVESTOR_POINTS = [
  {
    icon: TrendingUp,
    title: "Market Opportunity",
    description:
      "The global real estate market is valued at $326 trillion — and less than 1% uses blockchain technology. ChainEstate is positioned to capture this massive, untapped market.",
    stat: "$326T",
    statLabel: "Global RE Market",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: Layers,
    title: "Property Tokenization",
    description:
      "Fractional ownership through tokenization opens real estate to millions of new investors. Our platform supports ERC-721 and ERC-1155 token standards for maximum flexibility.",
    stat: "100x",
    statLabel: "Market Expansion",
    color: "bg-violet-500/10 text-violet-500",
  },
  {
    icon: Globe2,
    title: "Global Expansion",
    description:
      "Currently operating in 30+ countries with plans to expand to 100+ jurisdictions by 2028. Strategic partnerships with local registries accelerate market entry.",
    stat: "30+",
    statLabel: "Countries",
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    icon: Map,
    title: "Future Roadmap",
    description:
      "From property NFTs to DeFi mortgage integration, our roadmap includes game-changing features that redefine property ownership for the Web3 era.",
    stat: "12+",
    statLabel: "Features Planned",
    color: "bg-cyan-500/10 text-cyan-500",
  },
  {
    icon: DollarSign,
    title: "Revenue Potential",
    description:
      "Multiple revenue streams: verification fees, transfer commissions, agent subscriptions, tokenization fees, and premium analytics — all scaling with platform growth.",
    stat: "$48M",
    statLabel: "ARR Target",
    color: "bg-amber-500/10 text-amber-500",
  },
  {
    icon: BarChart3,
    title: "Traction & Metrics",
    description:
      "12,500+ verified properties, 2,500+ active agents, $180M+ in managed volume, and 99.9% verification accuracy — proving product-market fit at scale.",
    stat: "$180M+",
    statLabel: "Volume Managed",
    color: "bg-rose-500/10 text-rose-500",
  },
];

export function InvestorSection() {
  return (
    <section id="investors" className="relative overflow-hidden py-20 lg:py-28">
      {/* Background */}
      <div className="absolute inset-0 -z-10 section-gradient-alt" />
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="glow-orb left-1/4 top-1/4 h-[500px] w-[500px] bg-[hsl(262,83%,58%)] opacity-[0.06]" />
        <div className="glow-orb right-1/4 bottom-1/4 h-[400px] w-[400px] bg-[hsl(199,89%,48%)] opacity-[0.05]" />
      </div>

      <div className="container">
        <FadeIn className="mx-auto max-w-3xl text-center">
          <Badge
            variant="info"
            className="mb-5 border border-accent/20 px-4 py-1.5"
          >
            <TrendingUp className="h-3.5 w-3.5" /> Investment Opportunity
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Invest in the Future of{" "}
            <span className="text-gradient">Real Estate</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            ChainEstate is transforming a $326 trillion industry with
            blockchain-powered property verification. Join our mission to make
            real estate ownership transparent, secure, and accessible to
            everyone.
          </p>
        </FadeIn>

        {/* Key metrics bar */}
        <FadeIn delay={0.2} className="mt-12">
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-sm sm:grid-cols-4">
            {[
              { value: 12500, suffix: "+", label: "Properties Verified" },
              { value: 180, prefix: "$", suffix: "M+", label: "Volume Managed" },
              { value: 2500, suffix: "+", label: "Active Agents" },
              { value: 99.9, suffix: "%", label: "Verification Accuracy" },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <p className="text-2xl font-bold sm:text-3xl">
                  <AnimatedCounter
                    target={m.value}
                    prefix={m.prefix}
                    suffix={m.suffix}
                    className="text-gradient"
                  />
                </p>
                <p className="mt-1 text-[10px] font-medium text-muted-foreground sm:text-xs">
                  {m.label}
                </p>
              </div>
            ))}
          </div>
        </FadeIn>

        <StaggerContainer className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {INVESTOR_POINTS.map((p) => (
            <StaggerItem key={p.title}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border/50 bg-card/80 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-border hover:shadow-card-hover">
                <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-brand opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-10" />

                <div className="flex items-start justify-between">
                  <div
                    className={`grid h-12 w-12 place-items-center rounded-2xl ${p.color} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <p.icon className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gradient">{p.stat}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {p.statLabel}
                    </p>
                  </div>
                </div>

                <h3 className="mt-4 text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {p.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
