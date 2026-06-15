"use client";

import {
  Filter,
  Globe2,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";

const REGIONS = [
  { name: "North America", properties: 3420, dot: "bg-primary" },
  { name: "Europe",        properties: 2850, dot: "bg-violet-500" },
  { name: "Middle East",   properties: 1960, dot: "bg-amber-500" },
  { name: "Asia Pacific",  properties: 2140, dot: "bg-emerald-500" },
  { name: "South America", properties:  890, dot: "bg-rose-500" },
  { name: "Africa",        properties:  640, dot: "bg-cyan-500" },
];

const FILTERS = [
  "All Properties",
  "Verified Only",
  "Residential",
  "Commercial",
  "Luxury",
];

const PINS = [
  { top: "30%", left: "22%", label: "New York" },
  { top: "25%", left: "48%", label: "London" },
  { top: "40%", left: "60%", label: "Dubai" },
  { top: "35%", left: "75%", label: "Singapore" },
  { top: "45%", left: "15%", label: "Miami" },
  { top: "28%", left: "55%", label: "Barcelona" },
  { top: "55%", left: "72%", label: "Bali" },
  { top: "32%", left: "82%", label: "Tokyo" },
];

export function MapPreview() {
  return (
    <section id="map-preview" className="border-b border-border/50 py-16 lg:py-20 bg-primary-50/20">
      <div className="container mx-auto px-6 lg:px-8">

        {/* Header */}
        <FadeIn className="mb-12 flex flex-col items-center gap-3 text-center">
          <Badge
            variant="outline"
            className="border-primary/30 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary"
          >
            Global coverage
          </Badge>
          <h2 className="max-w-2xl text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Property verification{" "}
            <span className="text-primary">across the globe</span>
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Explore blockchain-verified properties worldwide with smart
            geographic filtering and real-time ownership records.
          </p>
        </FadeIn>

        {/* Map card */}
        <FadeIn delay={0.15}>
          <div className="overflow-hidden rounded-xl border border-border bg-card">

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 border-b border-border/60 bg-muted/30 px-5 py-3.5">
              {/* Search mock */}
              <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-1.5">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Search verified properties...
                </span>
              </div>

              {/* Filter chips */}
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                {FILTERS.map((f, i) => (
                  <button
                    key={f}
                    className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition-all ${
                      i === 0
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-border/80 hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Map mockup */}
            <div className="relative aspect-[16/7] bg-muted/30">
              {/* Grid overlay */}
              <div
                className="absolute inset-0 opacity-[0.06] dark:opacity-[0.1]"
                style={{
                  backgroundImage:
                    "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
                  backgroundSize: "60px 60px",
                }}
              />

              {/* Map pins */}
              {PINS.map((pin) => (
                <div
                  key={pin.label}
                  className="group absolute cursor-pointer"
                  style={{ top: pin.top, left: pin.left }}
                >
                  {/* Pulse ring */}
                  <div className="absolute -inset-2 animate-ping rounded-full bg-primary/15" />
                  {/* Pin dot */}
                  <div className="relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary text-white shadow-sm transition-transform group-hover:scale-125">
                    <MapPin className="h-3 w-3" />
                  </div>
                  {/* Tooltip */}
                  <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm opacity-0 transition-opacity group-hover:opacity-100">
                    {pin.label}
                    <ShieldCheck className="ml-1 inline h-3 w-3 text-emerald-500" />
                  </div>
                </div>
              ))}

              {/* Stat pill */}
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-lg border border-border bg-card/90 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
                <Globe2 className="h-3.5 w-3.5 text-primary" />
                12,500+ Verified Properties Worldwide
              </div>
            </div>

            {/* Region stats bar */}
            <div className="grid grid-cols-2 divide-x divide-y divide-border/50 border-t border-border/50 sm:grid-cols-3 lg:grid-cols-6">
              {REGIONS.map((r) => (
                <div
                  key={r.name}
                  className="group flex items-center gap-2.5 px-5 py-3.5 transition-colors hover:bg-muted/40"
                >
                  <span className={`h-2 w-2 shrink-0 rounded-full ${r.dot} transition-transform group-hover:scale-150`} />
                  <div>
                    <p className="text-[11px] font-semibold text-foreground">{r.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {r.properties.toLocaleString()} properties
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
