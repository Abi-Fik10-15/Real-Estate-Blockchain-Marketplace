"use client";

import Image from "next/image";
import Link from "next/link";
import { BUYER_MARKETPLACE_PATH } from "@/lib/routes";
import { ArrowRight, BadgeCheck, Bath, Bed, MapPin, Maximize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const FEATURED_PROPERTIES = [
  {
    id: "fp-1",
    title: "Ocean View Luxury Villa",
    type: "Luxury Villa",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    price: "$2,450,000",
    location: "Dubai, UAE",
    bedrooms: 5,
    bathrooms: 4,
    area: "4,200 sqft",
    status: "For Sale",
    verified: true,
    chainId: "EST-1001",
  },
  {
    id: "fp-2",
    title: "Skyline Penthouse",
    type: "Apartment",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    price: "$1,180,000",
    location: "Miami, FL",
    bedrooms: 3,
    bathrooms: 2,
    area: "2,100 sqft",
    status: "For Sale",
    verified: true,
    chainId: "EST-1002",
  },
  {
    id: "fp-3",
    title: "Downtown Commercial Tower",
    type: "Commercial",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    price: "$8,900,000",
    location: "Singapore",
    bedrooms: 0,
    bathrooms: 8,
    area: "18,500 sqft",
    status: "For Sale",
    verified: true,
    chainId: "EST-1003",
  },
  {
    id: "fp-5",
    title: "Smart Home Residence",
    type: "Smart Home",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
    price: "$890,000",
    location: "Austin, TX",
    bedrooms: 4,
    bathrooms: 3,
    area: "3,200 sqft",
    status: "For Sale",
    verified: true,
    chainId: "EST-1005",
  },
  {
    id: "fp-6",
    title: "Beachfront Resort Villa",
    type: "Resort",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
    price: "$3,600,000",
    location: "Bali, Indonesia",
    bedrooms: 6,
    bathrooms: 5,
    area: "5,800 sqft",
    status: "For Sale",
    verified: true,
    chainId: "EST-1006",
  },
  {
    id: "fp-10",
    title: "Marina Bay Luxury Suite",
    type: "Apartment",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    price: "$3,100,000",
    location: "Singapore",
    bedrooms: 3,
    bathrooms: 3,
    area: "2,800 sqft",
    status: "For Sale",
    verified: true,
    chainId: "EST-1010",
  },
];

export function FeaturedProperties() {
  return (
    <section id="featured-properties" className="border-b border-border/50 bg-muted/20 py-20">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
              Blockchain Verified
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              Featured Properties
            </h2>
          </div>
          <Button variant="ghost" size="sm" className="hidden gap-1.5 text-xs sm:flex" asChild>
            <Link href={`/login?redirect=${encodeURIComponent(BUYER_MARKETPLACE_PATH)}`}>
              View all verified properties <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_PROPERTIES.map((property, index) => (
            <Link
              key={property.id}
              href={`/login?redirect=${encodeURIComponent(BUYER_MARKETPLACE_PATH)}`}
              aria-label={`View details for ${property.title} in ${property.location} — ${property.price}`}
              className="group overflow-hidden rounded-xl border border-border/80 bg-background transition-colors hover:border-border"
            >
              {/* Image */}
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={property.image}
                  alt={`${property.title} — ${property.type} in ${property.location}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={index === 0}
                  loading={index === 0 ? undefined : "lazy"}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Status badge only — top-left */}
                <div className="absolute left-3 top-3 flex items-center gap-1.5">
                  <span className="rounded-md border border-border/60 bg-background/90 px-2 py-0.5 text-[10px] font-semibold text-foreground backdrop-blur-sm">
                    {property.status}
                  </span>
                  {property.verified && (
                    <span className="flex items-center gap-0.5 rounded-md border border-primary/30 bg-background/90 px-2 py-0.5 text-[10px] font-semibold text-primary backdrop-blur-sm">
                      <BadgeCheck className="h-3 w-3" /> Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-foreground">{property.title}</h3>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {property.location}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-primary">{property.price}</p>
                </div>

                <div className="mt-3 flex items-center gap-3 border-t border-border/50 pt-3 text-xs text-muted-foreground">
                  {property.bedrooms > 0 && (
                    <span className="flex items-center gap-1">
                      <Bed className="h-3.5 w-3.5" />
                      {property.bedrooms} bd
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Bath className="h-3.5 w-3.5" />
                    {property.bathrooms} ba
                  </span>
                  <span className="flex items-center gap-1">
                    <Maximize2 className="h-3.5 w-3.5" />
                    {property.area}
                  </span>
                  <Badge variant="outline" className="ml-auto font-mono text-[10px]">
                    {property.chainId}
                  </Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center sm:hidden">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/login?redirect=${encodeURIComponent(BUYER_MARKETPLACE_PATH)}`}>
              Browse all verified properties <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
