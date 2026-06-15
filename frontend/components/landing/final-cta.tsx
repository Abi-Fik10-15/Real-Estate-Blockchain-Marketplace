"use client";

import Link from "next/link";
import { ArrowRight, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn, FloatingElement } from "@/components/ui/motion";
import { WalletConnect } from "@/components/wallet/wallet-connect";

export function FinalCTA() {
  return (
    <section id="final-cta" className="relative overflow-hidden py-16 lg:py-20">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-violet-950 dark:from-slate-950 dark:via-blue-950/80 dark:to-violet-950/80" />

        {/* Animated glow orbs */}
        <div className="glow-orb left-1/4 top-1/4 h-[300px] w-[300px] bg-blue-500/10 opacity-[0.15] animate-float" />
        <div className="glow-orb right-1/4 bottom-1/4 h-[250px] w-[250px] bg-violet-500/10 opacity-[0.12]" style={{ animationDelay: "2s" }} />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      {/* Floating elements */}
      <FloatingElement
        delay={0}
        duration={8}
        y={10}
        className="pointer-events-none absolute left-[15%] top-[20%] hidden lg:block"
      >
        <div className="h-2 w-2 rounded-full bg-blue-400/30" />
      </FloatingElement>
      <FloatingElement
        delay={2}
        duration={10}
        y={15}
        className="pointer-events-none absolute right-[20%] top-[30%] hidden lg:block"
      >
        <div className="h-3 w-3 rounded-full bg-violet-400/20" />
      </FloatingElement>

      <div className="container max-w-[1280px] relative">
        <FadeIn className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
            <Rocket className="h-6 w-6 text-white" />
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Start Your Secure Property Journey Today
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-blue-100/70">
            Join owners, agents, and investors using blockchain property verification to buy, sell, and lease real estate with cryptographic authenticity.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              size="default"
              className="w-full sm:w-auto min-w-[180px] h-10 text-sm bg-white text-slate-950 shadow-soft hover:bg-blue-50/90 transition-transform active:scale-98"
              asChild
            >
              <Link href="/marketplace">
                Explore Properties
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            </Button>
            <WalletConnect 
              size="default" 
              className="w-full sm:w-auto min-w-[180px] h-10 text-sm border-white/20 bg-white/5 text-white hover:bg-white/10" 
            />
          </div>

          {/* Trust text */}
          <p className="mt-6 text-xs text-blue-200/40">
            Secure multi-sig escrow · Instant on-chain registration · Licensed title agents
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
