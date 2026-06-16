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
        "group overflow-hidden transition-all",
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
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge variant={property.listingType === "rent" ? "secondary" : "default"}>
            For {property.listingType === "rent" ? "Rent" : "Sale"}
          </Badge>
          {verified && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <BadgeCheck className="h-3 w-3 mr-1" /> Verified
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute right-3 top-3 h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm",
            "hover:bg-background",
            saved && "text-destructive hover:text-destructive"
          )}
          onClick={(e) => {
            e.preventDefault();
            toggleSaved(property.id);
          }}
          aria-label="Save property"
        >
          <Heart className={cn("h-4 w-4", saved && "fill-current")} />
        </Button>
      </div>

      <CardContent className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium leading-tight line-clamp-2">{property.title}</h3>
          <p className="shrink-0 text-base font-semibold text-primary">{priceLabel}</p>
        </div>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" /> {property.location.city}, {property.location.country}
        </p>

        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BedDouble className="h-3.5 w-3.5" /> {property.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-3.5 w-3.5" /> {property.bathrooms}
          </span>
          <span className="flex items-center gap-1">
            <Maximize className="h-3.5 w-3.5" /> {property.area.toLocaleString()} ft²
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 pt-2">
          <Badge variant="outline" className="font-mono text-[9px] h-5">
            {property.chainId}
          </Badge>
          <Button size="sm" variant="outline" asChild className="h-7 text-xs">
            <Link href={`/dashboard/buyer/marketplace/property/${property.id}`}>View</Link>

          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function PropertyCardSkeleton({ view = "grid" }: { view?: "grid" | "list" }) {
  return (
    <Card className={cn("overflow-hidden border-border/60", view === "list" && "sm:flex")}>
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
