"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { BUYER_NAV } from "@/components/dashboard/nav-configs";

import Link from "next/link";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  Heart,
  MapPin,
  Maximize,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyGallery } from "@/components/property/property-gallery";
import { OwnershipVerification } from "@/components/property/ownership-verification";
import { useProperty } from "@/hooks/use-properties";
import { useSavedStore } from "@/store/saved-store";
import { useInquiryStore } from "@/store/inquiry-store";
import { useAuthStore } from "@/store/auth-store";
import { BUYER_MARKETPLACE_PATH } from "@/lib/routes";
import { cn, formatCurrency } from "@/lib/utils";

const PropertyMap = dynamic(() => import("@/components/property/property-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-xl" />,
});

export default function PropertyDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: property, isLoading } = useProperty(params.id);
  const { isSaved, toggleSaved } = useSavedStore();
  const addInquiry = useInquiryStore((s) => s.add);
  const user = useAuthStore((s) => s.user);

  const marketplaceBackHref =
    user?.role === "buyer" ? BUYER_MARKETPLACE_PATH : "/#featured-properties";

  const submitInquiry = async (
    type: "purchase" | "rental" | "question",
    message: string,
    successLabel: string
  ) => {
    if (!user) {
      toast.error("Please log in to send an inquiry");
      router.push("/login");
      return;
    }
    if (!property) return;
    try {
      await addInquiry({ propertyId: property.id, type, message });
      toast.success(successLabel);
    } catch {
      toast.error("Failed to send inquiry");
    }
  };

  if (isLoading) {
    return (
      <DashboardShell title="Property Detail" roleLabel="Buyer" nav={BUYER_NAV}>
        <div className="container py-10">
          <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-40 w-full" />
            </div>
            <Skeleton className="h-72 w-full" />
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (!property) {
    return (
      <DashboardShell title="Property Detail" roleLabel="Buyer" nav={BUYER_NAV}>
        <div className="container flex flex-col items-center py-24 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-bold">Property not found</h1>
          <p className="mt-2 text-muted-foreground">This listing may have been removed.</p>
          <Button className="mt-6" asChild>
            <Link href={marketplaceBackHref}>Back to marketplace</Link>
          </Button>
        </div>
      </DashboardShell>
    );
  }

  const saved = isSaved(property.id);
  const priceLabel =
    property.listingType === "rent"
      ? `${formatCurrency(property.price)}/mo`
      : formatCurrency(property.price);

  const stats = [
    { icon: BedDouble, label: "Bedrooms", value: property.bedrooms },
    { icon: Bath, label: "Bathrooms", value: property.bathrooms },
    { icon: Maximize, label: "Area", value: `${property.area.toLocaleString()} ft²` },
    { icon: Building2, label: "Type", value: property.type },
  ];

  return (
    <DashboardShell title="Property Detail" roleLabel="Buyer" nav={BUYER_NAV}>
      <div>
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link href={marketplaceBackHref}>
            <ArrowLeft className="h-4 w-4" /> Back to marketplace
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-4 lg:col-span-2">

             <Card className="border shadow-none p-4" >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={property.listingType === "rent" ? "secondary" : "default"}>
                      For {property.listingType === "rent" ? "Rent" : "Sale"}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {property.status}
                    </Badge>
                  </div>
                  <h1 className="mt-2 text-2xl font-bold tracking-tight">{property.title}</h1>
                  <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {property.location.address}
                  </p>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <p className="text-3xl font-bold text-primary">{priceLabel}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                    onClick={() => toggleSaved(property.id)}
                  >
                    <Heart className={cn("h-4 w-4", saved && "fill-destructive text-destructive")} />
                    {saved ? "Saved" : "Save"}
                  </Button>
                </div>
              </div>
                          </Card>
            <PropertyGallery images={property.images} title={property.title} />

           


              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.map((s) => (
                  <Card
                    key={s.label}
                    className="border border-border shadow-none transition-all hover:scale-[1.02] duration-300"
                  >
                    <CardContent className="flex flex-col items-center gap-1 p-3 text-center">
                      <s.icon className="h-5 w-5 text-primary" />
                      <span className="text-sm font-semibold">{s.value}</span>
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>

            <Card className="border shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-muted-foreground">{property.description}</p>
              </CardContent>
            </Card>

            <Card className="border shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-5 w-5 text-primary" /> Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 overflow-hidden rounded-xl border border-border/60">
                  <PropertyMap location={property.location} title={property.title} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <OwnershipVerification property={property} />

            <Card className="border shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Interested?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() =>
                    submitInquiry(
                      "question",
                      "Hi, I am interested in this listing and would like to get more information from the agent.",
                      "Inquiry sent to the agent"
                    )
                  }
                >
                  <MessageSquare className="h-4 w-4" /> Contact Agent
                </Button>
                <Button
                  variant="outline"
                  className="w-full hover:border-primary/50 hover:text-primary"
                  onClick={() =>
                    submitInquiry(
                      "question",
                      "Hi, I am interested in this listing and would like to directly contact the owner.",
                      "Inquiry sent to the owner"
                    )
                  }
                >
                  Contact Owner
                </Button>
                <Button
                  variant="outline"
                  className="w-full hover:border-primary/50 hover:text-primary"
                  onClick={() => {
                    const isRent = property.listingType === "rent";
                    submitInquiry(
                      isRent ? "rental" : "purchase",
                      isRent
                        ? `I would like to submit a rental application for ${formatCurrency(property.price)}/mo.`
                        : `I would like to submit a purchase offer of ${formatCurrency(property.price)}.`,
                      isRent ? "Rental request submitted" : "Purchase request submitted"
                    );
                  }}
                >
                  {property.listingType === "rent" ? "Submit Rental Request" : "Submit Purchase Request"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Verification History</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="relative space-y-4 border-l border-border pl-5">
                  {property.history.map((ev) => (
                    <li key={ev.id} className="relative">
                      <span className="absolute -left-[1.45rem] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                      <p className="text-sm font-medium">{ev.description}</p>
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                        {ev.txHash.slice(0, 18)}…
                      </p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}