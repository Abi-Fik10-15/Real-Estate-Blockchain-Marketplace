"use client";

import Link from "next/link";
import {
  ArrowRight,
  Rocket,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn, FloatingElement } from "@/components/ui/motion";

export function FinalCTA() {
  return (
    <section id="final-cta" className="relative overflow-hidden py-24 lg:py-32">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-violet-950 dark:from-slate-950 dark:via-blue-950/80 dark:to-violet-950/80" />

        {/* Animated glow orbs */}
        <div className="glow-orb left-1/4 top-1/4 h-[400px] w-[400px] bg-blue-500 opacity-[0.15] animate-float" />
        <div className="glow-orb right-1/4 bottom-1/4 h-[350px] w-[350px] bg-violet-500 opacity-[0.12]" style={{ animationDelay: "2s" }} />
        <div className="glow-orb left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 bg-cyan-500 opacity-[0.08]" style={{ animationDelay: "4s" }} />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
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
        y={15}
        className="pointer-events-none absolute left-[10%] top-[15%] hidden lg:block"
      >
        <div className="h-3 w-3 rounded-full bg-blue-400/30" />
      </FloatingElement>
      <FloatingElement
        delay={2}
        duration={10}
        y={20}
        className="pointer-events-none absolute right-[15%] top-[25%] hidden lg:block"
      >
        <div className="h-4 w-4 rounded-full bg-violet-400/20" />
      </FloatingElement>
      <FloatingElement
        delay={4}
        duration={7}
        y={12}
        className="pointer-events-none absolute left-[20%] bottom-[20%] hidden lg:block"
      >
        <div className="h-2 w-2 rounded-full bg-cyan-400/30" />
      </FloatingElement>
      <FloatingElement
        delay={1}
        duration={9}
        y={18}
        className="pointer-events-none absolute right-[25%] bottom-[30%] hidden lg:block"
      >
        <div className="h-5 w-5 rounded-sm rotate-45 border border-blue-400/20" />
      </FloatingElement>
      <FloatingElement
        delay={3}
        duration={11}
        y={10}
        className="pointer-events-none absolute left-[35%] top-[60%] hidden lg:block"
      >
        <div className="h-3 w-3 rounded-sm rotate-12 border border-violet-400/15" />
      </FloatingElement>

      <div className="container relative">
        <FadeIn className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <Rocket className="h-8 w-8 text-white" />
          </div>

          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            Ready to Transform{" "}
            <span className="text-gradient-animated">
              Real Estate Ownership
            </span>
            ?
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-blue-100/70 sm:text-xl">
            Join thousands of owners, agents, and investors using
            blockchain-powered property verification to buy, sell, and manage
            real estate with complete transparency.
          </p>

          {/* Stats */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm text-blue-200/60">
            {[
              "12,500+ Properties Verified",
              "2,500+ Active Agents",
              "$180M+ Volume Managed",
            ].map((s) => (
              <span key={s} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                {s}
              </span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="min-w-[220px] bg-white text-slate-900 shadow-lg transition-all hover:bg-blue-50 hover:shadow-xl"
              asChild
            >
              <Link href="/marketplace">
                Start Verifying Properties
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="min-w-[220px] border-white/20 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10"
              asChild
            >
              <Link href="/marketplace">
                <ShoppingBag className="h-4 w-4" />
                Explore Marketplace
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="min-w-[220px] border-violet-400/30 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20"
            >
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </Button>
          </div>

          {/* Trust text */}
          <p className="mt-8 text-xs text-blue-200/40">
            No credit card required · Free property verification · Cancel
            anytime
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
