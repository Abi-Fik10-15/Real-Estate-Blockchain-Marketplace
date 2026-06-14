"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Bath, BedDouble, Heart, MapPin, Maximize } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { useSavedStore } from "@/store/saved-store";
import type { Property } from "@/types";

export function PropertyCard({ property, view = "grid" }: { property: Property; view?: "grid" | "list" }) {
  const { isSaved, toggleSaved } = useSavedStore();
  const saved = isSaved(property.id);
  const verified = property.verification.status === "verified";

  const priceLabel =
    property.listingType === "rent"
      ? `${formatCurrency(property.price)}/mo`
      : formatCurrency(property.price);

  return (
    <Card
      className={cn(
        "group overflow-hidden transition-all hover:-translate-y-1 hover:shadow-glow",
        view === "list" && "sm:flex"
      )}
    >
      <div className={cn("relative", view === "list" ? "sm:w-72 sm:shrink-0" : "")}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge variant={property.listingType === "rent" ? "info" : "default"}>
            For {property.listingType === "rent" ? "Rent" : "Sale"}
          </Badge>
          {verified && (
            <Badge variant="verified">
              <BadgeCheck className="h-3 w-3" /> Verified
            </Badge>
          )}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleSaved(property.id);
          }}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/80 backdrop-blur transition-colors hover:bg-background"
          aria-label="Save property"
        >
          <Heart className={cn("h-4 w-4", saved && "fill-destructive text-destructive")} />
        </button>
      </div>

      <CardContent className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-tight">{property.title}</h3>
          <p className="shrink-0 text-lg font-bold text-primary">{priceLabel}</p>
        </div>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {property.location.city}, {property.location.country}
        </p>

        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BedDouble className="h-4 w-4" /> {property.bedrooms}
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="h-4 w-4" /> {property.bathrooms}
          </span>
          <span className="flex items-center gap-1.5">
            <Maximize className="h-4 w-4" /> {property.area.toLocaleString()} ft²
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 pt-2">
          <Badge variant="outline" className="font-mono text-[10px]">
            {property.chainId}
          </Badge>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/property/${property.id}`}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function PropertyCardSkeleton({ view = "grid" }: { view?: "grid" | "list" }) {
  return (
    <Card className={cn("overflow-hidden", view === "list" && "sm:flex")}>
      <div className={cn("skeleton aspect-[4/3]", view === "list" ? "sm:w-72" : "")} />
      <CardContent className="flex-1 space-y-3 p-5">
        <div className="skeleton h-5 w-2/3" />
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-9 w-full" />
      </CardContent>
    </Card>
  );
}
