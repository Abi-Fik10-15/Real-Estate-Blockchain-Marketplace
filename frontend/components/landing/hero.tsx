"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  FileCheck2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WalletConnect } from "@/components/wallet/wallet-connect";
import {
  FadeIn,
  FloatingElement,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion";
import heroImg from "@/public/hero-illustration.png";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="glow-orb left-1/4 top-0 h-[500px] w-[500px] bg-[hsl(221,83%,53%)] opacity-[0.12]" />
        <div className="glow-orb right-1/4 top-20 h-[400px] w-[400px] bg-[hsl(199,89%,48%)] opacity-[0.10]" />
        <div className="glow-orb left-1/2 top-40 h-[350px] w-[350px] bg-[hsl(262,83%,58%)] opacity-[0.08]" />
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>

      <div className="container grid items-center gap-12 py-20 lg:grid-cols-2 lg:gap-16 lg:py-28">
        {/* Left column */}
        <StaggerContainer className="flex flex-col">
          <StaggerItem>
            <Badge
              variant="info"
              className="mb-6 w-fit border border-accent/20 px-4 py-1.5 text-sm"
            >
              <Sparkles className="h-3.5 w-3.5" /> Powered by blockchain
              verification
            </Badge>
          </StaggerItem>

          <StaggerItem>
            <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
              Secure Real Estate Ownership{" "}
              <span className="text-gradient-animated">
                Powered by Blockchain
              </span>
            </h1>
          </StaggerItem>

          <StaggerItem>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Verify ownership, manage properties, authorize agents, and
              transfer real estate assets transparently.
            </p>
          </StaggerItem>

          <StaggerItem>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button variant="hero" size="lg" asChild>
                <Link href="/marketplace">
                  Explore Properties <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <WalletConnect size="lg" />
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-success" />
              Immutable, tamper-proof title history for every property.
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* Right column — image + floating cards */}
        <FadeIn delay={0.3} className="relative">
          {/* Glow behind the image */}
          <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-brand opacity-15 blur-3xl" />

          {/* Main hero image */}
          <div className="relative">
            <Image
              src={heroImg}
              alt="Blockchain real estate concept illustration"
              priority
              className="w-full rounded-[2rem] border border-border/60 shadow-glow-lg"
            />

            {/* Floating card — Ownership */}
            <FloatingElement
              delay={0}
              duration={7}
              y={10}
              className="absolute -left-4 top-8 z-10 hidden sm:block"
            >
              <div className="glass-card flex items-center gap-3 px-4 py-3 shadow-glass">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-success/15 text-success">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Verified Owner</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    0xA4B7...D81F
                  </p>
                </div>
              </div>
            </FloatingElement>

            {/* Floating card — Transaction */}
            <FloatingElement
              delay={1.5}
              duration={8}
              y={14}
              className="absolute -right-4 bottom-20 z-10 hidden sm:block"
            >
              <div className="glass-card flex items-center gap-3 px-4 py-3 shadow-glass">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                  <FileCheck2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Transfer Complete</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    Tx: 0x7f3a...9c2e
                  </p>
                </div>
              </div>
            </FloatingElement>

            {/* Floating card — Verification accuracy */}
            <FloatingElement
              delay={3}
              duration={9}
              y={8}
              className="absolute -bottom-4 left-1/2 z-10 hidden -translate-x-1/2 sm:block"
            >
              <div className="glass-card flex items-center gap-3 px-5 py-3 shadow-glass">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold">99.9% Accuracy</p>
                  <p className="text-[10px] text-muted-foreground">
                    Verification Engine
                  </p>
                </div>
              </div>
            </FloatingElement>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
