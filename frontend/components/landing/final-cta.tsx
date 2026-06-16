"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn, FloatingElement } from "@/components/ui/motion";

export function FinalCTA() {
  return (
    <section id="final-cta" className="relative overflow-hidden py-14 lg:py-20">

      {/* ── Background — matches Features section exactly ─────────────────── */}
      <div className="absolute inset-0 -z-10 section-gradient" />
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="glow-orb left-1/4 top-0 h-[320px] w-[320px]
          bg-[hsl(262,83%,58%)] opacity-[0.08]" />
        <div className="glow-orb right-1/4 bottom-0 h-[260px] w-[260px]
          bg-[hsl(199,89%,48%)] opacity-[0.07]" />
        <div className="glow-orb left-1/2 top-1/2 h-[200px] w-[200px]
          -translate-x-1/2 -translate-y-1/2
          bg-[hsl(262,83%,58%)] opacity-[0.05]" />

        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* ── Floating decorative dots ─────────────────────────────────────── */}
      <FloatingElement delay={0} duration={8} y={12}
        className="pointer-events-none absolute left-[8%] top-[20%] hidden lg:block">
        <div className="h-2 w-2 rounded-full bg-primary/20" />
      </FloatingElement>
      <FloatingElement delay={2} duration={10} y={16}
        className="pointer-events-none absolute right-[12%] top-[30%] hidden lg:block">
        <div className="h-3 w-3 rounded-full bg-primary/15" />
      </FloatingElement>
      <FloatingElement delay={1} duration={9} y={10}
        className="pointer-events-none absolute right-[22%] bottom-[25%] hidden lg:block">
        <div className="h-2 w-2 rounded-sm rotate-45 border border-primary/20" />
      </FloatingElement>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="container relative">
        <FadeIn className="mx-auto max-w-3xl text-center">

          {/* Pill badge — same style as feature cards' icon containers */}
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full
            border border-border/50 bg-card/80 px-4 py-1.5 backdrop-blur-sm">
            <div className="grid h-5 w-5 place-items-center rounded-full bg-gradient-brand shadow-glow">
              <Sparkles className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Blockchain-powered real estate
            </span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Ready to transform{" "}
            <span className="text-gradient">real estate ownership</span>?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Join owners, agents, and investors using on-chain property
            verification to buy, sell, and manage real estate with complete
            transparency.
          </p>

          {/* Stats */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-6
            text-xs font-medium text-muted-foreground">
            {["12,500+ Properties", "2,500+ Agents", "$180M+ Volume"].map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-gradient-brand
                  [background:linear-gradient(135deg,hsl(262,83%,58%),hsl(199,89%,48%))]" />
                {s}
              </span>
            ))}
          </div>

          {/* CTA buttons — mirrors Features card style */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="group relative min-w-[200px] overflow-hidden
                bg-gradient-brand text-primary-foreground shadow-glow
                transition-all duration-300 hover:shadow-glow-lg hover:-translate-y-0.5"
              asChild
            >
              <Link href="/login">
                Join now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="min-w-[200px] border-border/50 bg-card/80 backdrop-blur-sm
                transition-all duration-300 hover:border-border hover:shadow-card-hover hover:-translate-y-0.5"
              asChild
            >
              <Link href="/marketplace">
                <ShoppingBag className="h-4 w-4" />
                Explore marketplace
              </Link>
            </Button>
          </div>

          {/* Trust line */}
          <p className="mt-6 text-xs text-muted-foreground/50">
            No credit card required · Free property verification · Cancel anytime
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
