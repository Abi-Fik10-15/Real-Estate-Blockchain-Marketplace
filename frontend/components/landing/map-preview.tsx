"use client";

import Link from "next/link";
import {
  Filter,
  Globe2,
  MapPin,
  Search,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";

const REGIONS = [
  { name: "North America", properties: 3420, color: "bg-blue-500" },
  { name: "Europe", properties: 2850, color: "bg-violet-500" },
  { name: "Middle East", properties: 1960, color: "bg-amber-500" },
  { name: "Asia Pacific", properties: 2140, color: "bg-emerald-500" },
  { name: "South America", properties: 890, color: "bg-rose-500" },
  { name: "Africa", properties: 640, color: "bg-cyan-500" },
];

const FILTERS = [
  "All Properties",
  "Verified Only",
  "Residential",
  "Commercial",
];

export function MapPreview() {
  return (
    <section id="map-preview" className="relative overflow-hidden py-16 lg:py-20 border-b border-border/40">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-muted/10 to-transparent" />

      <div className="container max-w-[1280px]">
        <FadeIn className="mx-auto max-w-2xl text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Global Property <span className="text-gradient">Verification Map</span>
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Explore blockchain-verified properties worldwide with smart geographic filtering and real-time title checks.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-soft backdrop-blur-sm">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 px-5 py-3.5 bg-muted/20">
              <div className="flex items-center gap-2 rounded-lg bg-background border border-border/40 px-3 py-1.5 w-full sm:w-auto">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Search properties...
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                {FILTERS.map((f, i) => (
                  <button
                    key={f}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                      i === 0
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Map mockup */}
            <div className="relative aspect-[16/7] w-full min-h-[300px] bg-gradient-to-br from-slate-100 via-blue-50/50 to-slate-100 dark:from-slate-900 dark:via-blue-950/30 dark:to-slate-900">
              {/* Grid overlay */}
              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(100,100,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(100,100,255,0.3) 1px, transparent 1px)",
                  backgroundSize: "60px 60px",
                }}
              />

              {/* Map pins with pulse */}
              {[
                { top: "30%", left: "22%", label: "New York" },
                { top: "25%", left: "48%", label: "London" },
                { top: "40%", left: "60%", label: "Dubai" },
                { top: "35%", left: "75%", label: "Singapore" },
                { top: "45%", left: "15%", label: "Miami" },
                { top: "28%", left: "55%", label: "Barcelona" },
                { top: "55%", left: "72%", label: "Bali" },
                { top: "32%", left: "82%", label: "Tokyo" },
              ].map((pin) => (
                <div
                  key={pin.label}
                  className="group absolute cursor-pointer"
                  style={{ top: pin.top, left: pin.left }}
                >
                  <div className="absolute -inset-1.5 animate-ping rounded-full bg-primary/20" />
                  <div className="relative grid h-5 w-5 place-items-center rounded-full bg-gradient-brand text-white shadow-glow transition-transform group-hover:scale-125">
                    <MapPin className="h-2.5 w-2.5" />
                  </div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-card border border-border px-2 py-0.5 text-[10px] font-bold shadow-soft opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap z-10">
                    {pin.label}
                    <ShieldCheck className="ml-1 inline h-3 w-3 text-success" />
                  </div>
                </div>
              ))}

              {/* Globe indicator */}
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-card/90 border border-border/50 px-3 py-1.5 shadow-soft backdrop-blur-sm z-10">
                <Globe2 className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] font-semibold text-foreground">
                  12,500+ Verified Properties Worldwide
                </span>
              </div>
            </div>

            {/* Region stats */}
            <div className="grid grid-cols-2 gap-0 border-t border-border/50 sm:grid-cols-3 lg:grid-cols-6 bg-muted/10">
              {REGIONS.map((r) => (
                <div
                  key={r.name}
                  className="group flex items-center gap-2.5 border-r border-border/50 px-4 py-3 transition-colors last:border-r-0 hover:bg-muted/30"
                >
                  <span className={`h-2 w-2 rounded-full ${r.color} transition-transform group-hover:scale-125`} />
                  <div>
                    <p className="text-[11px] font-bold text-foreground">{r.name}</p>
                    <p className="text-[9px] text-muted-foreground">
                      {r.properties.toLocaleString()} properties
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Centered Open Full Marketplace CTA */}
        <FadeIn delay={0.3} className="mt-8 flex justify-center">
          <Button size="default" className="bg-primary text-primary-foreground hover:bg-primary/95 shadow-soft" asChild>
            <Link href="/marketplace">
              Open Full Marketplace <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          </Button>
        </FadeIn>
      </div>
    </section>
  );
}
