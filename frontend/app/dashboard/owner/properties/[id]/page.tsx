"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  Heart,
  MapPin,
  Maximize,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { OWNER_NAV } from "@/components/dashboard/nav-configs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { PropertyGallery } from "@/components/property/property-gallery";
import { OwnershipVerification } from "@/components/property/ownership-verification";
import { AssignAgentDialog } from "@/features/agents/assign-agent-dialog";
import { useProperty, useAgents } from "@/hooks/use-properties";
import { useSavedStore } from "@/store/saved-store";
import { useInquiryStore } from "@/store/inquiry-store";
import { useAuthStore } from "@/store/auth-store";
import { cn, formatCurrency, shortenAddress } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const { data: agents = [] } = useAgents();
  const assignedAgent = property?.agentId
    ? agents.find((a) => a.id === property.agentId)
    : undefined;

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
      <DashboardShell title="Property Detail" roleLabel="Property Owner" nav={OWNER_NAV}>
        <div className="space-y-5">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="aspect-[16/10] w-full rounded-xl" />
          <div className="grid gap-5 lg:grid-cols-3">
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
      <DashboardShell title="Property Detail" roleLabel="Property Owner" nav={OWNER_NAV}>
        <div className="flex flex-col items-center py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-border/60">
            <Building2 className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h1 className="mt-4 text-xl font-semibold text-primary">Property not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">This listing may have been removed.</p>
          <Button className="mt-6" asChild>
            <Link href="/dashboard/owner/properties">Back to properties</Link>
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
    <DashboardShell title="Property Detail" roleLabel="Property Owner" nav={OWNER_NAV}>
      <div className="space-y-5">

        {/* Summary bar */}
        <div className="rounded-xl border border-border/60 bg-card px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Button variant="ghost" size="sm" className="-ml-1 h-7 gap-1 text-muted-foreground hover:text-foreground" asChild>
                <Link href="/dashboard/owner/properties">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </Link>
              </Button>
              <Separator orientation="vertical" className="h-4" />
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold text-primary">{property.title}</h1>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {property.location.address}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-primary/30 bg-primary/5 text-xs text-primary">
                For {property.listingType === "rent" ? "Rent" : "Sale"}
              </Badge>
              <Badge variant="outline" className="capitalize text-xs">{property.status}</Badge>
              {property.verification.status === "verified" ? (
                <Badge variant="verified" className="gap-1 text-xs">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </Badge>
              ) : (
                <Badge variant="warning" className="text-xs">Pending</Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => toggleSaved(property.id)}
              >
                <Heart className={cn("h-3.5 w-3.5", saved && "fill-destructive text-destructive")} />
                {saved ? "Saved" : "Save"}
              </Button>
            </div>
          </div>
        </div>

        {/* Main layout */}
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">

            {/* Hero card */}
            <Card className="border-border/60">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{property.location.city}, {property.location.country}</p>
                  </div>
                  <p className="text-2xl font-bold text-primary tabular-nums">{priceLabel}</p>
                </div>

                <Separator className="my-4" />

                {/* Stats row */}
                <div className="grid grid-cols-4 divide-x divide-border/60">
                  {stats.map((s) => (
                    <div key={s.label} className="flex flex-col items-center gap-1 px-3 py-2 first:pl-0 last:pr-0">
                      <span className="text-sm font-semibold capitalize text-primary leading-tight">{s.value}</span>
                      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{s.label}</span>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <p className="text-sm leading-relaxed text-muted-foreground">{property.description}</p>
              </CardContent>
            </Card>

            {/* Gallery */}
            <Card className="border-border/60">
              <CardHeader className="border-b border-border/60 pb-3">
                <CardTitle className="text-sm text-primary">Photo Gallery</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <PropertyGallery images={property.images} title={property.title} />
              </CardContent>
            </Card>

            {/* Map */}
            <Card className="border-border/60">
              <CardHeader className="border-b border-border/60 pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-primary">
                  <MapPin className="h-4 w-4" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-72 overflow-hidden rounded-xl border border-border/60">
                  <PropertyMap location={property.location} title={property.title} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <Card className="border-border/60">
              <CardHeader className="border-b border-border/60 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-sm text-primary">
                    <UserCog className="h-4 w-4" />
                    Assigned Agent
                  </CardTitle>
                  <AssignAgentDialog
                    propertyId={property.id}
                    propertyTitle={property.title}
                    currentAgentId={property.agentId}
                    trigger={
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        Manage
                      </Button>
                    }
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {assignedAgent ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={assignedAgent.avatar} alt={assignedAgent.name} />
                      <AvatarFallback>{assignedAgent.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{assignedAgent.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{assignedAgent.email}</p>
                      {property.agentWallet && (
                        <p className="font-mono text-[10px] text-muted-foreground">
                          {shortenAddress(property.agentWallet, 6)}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No agent assigned. Assign one to help manage inquiries and listing updates.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Ownership verification */}
            <Card className="border-border/60">
              <CardHeader className="border-b border-border/60 pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-primary">
                  <ShieldCheck className="h-4 w-4" />
                  Ownership Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <OwnershipVerification property={property} />
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </DashboardShell>
  );
}
