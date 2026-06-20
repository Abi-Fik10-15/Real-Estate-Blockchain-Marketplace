"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
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
  UserCheck,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
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
import { cn, formatCurrency, shortenAddress } from "@/lib/utils";

const PropertyMap = dynamic(() => import("@/components/property/property-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-xl" />,
});

export function PropertyDetailsClient({ id, initialData }: { id: string; initialData?: any }) {
  const router = useRouter();
  
  // Only pass id to hook, fall back to initialData if hook hasn't returned yet
  const { data: fetchedProperty, isLoading: hookLoading } = useProperty(id);
  const property = fetchedProperty || initialData;
  const isLoading = hookLoading && !property;

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
    );
  }

  if (!property) {
    return (
      <div className="container flex flex-col items-center py-24 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Property not found</h1>
        <p className="mt-2 text-muted-foreground">This listing may have been removed.</p>
        <Button className="mt-6" asChild>
          <Link href={marketplaceBackHref}>Back to marketplace</Link>
        </Button>
      </div>
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
    <div className="container py-8">
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link href={marketplaceBackHref}>
          <ArrowLeft className="h-4 w-4" /> Back to marketplace
        </Link>
      </Button>

      {/* Semantic main content wrapper */}
      <div className="grid gap-8 lg:grid-cols-3">
        <article className="space-y-8 lg:col-span-2">
          <PropertyGallery images={property.images} title={property.title} />

          <div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={property.listingType === "rent" ? "info" : "default"}>
                    For {property.listingType === "rent" ? "Rent" : "Sale"}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {property.status}
                  </Badge>
                  {property.verification.status === "verified" && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                      <BadgeCheck className="h-3 w-3" /> Verified Listing
                    </Badge>
                  )}
                </div>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">{property.title}</h1>
                <p className="mt-2 flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {property.location.address}
                </p>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto">
                <p className="text-3xl font-bold text-primary">{priceLabel}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => toggleSaved(property.id)}
                >
                  <Heart className={cn("h-4 w-4", saved && "fill-destructive text-destructive")} />
                  {saved ? "Saved" : "Save"}
                </Button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((s) => (
                <Card key={s.label} className="glass-card transition-all hover:scale-[1.02] hover:shadow-soft duration-300">
                  <CardContent className="flex flex-col items-center gap-1 p-4 text-center">
                    <s.icon className="h-5 w-5 text-primary" />
                    <span className="text-sm font-semibold">{s.value}</span>
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <section className="glass-card shadow-soft rounded-xl border border-border/60 bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Description</h2>
            <p className="leading-relaxed text-muted-foreground whitespace-pre-wrap">{property.description}</p>
          </section>

          <section className="glass-card shadow-soft rounded-xl border border-border/60 bg-card p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
              <MapPin className="h-5 w-5 text-primary" /> Location
            </h2>
            <div className="h-80 overflow-hidden rounded-xl border border-border/60">
              <PropertyMap location={property.location} title={property.title} />
            </div>
          </section>
        </article>

        {/* Sidebar section */}
        <aside className="space-y-6">
          <OwnershipVerification property={property} />

          {/* Credibility Agent Profile Card */}
          {property.agentWallet && (
            <Card className="glass-card shadow-soft border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" /> Authorized Agent
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    AG
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Verified Agent</p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {shortenAddress(property.agentWallet, 6)}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-1.5 text-xs">
                  <p className="flex justify-between text-muted-foreground">
                    <span>License Status:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">✓ Active Registry</span>
                  </p>
                  <p className="flex justify-between text-muted-foreground">
                    <span>Broker Code:</span>
                    <span className="font-medium text-foreground">#EST-{property.agentId || '991'}</span>
                  </p>
                  <p className="flex justify-between text-muted-foreground">
                    <span>Registry Proof:</span>
                    <span className="font-mono text-foreground">{shortenAddress(property.agentWallet, 4)}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="glass-card shadow-soft">
            <CardHeader>
              <CardTitle className="text-base">Interested?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="hero"
                className="w-full"
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
                className="w-full"
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
                variant="secondary"
                className="w-full"
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

          <Card className="glass-card shadow-soft">
            <CardHeader>
              <CardTitle className="text-base">Verification History</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative space-y-5 border-l border-border pl-5">
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
        </aside>
      </div>
    </div>
  );
}
