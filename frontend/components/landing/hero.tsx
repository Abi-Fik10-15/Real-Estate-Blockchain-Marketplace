import Image from "next/image";
import { BadgeCheck, MapPin, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HeroCtaButtons } from "@/components/landing/hero-cta-buttons";
import { HeroListingsPreview } from "@/components/landing/hero-listings-preview";

const HERO_IMAGE = "/hero-image.jpg";

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "On-chain verified" },
  { icon: BadgeCheck, label: "12,500+ properties" },
  { icon: MapPin, label: "Global marketplace" },
] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/50 bg-background">
      {/* Grid pattern — full width on mobile, left 3/4 on desktop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.04] lg:right-1/4 [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:32px_32px]"
      />

      {/* Top-left accent line */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 -z-10 h-px w-1/3 bg-gradient-to-r from-transparent via-primary/30 to-transparent"
      />

      {/* Rightmost quarter — property image behind the card (desktop only) */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-1/4 lg:block">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          sizes="25vw"
          quality={75}
          fetchPriority="low"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
      </div>

      <div className="container relative z-10 mx-auto px-6 lg:px-8">
        <div className="grid min-h-[82vh] gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Left — text */}
          <div className="py-16 lg:py-0">
            <Badge
              variant="outline"
              className="mb-6 border-primary/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary"
            >
              Blockchain-verified real estate
            </Badge>

            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              Own Property With
              <br />
              <span className="text-primary">Complete Trust</span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
              Verify ownership, manage properties, authorize agents, and transfer
              real estate assets transparently with blockchain-grade security.
            </p>

            <HeroCtaButtons />

            <div className="mt-10 flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
              {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-2.5 py-1"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" aria-hidden />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <HeroListingsPreview />
        </div>
      </div>
    </section>
  );
}
