"use client";

import { SlidersHorizontal, X } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
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

const STATUSES: (ListingStatus | "all")[] = ["all", "active", "pending", "sold", "rented"];

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
  return (
    <Card className="lg:sticky lg:top-20">
      <CardContent className="space-y-5 p-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 font-medium">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </h3>
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="h-3.5 w-3.5" /> Reset
          </Button>
        </div>

        <div className="space-y-1.5">
          <Label>Location</Label>
          <Input
            placeholder="City or country"
            value={filters.location}
            onChange={(e) => onChange({ location: e.target.value })}
          />
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Label>Price range</Label>
            <span className="text-xs text-muted-foreground">
              up to {formatCurrency(filters.maxPrice)}
            </span>
          </div>
          <Slider
            min={0}
            max={2000000}
            step={50000}
            value={[filters.maxPrice]}
            onValueChange={([v]) => onChange({ maxPrice: v })}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Listing type</Label>
          <Select
            value={filters.listingType}
            onValueChange={(v) => onChange({ listingType: v as PropertyFilters["listingType"] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="sale">For Sale</SelectItem>
              <SelectItem value="rent">For Rent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Property type</Label>
          <Select value={filters.type} onValueChange={(v) => onChange({ type: v as PropertyType | "all" })}>
            <SelectTrigger>
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

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label>Bedrooms</Label>
            <Select
              value={String(filters.bedrooms)}
              onValueChange={(v) => onChange({ bedrooms: Number(v) })}
            >
              <SelectTrigger>
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
          <div className="space-y-1.5">
            <Label>Bathrooms</Label>
            <Select
              value={String(filters.bathrooms)}
              onValueChange={(v) => onChange({ bathrooms: Number(v) })}
            >
              <SelectTrigger>
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

        {!hideStatusFilter && (
          <div className="space-y-1.5">
            <Label>Listing status</Label>
            <Select
              value={filters.status}
              onValueChange={(v) => onChange({ status: v as ListingStatus | "all" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "all" ? "All statuses" : s[0].toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const DEFAULT_FILTERS: PropertyFilters = {
  search: "",
  type: "all",
  minPrice: 0,
  maxPrice: 2000000,
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
