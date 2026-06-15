"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bath,
  Bed,
  Heart,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { useSavedStore } from "@/store/saved-store";

const ALL_PROPERTIES = [
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
    title: "Skyline Penthouse",
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
];

export function FeaturedProperties() {
  const { isSaved, toggleSaved } = useSavedStore();
  const [selectedType, setSelectedType] = useState("All");

  const filteredProperties = selectedType === "All" 
    ? ALL_PROPERTIES 
    : ALL_PROPERTIES.filter(p => p.type === selectedType || (selectedType === "Luxury Villas" && p.type === "Luxury Villa") || (selectedType === "Apartments" && p.type === "Apartment") || (selectedType === "Smart Homes" && p.type === "Smart Home") || (selectedType === "Resorts" && p.type === "Resort"));

  return (
    <section id="featured-properties" className="relative py-16 lg:py-20 border-b border-border/40">
      {/* Background elements */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-muted/10 to-transparent" />
      
      <div className="container max-w-[1280px]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Featured <span className="text-gradient">Premium Properties</span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Discover blockchain-verified high-yield properties currently listed on the marketplace.
            </p>
          </div>

          {/* Compact tabs */}
          <div className="flex flex-wrap gap-1.5 self-start md:self-end">
            {["All", "Luxury Villas", "Apartments", "Commercial"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedType(tab)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  selectedType === tab
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* 6 Grid properties */}
        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.slice(0, 6).map((property) => {
            const saved = isSaved(property.id);
            return (
              <StaggerItem key={property.id}>
                <div className="group relative rounded-xl border border-border/50 bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-card-hover flex flex-col h-full">
                  {/* Image & Badges */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                    <Image
                      src={property.image}
                      alt={property.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-103"
                    />
                    
                    {/* Top badging */}
                    <div className="absolute left-3 top-3 flex gap-1.5">
                      <Badge variant={property.status === "For Rent" ? "info" : "default"} className="text-[10px] py-0.5 px-2 font-semibold">
                        {property.status}
                      </Badge>
                      {property.verified && (
                        <Badge variant="verified" className="text-[10px] py-0.5 px-2 font-semibold">
                          <BadgeCheck className="h-3 w-3 mr-0.5" /> Verified
                        </Badge>
                      )}
                    </div>

                    {/* ROI marker */}
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-success/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-white shadow-soft">
                      <TrendingUp className="h-3 w-3" />
                      {property.roi} ROI
                    </div>

                    {/* Interactive Save Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleSaved(property.id);
                      }}
                      className="absolute right-3 bottom-3 grid h-8 w-8 place-items-center rounded-full bg-background/85 backdrop-blur-sm transition-all duration-200 hover:bg-background hover:scale-105 shadow-soft"
                      aria-label="Save property"
                    >
                      <Heart className={`h-4 w-4 transition-colors ${saved ? "fill-destructive text-destructive" : "text-muted-foreground hover:text-foreground"}`} />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="font-bold text-sm leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {property.title}
                      </h3>
                      <p className="shrink-0 text-sm font-bold text-primary">{property.price}</p>
                    </div>

                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> {property.location}
                    </p>

                    {/* Grid stats */}
                    <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground border-t border-border/30 pt-3">
                      {property.bedrooms > 0 && (
                        <span className="flex items-center gap-1">
                          <Bed className="h-3.5 w-3.5 text-primary" /> {property.bedrooms} Beds
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Bath className="h-3.5 w-3.5 text-primary" /> {property.bathrooms} Baths
                      </span>
                      <span className="ml-auto text-[10px] font-mono bg-muted px-2 py-0.5 rounded border border-border/40">
                        {property.chainId}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 flex gap-2 w-full pt-1">
                      <Button variant="outline" size="sm" className="flex-1 text-xs h-8" asChild>
                        <Link href={`/property/${property.id}`}>Details</Link>
                      </Button>
                      <Button variant="default" size="sm" className="flex-1 text-xs h-8" asChild>
                        <Link href={`/property/${property.id}`}>Invest Now</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        <FadeIn className="mt-8 text-center">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/90 hover:bg-transparent" asChild>
            <Link href="/marketplace">
              View All marketplace listings <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </FadeIn>
      </div>
    </section>
  );
}
