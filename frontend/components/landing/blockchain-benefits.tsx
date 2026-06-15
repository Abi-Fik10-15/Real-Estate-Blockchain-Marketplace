"use client";

import {
  Fingerprint,
  Globe2,
  History,
  Lock,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion";

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Immutable Ownership Records",
    description:
      "Property ownership records are permanently stored on the blockchain and can never be altered, deleted, or falsified by any party.",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: Fingerprint,
    title: "Fraud Prevention",
    description:
      "Blockchain technology eliminates duplicate ownership claims and forgery through cryptographic verification of every record.",
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-500/10 text-emerald-500",
  },
  {
    icon: Lock,
    title: "Smart Contract Security",
    description:
      "Automated, audited smart contracts execute secure property transfers without intermediaries, reducing cost and risk.",
    color: "from-violet-500 to-violet-600",
    bgColor: "bg-violet-500/10 text-violet-500",
  },
  {
    icon: History,
    title: "Transparent Transaction History",
    description:
      "Every property has a complete, immutable audit trail — from initial registration through every transfer and verification.",
    color: "from-cyan-500 to-cyan-600",
    bgColor: "bg-cyan-500/10 text-cyan-500",
  },
  {
    icon: Globe2,
    title: "Global Accessibility",
    description:
      "Access verified ownership records from anywhere in the world, 24/7, without relying on local registries or intermediaries.",
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-500/10 text-amber-500",
  },
  {
    icon: Zap,
    title: "Instant Verification",
    description:
      "Ownership checks that traditionally take weeks are completed in seconds with real-time blockchain queries and oracle validation.",
    color: "from-rose-500 to-rose-600",
    bgColor: "bg-rose-500/10 text-rose-500",
  },
];

export function BlockchainBenefits() {
  return (
    <section id="blockchain-benefits" className="relative overflow-hidden py-20 lg:py-28">
      {/* Background */}
      <div className="absolute inset-0 -z-10 section-gradient" />
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="glow-orb left-1/3 top-0 h-[500px] w-[500px] bg-[hsl(221,83%,53%)] opacity-[0.06]" />
        <div className="glow-orb right-1/4 bottom-0 h-[400px] w-[400px] bg-[hsl(262,83%,58%)] opacity-[0.05]" />
      </div>

      <div className="container">
        <FadeIn className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-glow">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Why <span className="text-gradient">Blockchain Ownership</span> Matters
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Traditional property records are vulnerable to fraud, delays, and
            human error. Blockchain technology eliminates these risks with
            cryptographic certainty.
          </p>
        </FadeIn>

        <StaggerContainer className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b) => (
            <StaggerItem key={b.title}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border/50 bg-card/80 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-border hover:shadow-card-hover">
                {/* Hover glow */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-brand opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-15" />

                {/* Icon */}
                <div
                  className={`grid h-14 w-14 place-items-center rounded-2xl ${b.bgColor} transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow`}
                >
                  <b.icon className="h-6 w-6" />
                </div>

                {/* Content */}
                <h3 className="mt-5 text-lg font-semibold">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {b.description}
                </p>

                {/* Bottom accent line */}
                <div className="mt-6 h-1 w-12 rounded-full bg-gradient-to-r opacity-0 transition-all duration-500 group-hover:w-20 group-hover:opacity-100"
                  style={{
                    backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                  }}
                />
                <div className={`mt-0 h-1 w-0 rounded-full bg-gradient-to-r ${b.color} opacity-0 transition-all duration-500 group-hover:w-20 group-hover:opacity-100`} />
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
