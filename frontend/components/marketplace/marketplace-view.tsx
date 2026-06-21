"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  LayoutGrid,
  List,
  Map,
  Search,
  SearchX,
  SlidersHorizontal,
} from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BUYER_MARKETPLACE_FILTERS,
  PropertyFiltersPanel,
} from "@/components/property/property-filters";
import { PropertyCard, PropertyCardSkeleton } from "@/components/property/property-card";
import { useProperties } from "@/hooks/use-properties";
import { cn, formatCurrency } from "@/lib/utils";
import type { Property, PropertyFilters } from "@/types";
import type { MapProperty } from "@/components/landing/map-based-listing";

// SSR-safe — Leaflet requires window
const MapBasedListing = dynamic(
  () =>
    import("@/components/landing/map-based-listing").then(
      (m) => m.MapBasedListing,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] animate-pulse rounded-2xl bg-muted" />
    ),
  },
);

function toMapProperty(p: Property): MapProperty {
  const statusMap: Record<string, MapProperty["status"]> = {
    active: "for_sale",
    pending: "pending",
    sold: "for_sale",
    rented: "for_rent",
    draft: "pending",
  };
  return {
    id: p.id,
    title: p.title,
    location: `${p.location.city}, ${p.location.country}`,
    lat: p.location.lat,
    lng: p.location.lng,
    priceLabel:
      p.listingType === "rent"
        ? `${formatCurrency(p.price)}/mo`
        : formatCurrency(p.price),
    ethPrice: p.priceEth ? `${p.priceEth} ETH` : undefined,
    images: p.images,
    beds: p.bedrooms || undefined,
    baths: p.bathrooms || undefined,
    areaSqm: p.area || undefined,
    isVerified: p.verification.status === "verified",
    status:
      p.listingType === "rent"
        ? "for_rent"
        : (statusMap[p.status] ?? "for_sale"),
  };
}

type ViewMode = "grid" | "list" | "map";

// ─── View toggle ─────────────────────────────────────────────────────────────

