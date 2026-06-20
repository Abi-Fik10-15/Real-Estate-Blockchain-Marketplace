"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Bath,
  BedDouble,
  Heart,
  MapPin,
  Maximize,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import { useSavedStore } from "@/store/saved-store";
import type { Property } from "@/types";

interface PropertyCardProps {
  property: Property;
  view?: "grid" | "list";
  /** Pass true for the first few cards visible above the fold */
  priority?: boolean;
  /** Show link to on-chain verification (saved properties page) */
  showVerifyLink?: boolean;
  /** Called after save toggle with the new saved state */
  onSaveToggle?: (saved: boolean) => void;
}

export function PropertyCard({
  property,
  view = "grid",
  priority = false,
  showVerifyLink = false,
  onSaveToggle,
}: PropertyCardProps) {
  const saved = useSavedStore((s) => s.savedIds.includes(property.id));
  const toggleSaved = useSavedStore((s) => s.toggleSaved);
  const verified = property.verification.status === "verified";

  const priceLabel =
    property.listingType === "rent"
      ? `${formatCurrency(property.price)}/mo`
      : formatCurrency(property.price);

  const isList = view === "list";

  return (
    <Card
      className={cn(
        "group overflow-hidden border-border/60 transition-shadow hover:shadow-md",
        isList && "flex flex-col sm:flex-row",
      )}
    >
      {/* ── Image ─────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-muted",
          isList ? "h-48 sm:h-auto sm:w-60" : "aspect-[16/10]",
        )}
      >
        <Image
          src={property.images[0] ?? "/placeholder-property.jpg"}
          alt={property.title}
          fill
          sizes={
            isList
              ? "(max-width: 640px) 100vw, 240px"
              : "(max-width: 768px) 100vw, 33vw"
          }
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />

        {/* Top-left badges */}
        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          <Badge
            variant={property.listingType === "rent" ? "secondary" : "default"}
            className="text-[10px] shadow-sm"
          >
            For {property.listingType === "rent" ? "Rent" : "Sale"}
          </Badge>
          {verified && (
            <Badge
              variant="outline"
              className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
            >
              <BadgeCheck className="mr-1 h-3 w-3" />
              Verified
            </Badge>
          )}
        </div>

        {/* Save button */}
        <button
          type="button"
          aria-label={saved ? "Unsave property" : "Save property"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const nextSaved = !saved;
            void toggleSaved(property.id);
            onSaveToggle?.(nextSaved);
          }}
          className={cn(
            "absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full",
            "bg-background/80 backdrop-blur-sm shadow-sm transition-all",
            "hover:scale-110 hover:bg-background",
            saved && "text-rose-500",
          )}
        >
          <Heart
            className={cn("h-4 w-4", saved && "fill-rose-500 text-rose-500")}
          />
        </button>
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <CardContent
        className={cn(
          "flex flex-1 flex-col gap-3 p-4",
          isList && "justify-between",
        )}
      >
        {/* Title + price */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
              {property.title}
            </h3>
            <p className="shrink-0 text-base font-bold text-primary">
              {priceLabel}
            </p>
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            {property.location.city}, {property.location.country}
          </p>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" />
              {property.bedrooms} bed
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" />
              {property.bathrooms} bath
            </span>
          )}
          {property.area > 0 && (
            <span className="flex items-center gap-1">
              <Maximize className="h-3.5 w-3.5" />
              {property.area.toLocaleString()} ft²
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-border/40 pt-2.5">
          {property.chainId ? (
            <Badge
              variant="outline"
              className="font-mono text-[9px] text-muted-foreground"
            >
              {property.chainId}
            </Badge>
          ) : (
            <span className="text-[10px] text-muted-foreground/50">
              Off-chain
            </span>
          )}
          <div className="flex items-center gap-2">
            {showVerifyLink && property.chainId && (
              <Link
                href={`/dashboard/buyer/verification?id=${property.chainId}`}
                className={cn(
                  "inline-flex h-7 items-center rounded-md border border-border px-3",
                  "text-xs font-medium text-foreground transition-colors",
                  "hover:bg-muted",
                )}
              >
                Verify
              </Link>
            )}
            <Link
              href={`/dashboard/buyer/marketplace/property/${property.id}`}
              className={cn(
                "inline-flex h-7 items-center rounded-md border border-border px-3",
                "text-xs font-medium text-foreground transition-colors",
                "hover:bg-primary hover:text-primary-foreground hover:border-primary",
              )}
            >
              View
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function PropertyCardSkeleton({
  view = "grid",
}: {
  view?: "grid" | "list";
}) {
  const isList = view === "list";
  return (
    <Card
      className={cn(
        "overflow-hidden border-border/60",
        isList && "flex flex-col sm:flex-row",
      )}
    >
      <div
        className={cn(
          "animate-pulse bg-muted",
          isList ? "h-48 sm:h-auto sm:w-60" : "aspect-[16/10]",
        )}
      />
      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex gap-3">
          <div className="h-3 w-12 animate-pulse rounded bg-muted" />
          <div className="h-3 w-12 animate-pulse rounded bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        </div>
        <div className="mt-auto flex justify-between border-t border-border/40 pt-2.5">
          <div className="h-5 w-20 animate-pulse rounded bg-muted" />
          <div className="h-7 w-14 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}
