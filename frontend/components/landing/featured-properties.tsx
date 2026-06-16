"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bath,
  Bed,
  MapPin,
  Maximize2,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion";

const FEATURED_PROPERTIES = [
  {
    id: "fp-1",
    title: "Ocean View Luxury Villa",
    type: "Luxury Villa",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    price: "$2,450,000",
    location: "Dubai, UAE",
    roi: "12.4%",
    bedrooms: 5,
    bathrooms: 4,
    area: "4,200 sqft",
    status: "For Sale",
    verified: true,
    chainId: "EST-1001",
  },
  {
    id: "fp-2",
    title: "Skyline Penthouse Apartment",
    type: "Apartment",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    price: "$1,180,000",
    location: "Miami, FL",
    roi: "8.7%",
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
    roi: "15.2%",
    bedrooms: 0,
    bathrooms: 8,
    area: "18,500 sqft",
    status: "For Sale",
    verified: true,
    chainId: "EST-1003",
  },
  {
    id: "fp-4",
    title: "Modern Office Complex",
    type: "Office Space",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    price: "$4,200,000",
    location: "London, UK",
    roi: "11.8%",
    bedrooms: 0,
    bathrooms: 6,
    area: "12,000 sqft",
    status: "For Sale",
    verified: true,
    chainId: "EST-1004",
  },
  {
    id: "fp-5",
    title: "Smart Home Residence",
    type: "Smart Home",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
    price: "$890,000",
    location: "Austin, TX",
    roi: "9.3%",
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
    roi: "14.1%",
    bedrooms: 6,
    bathrooms: 5,
    area: "5,800 sqft",
    status: "For Sale",
    verified: true,
    chainId: "EST-1006",
  },
  {
    id: "fp-7",
    title: "Waterfront Condo",
    type: "Apartment",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80",
    price: "$720,000",
    location: "Barcelona, Spain",
    roi: "7.9%",
    bedrooms: 2,
    bathrooms: 2,
    area: "1,450 sqft",
    status: "For Rent",
    verified: true,
    chainId: "EST-1007",
  },
  {
    id: "fp-8",
    title: "Heritage Mansion Estate",
    type: "Luxury Villa",
    image: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=800&q=80",
    price: "$5,200,000",
    location: "Lisbon, Portugal",
    roi: "10.6%",
    bedrooms: 7,
    bathrooms: 6,
    area: "7,400 sqft",
    status: "For Sale",
    verified: true,
    chainId: "EST-1008",
  },
  {
    id: "fp-9",
    title: "Eco-Tech Smart Villa",
    type: "Smart Home",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
    price: "$1,950,000",
    location: "Toronto, Canada",
    roi: "11.2%",
    bedrooms: 4,
    bathrooms: 3,
    area: "3,800 sqft",
    status: "For Sale",
    verified: true,
    chainId: "EST-1009",
  },
  {
    id: "fp-10",
    title: "Marina Bay Luxury Suite",
    type: "Apartment",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    price: "$3,100,000",
    location: "Singapore",
    roi: "13.5%",
    bedrooms: 3,
    bathrooms: 3,
    area: "2,800 sqft",
    status: "For Sale",
    verified: true,
    chainId: "EST-1010",
  },
  {
    id: "fp-11",
    title: "Mountain View Resort",
    type: "Resort",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
    price: "$4,800,000",
    location: "Aspen, CO",
    roi: "9.8%",
    bedrooms: 8,
    bathrooms: 7,
    area: "9,200 sqft",
    status: "For Sale",
    verified: true,
    chainId: "EST-1011",
  },
  {
    id: "fp-12",
    title: "Innovation Business Hub",
    type: "Commercial",
    image: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=800&q=80",
    price: "$6,400,000",
    location: "Dubai, UAE",
    roi: "16.3%",
    bedrooms: 0,
    bathrooms: 10,
    area: "22,000 sqft",
    status: "For Sale",
    verified: true,
    chainId: "EST-1012",
  },
];

export function FeaturedProperties() {
  return (
    <section id="featured-properties" className="relative overflow-hidden py-20 lg:py-28">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />
        <div className="glow-orb left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 bg-[hsl(221,83%,53%)] opacity-[0.05]" />
      </div>

      <div className="container">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <Badge
            variant="info"
            className="mb-5 border border-accent/20 px-4 py-1.5"
          >
            <BadgeCheck className="h-3.5 w-3.5" /> Blockchain Verified
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Featured{" "}
            <span className="text-gradient">Properties</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Explore our curated selection of premium blockchain-verified real
            estate opportunities across the globe.
          </p>
        </FadeIn>

        {/* Filter tabs */}
        <FadeIn delay={0.15} className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {["All", "Luxury Villas", "Apartments", "Commercial", "Smart Homes", "Resorts"].map(
            (tab, i) => (
              <button
                key={tab}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  i === 0
                    ? "bg-gradient-brand text-white shadow-glow"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {tab}
              </button>
            )
          )}
        </FadeIn>

        <StaggerContainer className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {FEATURED_PROPERTIES.map((property) => (
            <StaggerItem key={property.id}>
              <Link
                href={`/property/${property.id}`}
                className="group block min-h-[420px] overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-border hover:shadow-card-hover"
              >
                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={property.image}
                    alt={property.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                  {/* Badges */}
                  <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                    <Badge
                      variant={
                        property.status === "For Rent" ? "info" : "default"
                      }
                      className="text-[10px]"
                    >
                      {property.status}
                    </Badge>
                    {property.verified && (
                      <Badge variant="verified" className="text-[10px]">
                        <BadgeCheck className="h-3 w-3" /> Verified
                      </Badge>
                    )}
                  </div>

                  {/* ROI badge */}
                  <div className="absolute right-3 top-3">
                    <div className="flex items-center gap-1 rounded-lg bg-success/90 px-2 py-1 text-[10px] font-bold text-white">
                      <TrendingUp className="h-3 w-3" />
                      {property.roi} ROI
                    </div>
                  </div>

                  {/* Price overlay */}
                  <div className="absolute bottom-3 left-3">
                    <p className="text-xl font-bold text-white drop-shadow-md">
                      {property.price}
                    </p>
                    <p className="text-xs text-white/70">{property.type}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-semibold leading-tight">{property.title}</h3>
                  <p className="mt-1.5 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {property.location}
                  </p>

                  {/* Property details */}
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    {property.bedrooms > 0 && (
                      <span className="flex items-center gap-1">
                        <Bed className="h-3.5 w-3.5" /> {property.bedrooms}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Bath className="h-3.5 w-3.5" /> {property.bathrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Maximize2 className="h-3.5 w-3.5" /> {property.area}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {property.chainId}
                    </Badge>
                    <span className="text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      View Details →
                    </span>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeIn delay={0.4} className="mt-12 text-center">
          <Button variant="outline" size="lg" asChild>
            <Link href="/marketplace">
              View All Properties <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </FadeIn>
      </div>
    </section>
  );
}
