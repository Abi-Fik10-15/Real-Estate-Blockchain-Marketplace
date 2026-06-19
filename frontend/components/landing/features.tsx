"use client";

import {
  ShieldCheck,
  FileSearch,
  Wallet,
  Users,
  TrendingUp,
  Globe,
} from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Blockchain Ownership Verification",
    description:
      "Every property title is anchored to an ERC-721 token. Buyers and agents can verify authentic ownership without relying on third-party registries.",
  },
  {
    icon: FileSearch,
    title: "Transparent Transaction History",
    description:
      "Full on-chain audit trail of every listing, transfer, and escrow event. Immutable records prevent document fraud and title disputes.",
  },
  {
    icon: Wallet,
    title: "Crypto & Fiat Settlement",
    description:
      "Smart-contract escrow holds funds in ETH until both parties sign off. Automatic release on confirmation; instant refund on cancellation.",
  },
  {
    icon: Users,
    title: "Agent Authorization System",
    description:
      "Property owners grant wallet-level permissions to agents. Revoke access instantly without paperwork or third-party intermediaries.",
  },
  {
    icon: TrendingUp,
    title: "Real-time Market Data",
    description:
      "Live market metrics, comparable sales, and liquidity signals sourced from verified on-chain transactions across the global registry.",
  },
  {
    icon: Globe,
    title: "Cross-border Property Access",
    description:
      "Buy and sell properties in any jurisdiction. Ownership tokens comply with ERC standards accepted by international property platforms.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-b border-border/50 bg-background py-20">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-12">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
            Platform Features
          </p>
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-foreground">
            Everything you need for property ownership
          </h2>
        </div>

        {/* Grid */}
        <div className="grid gap-px rounded-xl border border-border/80 bg-border/30 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group relative z-0 flex flex-col gap-4 bg-background p-6 transition-all duration-300 ease-out hover:z-10 hover:scale-[1.02] hover:bg-muted/40 active:scale-[0.99] first:rounded-tl-xl last:rounded-br-xl sm:[&:nth-child(2)]:rounded-tr-xl sm:[&:nth-child(5)]:rounded-bl-xl"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 transition-all duration-300 group-hover:border-primary/40 group-hover:bg-primary/10">
                <Icon className="h-4 w-4 text-primary transition-colors duration-300 group-hover:text-primary-500" />
              </div>
              <div>
                <h3 className="mb-1.5 text-sm font-semibold text-foreground transition-colors duration-300 group-hover:text-primary-600">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-foreground/75">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
