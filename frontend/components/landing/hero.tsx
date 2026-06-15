"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Wallet, BedDouble, Bath, Ruler, Heart, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WalletConnect } from "@/components/wallet/wallet-connect";
import {
  FadeIn,
  FloatingElement,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion";

export function Hero() {
  return (
    <section className="border-b border-border/50 py-12 lg:py-20">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">

          {/* Left column */}
          <StaggerContainer className="flex flex-col">
            {/* Badge */}
            <StaggerItem>
              <Badge variant="outline" className="mb-6 gap-1.5 border-primary/30 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary">
                <ShieldCheck className="h-3 w-3 text-primary" />
                On-chain verified
              </Badge>
            </StaggerItem>

            {/* Headline */}
            <StaggerItem>
              <h1 className="text-balance text-5xl font-bold text-foreground sm:text-6xl lg:text-[3.25rem] xl:text-6xl">
                Own property{" "}
                <br className="hidden sm:block" />
                on the{" "}
                <span className="text-primary">blockchain.</span>
                <br className="hidden sm:block" />
                No middlemen.
              </h1>
            </StaggerItem>

            {/* Subheading */}
            <StaggerItem>
              <p className="mt-5 max-w-sm text-[0.9rem] leading-relaxed text-muted-foreground">
                A decentralized marketplace to buy, rent, and sell real estate.
                Verify title deeds and close deals transparently — all on-chain.
              </p>
            </StaggerItem>

            {/* CTAs */}
            <StaggerItem>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  className="gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-600"
                  asChild
                >
                  <Link href="/marketplace">
                    Explore listings
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <WalletConnect size="lg" variant="outline" />
              </div>
            </StaggerItem>
          </StaggerContainer>

          {/* Right column — Property card */}
         <FadeIn delay={0.15}>
            <FloatingElement delay={0} duration={6} y={10}>
              <div className="overflow-hidden rounded-2xl border border-border bg-card">

                {/* Map area */}
                <div className="relative flex h-44 items-center justify-center overflow-hidden bg-muted/40">
                  {/* Grid overlay + Vector Map Background */}
                  <div className="absolute inset-0 opacity-40 dark:opacity-30">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "linear-gradient(hsl(var(--border)/0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)/0.3) 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                      }}
                    />
                  </div>
                  <svg
                    className="absolute inset-0 h-full w-full opacity-60 dark:opacity-40"
                    viewBox="0 0 400 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid slice"
                  >
                    {/* Water Body (River/Coastline) */}
                    <path
                      d="M -10 130 C 100 150 150 70 280 90 C 350 100 380 70 410 80 L 410 210 L -10 210 Z"
                      fill="hsl(var(--primary)/0.08)"
                    />
                    <path
                      d="M -10 130 C 100 150 150 70 280 90 C 350 100 380 70 410 80"
                      stroke="hsl(var(--primary)/0.15)"
                      strokeWidth="2"
                    />

                    {/* Parks / Green spaces */}
                    <path
                      d="M 20 20 H 100 V 70 C 70 80 40 70 20 50 Z"
                      fill="rgba(16,185,129,0.06)"
                    />
                    <path
                      d="M 310 10 C 340 5 370 25 380 60 C 340 70 310 50 310 10 Z"
                      fill="rgba(16,185,129,0.06)"
                    />

                    {/* Main roads */}
                    <path
                      d="M -20 60 H 420"
                      stroke="hsl(var(--border))"
                      strokeWidth="3.5"
                    />
                    <path
                      d="M 160 -10 V 220"
                      stroke="hsl(var(--border))"
                      strokeWidth="3.5"
                    />
                    <path
                      d="M 280 -10 L 170 220"
                      stroke="hsl(var(--border))"
                      strokeWidth="2.5"
                    />
                    
                    {/* Secondary streets */}
                    <path
                      d="M 40 -10 V 210 M 90 -10 V 210 M 220 -10 V 210 M 340 -10 V 210"
                      stroke="hsl(var(--border)/0.4)"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M -10 110 H 410 M -10 160 H 410 M -10 20 H 410"
                      stroke="hsl(var(--border)/0.4)"
                      strokeWidth="1.5"
                    />
                    
                    {/* Highlighted route leading to pin */}
                    <path
                      d="M 90 160 H 160 V 110 H 200"
                      stroke="hsl(var(--primary)/0.35)"
                      strokeWidth="3"
                      strokeDasharray="4 4"
                    />
                  </svg>
                  {/* Concentric radar rings from the pin */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="h-16 w-16 animate-pulse rounded-full border border-primary/20 bg-primary/5" />
                    <div className="absolute h-32 w-32 animate-pulse rounded-full border border-primary/10" style={{ animationDuration: "3s" }} />
                    <div className="absolute h-48 w-48 animate-pulse rounded-full border border-primary/5" style={{ animationDuration: "4s" }} />
                  </div>
                  {/* Pin */}
                  <div className="relative z-10 -translate-y-2 text-indigo-500">
                    <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current drop-shadow-sm">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                  </div>
                  {/* Coordinates */}
                  <span className="absolute bottom-2.5 left-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    42.3601° N, 71.0589° W
                  </span>
                  {/* On-chain ID */}
                  <span className="absolute right-3 top-2.5 rounded border border-border bg-background/80 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground backdrop-blur-sm">
                    ID #0x4f2a…c81
                  </span>
                </div>

                {/* Card body */}
                <div className="p-4">
                  {/* Price + status row */}
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <span className="font-[Space_Grotesk,var(--font-sans)] text-2xl font-bold tracking-tight text-foreground">
                        $2,095
                      </span>
                      <span className="ml-1 text-xs font-medium text-muted-foreground">/mo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full border border-indigo-300/40 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                        For rent
                      </span>
                      <button
                        className="flex h-7 w-7 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:border-red-300/50 hover:text-red-500"
                        aria-label="Save to wishlist"
                      >
                        <Heart className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Address */}
                  <p className="mb-3.5 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">200 Shady Ln</span>, Templeton, MA 01468
                  </p>

                  {/* Specs grid */}
                  <div className="grid grid-cols-3 divide-x divide-border overflow-hidden rounded-lg border border-border">
                    {[
                      { icon: BedDouble, value: "3", label: "Beds" },
                      { icon: Bath, value: "2", label: "Baths" },
                      { icon: Ruler, value: "85 m²", label: "Area" },
                    ].map(({ icon: Icon, value, label }) => (
                      <div key={label} className="flex flex-col items-center py-2.5 text-center">
                        <Icon className="mb-1 h-3.5 w-3.5 text-indigo-500" />
                        <span className="text-[13px] font-bold text-foreground">{value}</span>
                        <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="mt-3.5 flex items-center border-t border-border pt-3">
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-green-500" />
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Title deed verified on-chain
                    </span>
                  </div>
                </div>

              </div>
            </FloatingElement>
          </FadeIn>

        </div>
      </div>
    </section>
  );
}