function ViewToggle({
  view,
  onViewChange,
}: {
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
}) {
  const items = [
    { v: "grid" as const, Icon: LayoutGrid, label: "Grid view", text: "Grid" },
    { v: "list" as const, Icon: List, label: "List view", text: "List" },
    { v: "map" as const, Icon: Map, label: "Map view", text: "Map" },
  ];
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5">
      {items.map(({ v, Icon, label, text }) => (
        <button
          key={v}
          type="button"
          title={label}
          aria-label={label}
          onClick={() => onViewChange(v)}
          className={cn(
            "flex h-8 items-center gap-1 rounded-md px-2 transition-colors",
            view === v
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
            v === "map" && view === v && "text-primary",
          )}
        >
          <Icon className="h-3.5 w-3.5 shrink-0" />
          <span
            className={cn(
              "text-xs font-medium",
              v === "map" ? "inline" : "hidden sm:inline",
            )}
          >
            {text}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Results header ──────────────────────────────────────────────────────────

function ResultsBar({
  count,
  isLoading,
  view,
  onViewChange,
  filters,
  onSortChange,
  search,
  onSearchChange,
  onResetFilters,
  onPatchFilters,
}: {
  count: number;
  isLoading: boolean;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  filters: PropertyFilters;
  onSortChange: (sort: PropertyFilters["sort"]) => void;
  search: string;
  onSearchChange: (value: string) => void;
  onResetFilters: () => void;
  onPatchFilters: (patch: Partial<PropertyFilters>) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
      <p className="shrink-0 text-sm text-muted-foreground whitespace-nowrap">
        {isLoading ? (
          <span className="inline-block h-4 w-28 animate-pulse rounded bg-muted" />
        ) : (
          <>
            <span className="font-semibold text-foreground">{count}</span>{" "}
            {count === 1 ? "property" : "properties"} found
          </>
        )}
      </p>

      <div className="relative min-w-0 flex-1">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, city or country…"
          className="h-8 pl-8 text-sm"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 lg:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-primary">Filters</DialogTitle>
            </DialogHeader>
            <PropertyFiltersPanel
              filters={filters}
              onChange={onPatchFilters}
              onReset={onResetFilters}
              hideStatusFilter
            />
          </DialogContent>
        </Dialog>

        {view !== "map" && (
          <Select
            value={filters.sort}
            onValueChange={(v) =>
              onSortChange(v as PropertyFilters["sort"])
            }
          >
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="price_asc">Price: low → high</SelectItem>
              <SelectItem value="price_desc">Price: high → low</SelectItem>
              <SelectItem value="area_desc">Largest area</SelectItem>
            </SelectContent>
          </Select>
        )}
        <ViewToggle view={view} onViewChange={onViewChange} />
      </div>
    </div>
  );
}

// ─── Main view ───────────────────────────────────────────────────────────────

export function MarketplaceView() {
  const router = useRouter();
  const [filters, setFilters] = React.useState<PropertyFilters>(
    BUYER_MARKETPLACE_FILTERS,
  );
  const [debouncedFilters, setDebouncedFilters] =
    React.useState<PropertyFilters>(BUYER_MARKETPLACE_FILTERS);
  const [view, setView] = React.useState<ViewMode>("grid");

  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedFilters(filters), 300);
    return () => clearTimeout(id);
  }, [filters]);

  const { data, isLoading } = useProperties({
    ...debouncedFilters,
    status: "active",
  });

  const patch = (p: Partial<PropertyFilters>) =>
    setFilters((f) => ({ ...f, ...p }));

  const mapProperties = React.useMemo(
    () =>
      (data ?? [])
        .filter(
          (p) =>
            p.location.lat != null &&
            p.location.lng != null &&
            !(p.location.lat === 0 && p.location.lng === 0),
        )
        .map(toMapProperty),
    [data],
  );

  const gridClass =
    view === "grid"
      ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
      : "space-y-4";

  const resetFilters = () => setFilters(BUYER_MARKETPLACE_FILTERS);

  const resultsBarProps = {
    isLoading,
    view,
    onViewChange: setView,
    filters,
    onSortChange: (sort: PropertyFilters["sort"]) => patch({ sort }),
    search: filters.search,
    onSearchChange: (search: string) => patch({ search }),
    onResetFilters: resetFilters,
    onPatchFilters: patch,
  };

  return (
    <div className="space-y-5">
      {/* ── Map view ────────────────────────────────────────────────────── */}
      {view === "map" ? (
        <div className="space-y-3">
          <ResultsBar
            count={mapProperties.length}
            {...resultsBarProps}
          />
          {isLoading ? (
            <div className="h-[600px] animate-pulse rounded-2xl bg-muted" />
          ) : (
            <MapBasedListing
              properties={mapProperties}
              variant="embedded"
              className="h-[620px]"
              onViewProperty={(id) =>
                router.push(
                  `/dashboard/buyer/marketplace/property/${id}`,
                )
              }
            />
          )}
        </div>
      ) : (
        /* ── Grid / list view ─────────────────────────────────────────── */
        <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
          {/* Sidebar — desktop only */}
          <aside className="hidden lg:block">
            <PropertyFiltersPanel
              filters={filters}
              onChange={patch}
              onReset={resetFilters}
              hideStatusFilter
            />
          </aside>

          <div className="min-w-0 space-y-4">
            <ResultsBar
              count={data?.length ?? 0}
              {...resultsBarProps}
            />

            {isLoading ? (
              <div className={gridClass}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <PropertyCardSkeleton key={i} view={view} />
                ))}
              </div>
            ) : data && data.length > 0 ? (
              <div className={gridClass}>
                {data.map((p, i) => (
                  <PropertyCard key={p.id} property={p} view={view} priority={i < 3} />
                ))}
              </div>
            ) : (
              <EmptyState onReset={resetFilters} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <SearchX className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-base font-semibold">No properties found</h3>
      <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
        Try broadening your search or adjusting the filters.
      </p>
      <Button variant="outline" size="sm" className="mt-5" onClick={onReset}>
        Reset filters
      </Button>
    </div>
  );
}
