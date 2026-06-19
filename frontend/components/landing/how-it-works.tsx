"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    step: "01",
    title: "Create Your Account",
    description:
      "Register as a buyer, seller, or agent. Connect your Ethereum wallet to unlock on-chain ownership verification and secure document signing.",
  },
  {
    step: "02",
    title: "Discover & Verify Properties",
    description:
      "Browse the marketplace and inspect each listing's on-chain provenance. Every title deed is anchored to an ERC-721 token with a full audit trail.",
  },
  {
    step: "03",
    title: "Submit an Offer",
    description:
      "Place a purchase offer directly through the platform. Funds are locked in a smart-contract escrow — released only when both parties confirm the transaction.",
  },
  {
    step: "04",
    title: "Transfer Ownership On-Chain",
    description:
      "Once escrow is fulfilled, the property NFT transfers to your wallet and the public registry updates instantly — no lawyers or manual filing required.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="primary-band relative overflow-hidden border-b border-primary-foreground/20 py-20">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(255,255,255,0.07),transparent)]" />
      <div className="container relative mx-auto px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-16">
          {/* Left — heading + CTA */}
          <div className="lg:pt-2">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">
              How It Works
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-primary-foreground">
              Own property in four steps
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-primary-foreground/80">
              From account creation to on-chain deed transfer, ChainEstate
              guides you through a fully transparent, trustless process.
            </p>
            <Button
              variant="outline"
              size="lg"
              className="mt-8 border-white/35 bg-transparent text-white shadow-none hover:bg-white/10 hover:text-white dark:border-white/35 dark:bg-transparent dark:text-white dark:hover:bg-white/10 dark:hover:text-white"
              asChild
            >
              <Link href="/register">
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Right — vertical timeline */}
          <div className="relative flex flex-col gap-0">
            {STEPS.map(({ step, title, description }) => (
              <div
                key={step}
                className="group relative flex items-start gap-4 rounded-lg pb-10 pr-3 transition-transform duration-300 ease-out hover:scale-[1.02] active:scale-[0.99] last:pb-0"
              >
                {/* Circle number */}
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/10 text-xs font-semibold text-white transition-all duration-300 group-hover:scale-105 group-hover:border-white/60 group-hover:bg-white/20">
                  {step}
                </div>
                {/* Text */}
                <div className="min-w-0 flex-1 transition-colors duration-300">
                  <h3 className="text-sm font-semibold text-primary-foreground transition-colors duration-300 group-hover:text-white">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-primary-foreground/75 transition-colors duration-300 group-hover:text-primary-foreground/90">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
