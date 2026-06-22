"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
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
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AGENT_NAV } from "@/components/dashboard/nav-configs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyGallery } from "@/components/property/property-gallery";
import { OwnershipVerification } from "@/components/property/ownership-verification";
import { useProperty } from "@/hooks/use-properties";
import { useSavedStore } from "@/store/saved-store";
import { useInquiryStore } from "@/store/inquiry-store";
import { useAuthStore } from "@/store/auth-store";
import { cn, formatCurrency } from "@/lib/utils";

const ASSIGNED_PROPERTIES_PATH = "/dashboard/agent/properties";

const PropertyMap = dynamic(
  () => import("@/components/property/property-map"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full rounded-xl" />,
  },
);

function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-16 rounded-xl" />
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Skeleton className="aspect-[16/10] w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function PropertyDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: property, isLoading } = useProperty(params.id);
  const { isSaved, toggleSaved } = useSavedStore();
  const addInquiry = useInquiryStore((s) => s.add);
  const user = useAuthStore((s) => s.user);

  const backHref = ASSIGNED_PROPERTIES_PATH;

  const submitInquiry = async (
    type: "purchase" | "rental" | "question",
    message: string,
    successLabel: string,
  ) => {
    if (!user) {
      toast.error("Please log in to send an inquiry");
      router.push("/login");
      return;
    }
    if (!property) return;
    try {
      await addInquiry({ propertyId: property.id, type, message });
      toast.success(successLabel, {
        description:
          "Track status anytime under My Requests in your dashboard.",
      });
    } catch {
      toast.error("Failed to send inquiry");
    }
  };

  if (isLoading) {
    return (
      <DashboardShell title="Property Detail" roleLabel="Property Agent" nav={AGENT_NAV}>
        <LoadingSkeleton />
      </DashboardShell>
    );
  }

  if (!property) {
    return (
      <DashboardShell title="Property Detail" roleLabel="Property Agent" nav={AGENT_NAV}>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Building2 className="h-7 w-7 text-muted-foreground" />
          </div>
          <h1 className="mt-4 text-base font-semibold text-primary">
            Property not found
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            This listing may have been removed or is no longer available.
          </p>
          <Button size="sm" className="mt-5" asChild>
            <Link href={backHref}>Back to assigned properties</Link>
          </Button>
        </div>
      </DashboardShell>
    );
  }

  const saved = isSaved(property.id);
  const verified = property.verification.status === "verified";
  const priceLabel =
    property.listingType === "rent"
      ? `${formatCurrency(property.price)}/mo`
      : formatCurrency(property.price);

  const stats = [
    { icon: BedDouble, label: "Beds", value: property.bedrooms },
    { icon: Bath, label: "Baths", value: property.bathrooms },
    {
      icon: Maximize,
      label: "Area",
      value: `${property.area.toLocaleString()} ft²`,
    },
  ];

  return (
    <DashboardShell title="Property Detail" roleLabel="Property Agent" nav={AGENT_NAV}>
      <div className="space-y-5">
        {/* Summary bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 px-2 text-muted-foreground"
              asChild
            >
              <Link href={backHref}>
                <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                Assigned properties
              </Link>
            </Button>
            <div className="hidden h-4 w-px bg-border sm:block" />
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-primary-500 sm:text-lg">
                {property.title}
              </p>
              <p className="truncate text-xs text-muted-foreground sm:text-sm">
                {property.location.city}, {property.location.country}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={
                property.listingType === "rent" ? "secondary" : "default"
              }
              className="px-2.5 py-0.5 text-xs sm:text-sm"
            >
              For {property.listingType === "rent" ? "Rent" : "Sale"}
            </Badge>
            {verified && (
              <Badge
                variant="outline"
                className="border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-700 sm:text-sm dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
              >
                <BadgeCheck className="mr-1 h-3.5 w-3.5" />
                Verified
              </Badge>
            )}
            <button
              type="button"
              aria-label={saved ? "Unsave property" : "Save property"}
              onClick={() => void toggleSaved(property.id)}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3.5 text-sm font-medium transition-colors hover:bg-muted",
                saved && "border-rose-200 text-rose-500",
              )}
            >
              <Heart
                className={cn(
                  "h-4 w-4",
                  saved && "fill-rose-500 text-rose-500",
                )}
              />
              {saved ? "Saved" : "Save"}
            </button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          {/* Main content */}
          <div className="space-y-4">
            {/* Hero + details */}
            <Card className="overflow-hidden border-border/60">
              {/* <div className="relative aspect-[16/10] bg-muted">
                {property.images[0] ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
              </div> */}
              <CardContent className="space-y-4 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <h1 className="text-lg font-semibold text-foreground sm:text-xl">
                      {property.title}
                    </h1>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {property.location.address}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-primary sm:text-2xl">
                    {priceLabel}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {property.type}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {property.status}
                  </Badge>
                  {property.chainId ? (
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] text-muted-foreground"
                    >
                      {property.chainId}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">
                      Off-chain
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                  {stats.map((s) => (
                    <span key={s.label} className="inline-flex items-center gap-1.5">
                      <s.icon className="h-3.5 w-3.5" />
                      <span className="font-semibold text-foreground">
                        {s.value}
                      </span>{" "}
                      {s.label}
                    </span>
                  ))}
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  {property.description}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60">
             
              <CardContent className="pt-4">
                <PropertyGallery
                  images={property.images}
                  title={property.title}
                />
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="border-b border-border/40 pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <MapPin className="h-4 w-4" />
                  Location
                </CardTitle>
                <CardDescription className="text-xs">
                  {property.location.city}, {property.location.country}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-72 overflow-hidden rounded-xl border border-border/60 sm:h-80">
                  <PropertyMap
                    location={property.location}
                    title={property.title}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 lg:sticky lg:top-20 lg:h-fit">
            <OwnershipVerification property={property} />

            <Card className="border-border/60">
              <CardHeader className="border-b border-border/40 pb-3">
                <CardTitle className="text-sm font-semibold text-primary">
                  Interested in this property?
                </CardTitle>
                <CardDescription className="text-xs">
                  Send an inquiry — track responses under My Requests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pt-4">
                <Button
                  className="w-full justify-start gap-2 text-sm"
                  onClick={() => {
                    const isRent = property.listingType === "rent";
                    submitInquiry(
                      isRent ? "rental" : "purchase",
                      isRent
                        ? `I would like to submit a rental application for ${formatCurrency(property.price)}/mo.`
                        : `I would like to submit a purchase offer of ${formatCurrency(property.price)}.`,
                      isRent
                        ? "Rental request submitted"
                        : "Purchase request submitted",
                    );
                  }}
                >
                  <ShieldCheck className="h-4 w-4" />
                  {property.listingType === "rent"
                    ? "Submit rental request"
                    : "Submit purchase offer"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-sm"
                  onClick={() =>
                    submitInquiry(
                      "question",
                      "Hi, I am interested in this listing and would like to get more information from the agent.",
                      "Inquiry sent to the agent",
                    )
                  }
                >
                  <MessageSquare className="h-4 w-4" />
                  Contact agent
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-sm"
                  onClick={() =>
                    submitInquiry(
                      "question",
                      "Hi, I am interested in this listing and would like to directly contact the owner.",
                      "Inquiry sent to the owner",
                    )
                  }
                >
                  <Building2 className="h-4 w-4" />
                  Contact owner
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="border-b border-border/40 pb-3">
                <CardTitle className="text-sm font-semibold text-primary">
                  Activity history
                </CardTitle>
                <CardDescription className="text-xs">
                  On-chain and verification events for this listing
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {property.history.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-center text-xs text-muted-foreground">
                    No activity recorded yet.
                  </div>
                ) : (
                  <ol className="relative space-y-4 border-l border-primary/20 pl-4">
                    {property.history.map((ev, index) => (
                      <li key={ev.id} className="relative">
                        <span
                          className={cn(
                            "absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full border-2 border-background",
                            index === 0 ? "bg-primary" : "bg-muted-foreground/40",
                          )}
                        />
                        <p className="text-xs font-semibold text-foreground">
                          {ev.description}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                          <Clock3 className="h-3 w-3 shrink-0" />
                          {ev.txHash.slice(0, 20)}…
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
