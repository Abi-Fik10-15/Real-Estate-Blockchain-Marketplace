"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import type { PropertyFilters, PropertyType, ListingStatus } from "@/types";

const TYPES: (PropertyType | "all")[] = [
  "all",
  "Apartment",
  "House",
  "Villa",
  "Condo",
  "Townhouse",
  "Commercial",
];

const STATUSES: (ListingStatus | "all")[] = [
  "all",
  "active",
  "pending",
  "sold",
  "rented",
];

export function PropertyFiltersPanel({
  filters,
  onChange,
  onReset,
  hideStatusFilter = false,
}: {
  filters: PropertyFilters;
  onChange: (patch: Partial<PropertyFilters>) => void;
  onReset: () => void;
  hideStatusFilter?: boolean;
}) {
  const isModified =
    filters.location !== "" ||
    filters.type !== "all" ||
    filters.listingType !== "all" ||
    filters.maxPrice !== DEFAULT_FILTERS.maxPrice ||
    filters.bedrooms !== 0 ||
    filters.bathrooms !== 0;

  return (
    <div className="sticky top-20 rounded-xl border border-border/60 bg-card text-card-foreground shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Filters
        </h3>
        {isModified && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        )}
      </div>

      <div className="space-y-5 p-4">
        {/* Location */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Location
          </Label>
          <Input
            placeholder="City or country"
            value={filters.location}
            onChange={(e) => onChange({ location: e.target.value })}
            className="h-9 text-sm"
          />
        </div>

        <Separator />

        {/* Price range */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Max price
            </Label>
            <span className="text-xs font-semibold text-foreground">
              {formatCurrency(filters.maxPrice)}
            </span>
          </div>
          <Slider
            min={0}
            max={2_000_000}
            step={50_000}
            value={[filters.maxPrice]}
            onValueChange={([v]) => onChange({ maxPrice: v })}
            className="py-1"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>$0</span>
            <span>$2M</span>
          </div>
        </div>

        <Separator />

        {/* Listing type */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Listing type
          </Label>
          <Select
            value={filters.listingType}
            onValueChange={(v) =>
              onChange({ listingType: v as PropertyFilters["listingType"] })
            }
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="sale">For Sale</SelectItem>
              <SelectItem value="rent">For Rent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Property type */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Property type
          </Label>
          <Select
            value={filters.type}
            onValueChange={(v) =>
              onChange({ type: v as PropertyType | "all" })
            }
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t === "all" ? "All types" : t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Bedrooms + bathrooms */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Beds
            </Label>
            <Select
              value={String(filters.bedrooms)}
              onValueChange={(v) => onChange({ bedrooms: Number(v) })}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any</SelectItem>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}+
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Baths
            </Label>
            <Select
              value={String(filters.bathrooms)}
              onValueChange={(v) => onChange({ bathrooms: Number(v) })}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any</SelectItem>
                {[1, 2, 3, 4].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}+
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Status (admin views) */}
        {!hideStatusFilter && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Listing status
              </Label>
              <Select
                value={filters.status}
                onValueChange={(v) =>
                  onChange({ status: v as ListingStatus | "all" })
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s === "all"
                        ? "All statuses"
                        : s.charAt(0).toUpperCase() + s.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export const DEFAULT_FILTERS: PropertyFilters = {
  search: "",
  type: "all",
  minPrice: 0,
  maxPrice: 2_000_000,
  bedrooms: 0,
  bathrooms: 0,
  location: "",
  status: "all",
  listingType: "all",
  sort: "newest",
};

/** Buyer marketplace only shows live listings available to browse. */
export const BUYER_MARKETPLACE_FILTERS: PropertyFilters = {
  ...DEFAULT_FILTERS,
  status: "active",
};
