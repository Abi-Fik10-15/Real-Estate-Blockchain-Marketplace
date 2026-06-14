"use client";

import Link from "next/link";
import { Heart, Home, Key, ShieldCheck, ShoppingBag } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { BUYER_NAV } from "@/components/dashboard/nav-configs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePropertyStore } from "@/store/property-store";
import { useSavedStore } from "@/store/saved-store";
import { useInquiryStore } from "@/store/inquiry-store";
import { formatCurrency } from "@/lib/utils";

export default function BuyerDashboard() {
  const properties = usePropertyStore((s) => s.properties);
  const savedIds = useSavedStore((s) => s.savedIds);
  const inquiries = useInquiryStore((s) => s.inquiries);

  const saved = properties.filter((p) => savedIds.includes(p.id));
  const display = saved.length > 0 ? saved : properties.slice(0, 4);
  const purchases = inquiries.filter((i) => i.type === "purchase").length;
  const rentals = inquiries.filter((i) => i.type === "rental").length;

  return (
    <DashboardShell title="Buyer Dashboard" roleLabel="Buyer / Renter" nav={BUYER_NAV}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Saved Properties" value={saved.length} icon={Heart} />
        <StatCard label="Purchase Requests" value={purchases} icon={ShoppingBag} accent="accent" />
        <StatCard label="Rental Requests" value={rentals} icon={Key} accent="success" />
        <StatCard
          label="Verified Listings"
          value={display.filter((p) => p.verification.status === "verified").length}
          icon={ShieldCheck}
          accent="warning"
        />
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">
            {saved.length > 0 ? "Saved Properties" : "Recommended Properties"}
          </CardTitle>
          <Button size="sm" variant="ghost" asChild>
            <Link href="/dashboard/buyer/saved">View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {display.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-4"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 truncate font-medium">
                  <Home className="h-4 w-4 shrink-0 text-primary" /> {p.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{formatCurrency(p.price)}</p>
                {p.verification.status === "verified" && (
                  <Badge variant="verified" className="mt-2">
                    Verified ✓
                  </Badge>
                )}
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/property/${p.id}`}>View</Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
