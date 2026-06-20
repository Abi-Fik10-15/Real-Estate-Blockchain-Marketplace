"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { MapProperty } from "@/components/landing/map-based-listing";
import { useProperties } from "@/hooks/use-properties";
import { formatCurrency } from "@/lib/utils";
import { MapPinOff } from "lucide-react";

const MapBasedListing = dynamic(
  () => import("@/components/landing/map-based-listing").then((m) => m.MapBasedListing),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[580px] items-center justify-center rounded-2xl border border-border bg-muted/20">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading map…</p>
        </div>
      </div>
    ),
  }
);

export function MapSection() {
  const router = useRouter();

  const { data, isLoading } = useProperties({ status: "active" });

 
  const properties: MapProperty[] = React.useMemo(() => {
    if (!data) return [];

    return data
      .filter((p) => p.location?.lat != null && p.location?.lng != null)
      .map((p) => ({
        id: p.id,
        title: p.title,
        location: [p.location.city, p.location.country].filter(Boolean).join(", "),
        lat: p.location.lat,
        lng: p.location.lng,
        priceLabel: formatCurrency(p.price),
        ethPrice: p.priceEth ? `${p.priceEth} ETH` : undefined,
        images: p.images ?? [],
        beds: p.bedrooms,
        baths: p.bathrooms,
        areaSqm: p.area,
        isVerified: p.verification?.status === "verified",
        status: p.listingType === "rent" ? "for_rent" : p.status === "pending" ? "pending" : "for_sale",
      }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex h-[600px] items-center justify-center rounded-2xl border border-border bg-muted/20">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading properties…</p>
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="flex h-[600px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 text-center">
        <MapPinOff className="h-10 w-10 text-muted-foreground" />
        <div>
          <p className="font-medium">No mappable listings yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Properties will appear here once they have a location set.
          </p>
        </div>
      </div>
    );
  }

  return (
    <MapBasedListing
      properties={properties}
      className="h-[600px]"
      onViewProperty={(id) => router.push(`/properties/${id}`)}
    />
  );
}