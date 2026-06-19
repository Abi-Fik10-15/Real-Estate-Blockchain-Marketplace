"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion";
import { useProperties } from "@/hooks/use-properties";
import { BUYER_MARKETPLACE_PATH } from "@/lib/routes";
import { formatCurrency } from "@/lib/utils";

export function Showcase() {
  const { data: properties = [], isLoading } = useProperties({ status: "active" });
  const featured = properties.filter((p) => p.featured).slice(0, 4);
  const display = featured.length > 0 ? featured : properties.slice(0, 4);

  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />
        <div className="glow-orb left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 bg-[hsl(221,83%,53%)] opacity-[0.05]" />
      </div>

      <div className="container">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <Badge
            variant="info"
            className="mb-5 border border-accent/20 px-4 py-1.5"
          >
            <BadgeCheck className="h-3.5 w-3.5" /> Blockchain Verified
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Featured <span className="text-gradient">Properties</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Explore our hand-picked selection of premium blockchain-verified
            real estate opportunities.
          </p>
        </FadeIn>

        {isLoading ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] w-full rounded-2xl" />
            ))}
          </div>
        ) : display.length === 0 ? (
          <p className="mt-12 text-center text-muted-foreground">
            No active listings yet. Register as an owner to list the first property.
          </p>
        ) : (
          <StaggerContainer className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {display.map((p) => (
              <StaggerItem key={p.id}>
                <Link
                  href={`/property/${p.id}`}
                  className="group block overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={p.images[0]}
                      alt={p.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <Badge className="absolute left-3 top-3" variant="verified">
                      <BadgeCheck className="h-3 w-3" /> Verified
                    </Badge>
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-lg font-bold text-white">{formatCurrency(p.price)}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {p.title}
                    </h3>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {p.location.city}
                    </p>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        <FadeIn className="mt-10 flex justify-center">
          <Button variant="hero" size="lg" asChild>
            <Link href={`/login?redirect=${encodeURIComponent(BUYER_MARKETPLACE_PATH)}`}>
              Browse all properties <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </FadeIn>
      </div>
    </section>
  );
}
