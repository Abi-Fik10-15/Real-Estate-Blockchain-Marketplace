"use client";

import {
  FileCheck2,
  Fingerprint,
  Lock,
  ShieldCheck,
} from "lucide-react";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion";

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: "Blockchain Verified",
    description:
      "Every property title is verified and recorded on an immutable distributed ledger.",
    color: "text-primary bg-primary/10",
  },
  {
    icon: Lock,
    title: "Smart Contract Secured",
    description:
      "Automated smart contracts enforce transparent, trustless transactions.",
    color: "text-success bg-success/10",
  },
  {
    icon: Fingerprint,
    title: "Fraud Prevention",
    description:
      "Multi-layer cryptographic verification prevents ownership fraud and forgery.",
    color: "text-accent bg-accent/10",
  },
  {
    icon: FileCheck2,
    title: "Immutable Records",
    description:
      "Once recorded, title history cannot be altered, deleted, or tampered with.",
    color: "text-purple-500 bg-purple-500/10",
  },
];

export function Trust() {
  return (
    <section className="relative overflow-hidden border-y border-border/40">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-muted/20" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-mesh opacity-40" />

      <div className="container py-20 lg:py-24">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Built on <span className="text-gradient">Trust & Security</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Enterprise-grade security backed by blockchain technology to protect
            every transaction.
          </p>
        </FadeIn>

        <StaggerContainer className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_ITEMS.map((item) => (
            <StaggerItem key={item.title}>
              <div className="group relative text-center">
                {/* Animated icon */}
                <div
                  className={`mx-auto grid h-16 w-16 place-items-center rounded-2xl ${item.color} transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow`}
                >
                  <item.icon className="h-7 w-7" />
                </div>

                {/* Pulse ring */}
                <div className="pointer-events-none absolute left-1/2 top-0 h-16 w-16 -translate-x-1/2">
                  <div
                    className={`absolute inset-0 rounded-2xl ${item.color} animate-pulse-glow opacity-0 group-hover:opacity-30`}
                  />
                </div>

                <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
