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
  MapPin,
  Building,
  Key,
  DollarSign,
  Search,
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
    <section className="relative overflow-hidden bg-background border-b border-border/40 py-8 lg:py-12">
      {/* Background glow orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="glow-orb left-1/4 top-0 h-[400px] w-[400px] bg-primary/10 opacity-70" />
        <div className="glow-orb right-1/4 top-10 h-[300px] w-[300px] bg-accent/80 opacity-40" />
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>

      <div className="container max-w-[1280px]">
        {/* Main Hero Elements Grid - max 80vh container */}
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12 lg:min-h-[50vh] lg:max-h-[60vh]">
          {/* Left column */}
          <StaggerContainer className="flex flex-col justify-center">
            <StaggerItem>
              <Badge
                variant="info"
                className="mb-4 w-fit border border-accent/20 px-3 py-1 text-xs"
              >
                <Sparkles className="h-3 w-3" /> Powered by Ethereum Verification
              </Badge>
            </StaggerItem>

            <StaggerItem>
              <h1 className="text-balance text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl text-foreground">
                Secure Real Estate Ownership{" "}
                <span className="text-gradient">
                  on Blockchain
                </span>
              </h1>
            </StaggerItem>

            <StaggerItem>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                Verify ownership history, manage verified listings, authorize licensed agents, and complete property transfers transparently on-chain.
              </p>
            </StaggerItem>

            <StaggerItem>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row items-center">
                <Button size="default" className="w-full sm:w-auto h-10 px-5 text-sm bg-primary text-primary-foreground hover:bg-primary/95 shadow-soft" asChild>
                  <Link href="/marketplace">
                    Explore Properties <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
                <WalletConnect size="default" className="w-full sm:w-auto h-10 text-sm" />
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-success" />
                Immutable, blockchain-verified title history for every listing.
              </div>
            </StaggerItem>
          </StaggerContainer>

          {/* Right column — image + floating cards */}
          <FadeIn delay={0.2} className="relative flex justify-center items-center">
            {/* Glow behind the image */}
            <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-brand opacity-10 blur-2xl" />

            {/* Main hero image wrapper */}
            <div className="relative w-full max-w-[480px] aspect-[4/3] rounded-2xl border border-border/60 shadow-glow overflow-hidden">
              <Image
                src={heroImg}
                alt="Blockchain real estate concept illustration"
                priority
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />

              {/* Ownership Verification Badge */}
              <div className="absolute right-3 top-3 z-20 flex items-center gap-1 bg-success/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-soft">
                <BadgeCheck className="h-3.5 w-3.5" /> Title Verified
              </div>

              {/* Floating card — Ownership */}
              <FloatingElement
                delay={0}
                duration={6}
                y={6}
                className="absolute left-3 top-6 z-10 hidden sm:block"
              >
                <div className="glass-card flex items-center gap-2.5 px-3 py-2 shadow-glass">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-success/15 text-success">
                    <BadgeCheck className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold">Verified Owner</p>
                    <p className="font-mono text-[9px] text-muted-foreground">
                      0xA4B7...D81F
                    </p>
                  </div>
                </div>
              </FloatingElement>

              {/* Floating card — Transaction */}
              <FloatingElement
                delay={1.5}
                duration={7}
                y={8}
                className="absolute right-3 bottom-12 z-10 hidden sm:block"
              >
                <div className="glass-card flex items-center gap-2.5 px-3 py-2 shadow-glass">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
                    <FileCheck2 className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold">Transfer Complete</p>
                    <p className="font-mono text-[9px] text-muted-foreground">
                      Tx: 0x7f3a...9c2e
                    </p>
                  </div>
                </div>
              </FloatingElement>
            </div>
          </FadeIn>
        </div>

        {/* Search Bar - Overlapping bottom of Hero section */}
        <FadeIn delay={0.3} className="mt-8 lg:mt-10">
          <div className="w-full max-w-[1000px] mx-auto p-2 bg-card border border-border rounded-xl shadow-soft flex flex-col md:flex-row gap-2 items-center">
            {/* Location */}
            <div className="flex items-center gap-2 px-3 py-1.5 border-b md:border-b-0 md:border-r border-border/60 w-full md:w-1/3">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <input
                type="text"
                placeholder="Location (e.g. Dubai, Miami)..."
                className="bg-transparent text-xs focus:outline-none w-full text-foreground placeholder:text-muted-foreground"
              />
            </div>
            
            {/* Property Type */}
            <div className="flex items-center gap-2 px-3 py-1.5 border-b md:border-b-0 md:border-r border-border/60 w-full md:w-1/4">
              <Building className="h-4 w-4 text-primary shrink-0" />
              <select className="bg-transparent text-xs focus:outline-none w-full text-foreground font-medium cursor-pointer">
                <option value="" className="bg-card text-foreground">Property Type</option>
                <option value="apartment" className="bg-card text-foreground">Apartment</option>
                <option value="villa" className="bg-card text-foreground">Luxury Villa</option>
                <option value="commercial" className="bg-card text-foreground">Commercial</option>
                <option value="smarthome" className="bg-card text-foreground">Smart Home</option>
                <option value="resort" className="bg-card text-foreground">Resort</option>
              </select>
            </div>

            {/* Buy/Rent */}
            <div className="flex items-center gap-2 px-3 py-1.5 border-b md:border-b-0 md:border-r border-border/60 w-full md:w-1/5">
              <Key className="h-4 w-4 text-primary shrink-0" />
              <select className="bg-transparent text-xs focus:outline-none w-full text-foreground font-medium cursor-pointer">
                <option value="buy" className="bg-card text-foreground">Buy</option>
                <option value="rent" className="bg-card text-foreground">Rent</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="flex items-center gap-2 px-3 py-1.5 w-full md:w-1/4">
              <DollarSign className="h-4 w-4 text-primary shrink-0" />
              <select className="bg-transparent text-xs focus:outline-none w-full text-foreground font-medium cursor-pointer">
                <option value="" className="bg-card text-foreground">Price Range</option>
                <option value="0-500k" className="bg-card text-foreground">Under $500k</option>
                <option value="500k-1m" className="bg-card text-foreground">$500k - $1M</option>
                <option value="1m-3m" className="bg-card text-foreground">$1M - $3M</option>
                <option value="3m-5m" className="bg-card text-foreground">$3M - $5M</option>
                <option value="5m+" className="bg-card text-foreground">$5M+</option>
              </select>
            </div>

            {/* Search Button */}
            <Button size="sm" className="w-full md:w-auto h-9 px-5 shrink-0 bg-primary text-primary-foreground hover:bg-primary/95" asChild>
              <Link href="/marketplace">
                <Search className="h-3.5 w-3.5 mr-1" /> Search
              </Link>
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
