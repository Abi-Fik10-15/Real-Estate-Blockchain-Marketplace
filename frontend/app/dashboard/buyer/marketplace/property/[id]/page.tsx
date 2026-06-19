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
  Clock3,
  Heart,
  MapPin,
  Maximize,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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
          <h1 className="mt-4 text-2xl font-bold text-primary-600">Property not found</h1>
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
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card className="border-border/80 shadow-none">
              <CardContent className="p-4 sm:p-5">
                {/* Top bar: back link + badges + save */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Button variant="ghost" size="sm" className="-ml-2 h-8 text-muted-foreground hover:text-foreground" asChild>
                    <Link href={marketplaceBackHref}>
                      <ArrowLeft className="h-3.5 w-3.5" /> Back to marketplace
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
                    onClick={() => toggleSaved(property.id)}
                  >
                    <Heart className={cn("h-3.5 w-3.5", saved && "fill-destructive text-destructive")} />
                    {saved ? "Saved" : "Save"}
                  </Button>
                </div>

                <Separator className="my-3" />

                {/* Title row */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <h1 className="text-xl font-semibold tracking-tight text-primary-600 sm:text-2xl">{property.title}</h1>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {property.location.address}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <Badge variant="outline" className="rounded border-primary/40 bg-primary/5 px-2 py-0.5 text-xs text-primary">
                        For {property.listingType === "rent" ? "Rent" : "Sale"}
                      </Badge>
                      <Badge variant="outline" className="rounded px-2 py-0.5 text-xs capitalize">
                        {property.status}
                      </Badge>
                      <Badge variant="outline" className="rounded px-2 py-0.5 text-xs capitalize">
                        {property.type}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-primary sm:text-3xl">{priceLabel}</p>
                  </div>
                </div>

                <Separator className="my-3" />

                {/* Stats row */}
                <div className="grid grid-cols-4 divide-x divide-border">
                  {stats.map((s) => (
                    <div key={s.label} className="flex flex-col items-center gap-1 px-3 py-2 first:pl-0 last:pr-0">
                      <span className="text-sm font-semibold capitalize text-primary-500 leading-tight">{s.value}</span>
                      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{s.label}</span>
                    </div>
                  ))}
                </div>

                <Separator className="my-3" />

                {/* Description */}
                <p className="text-sm leading-relaxed text-muted-foreground">{property.description}</p>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-primary-600">Photo Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <PropertyGallery images={property.images} title={property.title} />
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-primary-600">
                  <MapPin className="h-5 w-5 text-primary" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 overflow-hidden rounded-xl border border-border/60">
                  <PropertyMap location={property.location} title={property.title} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 lg:sticky lg:top-20 lg:h-fit">
            <OwnershipVerification property={property} />

            <Card className="border-border/80 shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-primary-600">Interested in this property?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() =>
                    submitInquiry(
                      "question",
                      "Hi, I am interested in this listing and would like to get more information from the agent.",
                      "Inquiry sent to the agent"
                    )
                  }
                >
                  <MessageSquare className="h-4 w-4" />
                  Contact Agent
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() =>
                    submitInquiry(
                      "question",
                      "Hi, I am interested in this listing and would like to directly contact the owner.",
                      "Inquiry sent to the owner"
                    )
                  }
                >
                  <Building2 className="h-4 w-4" />
                  Contact Owner
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
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
                  <ShieldCheck className="h-4 w-4" />
                  {property.listingType === "rent" ? "Submit Rental Request" : "Submit Purchase Request"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-primary-600">Verification History</CardTitle>
              </CardHeader>
              <CardContent>
                {property.history.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    No verification events recorded yet.
                  </div>
                ) : (
                  <ol className="relative space-y-4 border-l border-border pl-5">
                    {property.history.map((ev) => (
                      <li key={ev.id} className="relative">
                        <span className="absolute -left-[1.45rem] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                        <p className="text-sm font-medium">{ev.description}</p>
                        <p className="mt-1 flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                          <Clock3 className="h-3.5 w-3.5" />
                          {ev.txHash.slice(0, 18)}…
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}