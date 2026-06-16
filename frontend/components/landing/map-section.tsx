"use client";



import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { MapProperty } from "@/components/landing/map-based-listing";

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

// ─── Your property data — replace with a real API call / props ────────────────
const PROPERTIES: MapProperty[] = [
  {
    id: "1",
    title: "Bole District Apartment",
    location: "Bole, Addis Ababa, Ethiopia",
    lat: 9.0227,
    lng: 38.7689,
    priceLabel: "$320K",
    ethPrice: "1.8 ETH",
    images: [],
    beds: 3, baths: 2, areaSqm: 180,
    isVerified: true,
    status: "for_sale",
  },
  {
    id: "2",
    title: "Kazanchis Office Space",
    location: "Kazanchis, Addis Ababa, Ethiopia",
    lat: 9.0192,
    lng: 38.7614,
    priceLabel: "$475K",
    ethPrice: "2.1 ETH",
    images: [],
    areaSqm: 320,
    isVerified: true,
    status: "pending",
  },
  {
    id: "3",
    title: "Dubai Marina Penthouse",
    location: "Marina, Dubai, UAE",
    lat: 25.0757,
    lng: 55.1394,
    priceLabel: "$2.1M",
    ethPrice: "11.8 ETH",
    images: [],
    beds: 4, baths: 3, areaSqm: 340,
    isVerified: true,
    status: "for_sale",
  },
  {
    id: "4",
    title: "Nairobi Westlands Studio",
    location: "Westlands, Nairobi, Kenya",
    lat: -1.2635,
    lng: 36.8029,
    priceLabel: "$85K",
    ethPrice: "0.47 ETH",
    images: [],
    beds: 1, baths: 1, areaSqm: 55,
    isVerified: false,
    status: "for_rent",
  },
  {
    id: "5",
    title: "London Shoreditch Flat",
    location: "Shoreditch, London, UK",
    lat: 51.5246,
    lng: -0.0799,
    priceLabel: "$950K",
    ethPrice: "5.3 ETH",
    images: [],
    beds: 2, baths: 1, areaSqm: 90,
    isVerified: true,
    status: "for_sale",
  },
  {
    id: "6",
    title: "New York Midtown Condo",
    location: "Midtown, New York, USA",
    lat: 40.7549,
    lng: -73.9840,
    priceLabel: "$1.8M",
    ethPrice: "10.1 ETH",
    images: [],
    beds: 3, baths: 2, areaSqm: 145,
    isVerified: true,
    status: "for_sale",
  },
   {
    id: "7",
    title: "New York Midtown Condo",
    location: "Midtown, New York, USA",
    lat: 40.7549,
    lng: -73.9840,
    priceLabel: "$1.8M",
    ethPrice: "10.1 ETH",
    images: [],
    beds: 3, baths: 2, areaSqm: 145,
    isVerified: true,
    status: "for_sale",
  },
   {
    id: "8",
    title: "New York Midtown Condo",
    location: "Midtown, New York, USA",
    lat: 40.7549,
    lng: -73.9840,
    priceLabel: "$1.8M",
    ethPrice: "10.1 ETH",
    images: [],
    beds: 3, baths: 2, areaSqm: 145,
    isVerified: true,
    status: "for_sale",
  },
];

export function MapSection() {
  const router = useRouter();

  return (
    <MapBasedListing
      properties={PROPERTIES}
      className="h-[600px]"
      onViewProperty={(id) => router.push(`/properties/${id}`)}
    />
  );
}
