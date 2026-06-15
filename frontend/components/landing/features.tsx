"use client";

import {
  ArrowLeftRight,
  ArrowRight,
  MapPinned,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Ownership Verification",
    description:
      "Verify property ownership through immutable blockchain records with cryptographic proof.",
  },
  {
    icon: UserCheck,
    title: "Agent Authorization",
    description:
      "Property owners can authorize trusted agents to manage listings securely on-chain.",
  },
  {
    icon: ArrowLeftRight,
    title: "Transparent Transfers",
    description:
      "Track ownership transfers with complete audit trails, recorded permanently on the blockchain.",
  },
  {
    icon: MapPinned,
    title: "Smart Property Discovery",
    description:
      "Search and explore properties through advanced filters and interactive maps worldwide.",
  },
];

export function Features() {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 section-gradient" />
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="glow-orb right-0 top-20 h-[400px] w-[400px] bg-[hsl(262,83%,58%)] opacity-[0.06]" />
        <div className="glow-orb left-0 bottom-20 h-[300px] w-[300px] bg-[hsl(199,89%,48%)] opacity-[0.06]" />
      </div>

      <div className="container py-20 lg:py-28">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Everything you need to{" "}
            <span className="text-gradient">trust the transaction</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A complete toolkit for owners, agents, and buyers — backed by
            verifiable on-chain records.
          </p>
        </FadeIn>

        <StaggerContainer className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <StaggerItem key={f.title}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border/50 bg-card/80 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-3 hover:border-border hover:shadow-card-hover">
                {/* Hover glow */}
                <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-brand opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-15" />

                {/* Icon */}
                <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow-lg">
                  <f.icon className="h-6 w-6" />
                </div>

                {/* Content */}
                <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.description}
                </p>

                {/* Learn More */}
                <div className="mt-5 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-all duration-300 group-hover:opacity-100">
                  Learn More
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
