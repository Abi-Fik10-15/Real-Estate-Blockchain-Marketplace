"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion";
import { MOCK_PROPERTIES } from "@/services/mock-data";
import { formatCurrency } from "@/lib/utils";

const FEATURED = MOCK_PROPERTIES.filter((p) => p.featured).slice(0, 4);

export function Showcase() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      {/* Background */}
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

        <StaggerContainer className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED.map((property) => {
            const verified = property.verification.status === "verified";
            const priceLabel =
              property.listingType === "rent"
                ? `${formatCurrency(property.price)}/mo`
                : formatCurrency(property.price);

            return (
              <StaggerItem key={property.id}>
                <Link
                  href={`/property/${property.id}`}
                  className="group block h-full overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-border hover:shadow-card-hover"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                    {/* Badges */}
                    <div className="absolute left-3 top-3 flex gap-2">
                      <Badge
                        variant={
                          property.listingType === "rent" ? "info" : "default"
                        }
                      >
                        For {property.listingType === "rent" ? "Rent" : "Sale"}
                      </Badge>
                      {verified && (
                        <Badge variant="verified">
                          <BadgeCheck className="h-3 w-3" /> Verified
                        </Badge>
                      )}
                    </div>

                    {/* Price overlay */}
                    <div className="absolute bottom-3 left-3">
                      <p className="text-xl font-bold text-white drop-shadow-md">
                        {priceLabel}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-semibold leading-tight">
                      {property.title}
                    </h3>
                    <p className="mt-1.5 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />{" "}
                      {property.location.city}, {property.location.country}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {property.chainId}
                      </Badge>
                      <span className="text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        View Details →
                      </span>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        <FadeIn delay={0.4} className="mt-12 text-center">
          <Button variant="outline" size="lg" asChild>
            <Link href="/marketplace">
              View All Properties <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </FadeIn>
      </div>
    </section>
  );
}
