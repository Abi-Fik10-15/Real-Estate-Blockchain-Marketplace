"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { BUYER_NAV } from "@/components/dashboard/nav-configs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePropertyStore } from "@/store/property-store";
import { useSavedStore } from "@/store/saved-store";
import { formatCurrency } from "@/lib/utils";

export default function BuyerSavedPage() {
  const properties = usePropertyStore((s) => s.properties);
  const savedIds = useSavedStore((s) => s.savedIds);
  const toggleSaved = useSavedStore((s) => s.toggleSaved);

  const saved = properties.filter((p) => savedIds.includes(p.id));

  return (
    <DashboardShell title="Saved Properties" roleLabel="Buyer / Renter" nav={BUYER_NAV}>
      <PageHeader
        title="Saved Properties"
        description="Properties you have bookmarked for later."
      />
      {saved.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Heart className="h-10 w-10 text-muted-foreground" />
            <p className="font-medium">No saved properties yet</p>
            <p className="text-sm text-muted-foreground">
              Browse the marketplace and tap the heart to save listings.
            </p>
            <Button variant="hero" asChild>
              <Link href="/marketplace">Browse Marketplace</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {saved.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <div
                className="h-40 bg-cover bg-center"
                style={{ backgroundImage: `url(${p.images[0]})` }}
              />
              <CardContent className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{p.title}</p>
                  {p.verification.status === "verified" && (
                    <Badge variant="verified">✓</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{p.location.city}</p>
                <p className="font-bold">{formatCurrency(p.price)}</p>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="hero" className="flex-1" asChild>
                    <Link href={`/property/${p.id}`}>View</Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      toggleSaved(p.id);
                      toast.success("Removed from saved");
                    }}
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
