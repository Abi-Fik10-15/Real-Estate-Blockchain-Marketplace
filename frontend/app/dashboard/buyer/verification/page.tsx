"use client";

import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { BUYER_NAV } from "@/components/dashboard/nav-configs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OwnershipVerification } from "@/components/property/ownership-verification";
import { usePropertyStore } from "@/store/property-store";
import { useSavedStore } from "@/store/saved-store";

export default function BuyerVerificationPage() {
  const properties = usePropertyStore((s) => s.properties);
  const savedIds = useSavedStore((s) => s.savedIds);

  const saved = properties.filter((p) => savedIds.includes(p.id));
  const display = saved.length > 0 ? saved : properties.slice(0, 4);

  return (
    <DashboardShell title="Ownership Verification" roleLabel="Buyer / Renter" nav={BUYER_NAV}>
      <PageHeader
        title="Verify Before You Buy"
        description="Independently confirm on-chain ownership of any listing you're considering."
      />
      {saved.length === 0 && (
        <Card className="mb-4">
          <CardContent className="flex items-center justify-between gap-3 py-4">
            <p className="text-sm text-muted-foreground">
              Showing featured listings. Save properties to verify your shortlist.
            </p>
            <Button size="sm" variant="outline" asChild>
              <Link href="/marketplace">Browse</Link>
            </Button>
          </CardContent>
        </Card>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        {display.map((p) => (
          <div key={p.id} className="space-y-2">
            <p className="text-sm font-medium">{p.title}</p>
            <OwnershipVerification property={p} />
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
