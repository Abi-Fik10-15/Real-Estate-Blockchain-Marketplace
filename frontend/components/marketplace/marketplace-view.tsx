"use client";

import * as React from "react";
import { LayoutGrid, List, Search, SearchX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_FILTERS,
  PropertyFiltersPanel,
} from "@/components/property/property-filters";
import { PropertyCard, PropertyCardSkeleton } from "@/components/property/property-card";
import { useProperties } from "@/hooks/use-properties";
import { cn } from "@/lib/utils";
import type { PropertyFilters } from "@/types";

export function MarketplaceView() {
  const [filters, setFilters] = React.useState<PropertyFilters>(DEFAULT_FILTERS);
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const { data, isLoading } = useProperties(filters);

  const patch = (p: Partial<PropertyFilters>) => setFilters((f) => ({ ...f, ...p }));

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-border/60 bg-muted/30 p-6">
        <h2 className="text-2xl font-bold tracking-tight">Browse Properties</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Discover blockchain-verified listings and save your favorites.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, city or country..."
              className="pl-9"
              value={filters.search}
              onChange={(e) => patch({ search: e.target.value })}
            />
          </div>
          <Select
            value={filters.sort}
            onValueChange={(v) => patch({ sort: v as PropertyFilters["sort"] })}
          >
            <SelectTrigger className="sm:w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="price_asc">Price: low to high</SelectItem>
              <SelectItem value="price_desc">Price: high to low</SelectItem>
              <SelectItem value="area_desc">Largest area</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <PropertyFiltersPanel
            filters={filters}
            onChange={patch}
            onReset={() => setFilters(DEFAULT_FILTERS)}
          />
        </aside>

        <div>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Loading..." : `${data?.length ?? 0} properties found`}
            </p>
            <div className="flex items-center gap-1 rounded-lg border border-border p-1">
              <Button
                variant={view === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setView("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={view === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setView("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div
              className={cn(
                view === "grid" ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3" : "space-y-5"
              )}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <PropertyCardSkeleton key={i} view={view} />
              ))}
            </div>
          ) : data && data.length > 0 ? (
            <div
              className={cn(
                view === "grid" ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3" : "space-y-5"
              )}
            >
              {data.map((p) => (
                <PropertyCard key={p.id} property={p} view={view} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
              <SearchX className="h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 font-semibold">No properties match your filters</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search or resetting the filters.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setFilters(DEFAULT_FILTERS)}>
                Reset filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
