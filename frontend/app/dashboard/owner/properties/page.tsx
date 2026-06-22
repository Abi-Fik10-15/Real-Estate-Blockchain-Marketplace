"use client";

import * as React from "react";
import Link from "next/link";
import { Building2, PlusCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { OWNER_NAV } from "@/components/dashboard/nav-configs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePropertyStore } from "@/store/property-store";
import { useOwnerProperties } from "@/hooks/use-owner-properties";
import { useMyTransactions } from "@/hooks/use-transactions";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ListingStatus } from "@/types";

const STATUSES: ListingStatus[] = ["active", "pending", "sold", "rented", "draft"];

const STATUS_COLOR: Record<ListingStatus, string> = {
  active: "text-emerald-600 dark:text-emerald-400",
  pending: "text-amber-600 dark:text-amber-400",
  sold: "text-primary",
  rented: "text-primary",
  draft: "text-muted-foreground",
};

export default function OwnerPropertiesPage() {
  const properties = useOwnerProperties();
  const { data: transactions = [] } = useMyTransactions();
  const setStatus = usePropertyStore((s) => s.setStatus);

  const completedAsSeller = new Set(
    transactions.filter((t) => t.status === "completed").map((t) => t.propertyId)
  );

  const activeCount = properties.filter((p) => p.status === "active").length;
  const pendingCount = properties.filter((p) => p.status === "pending").length;
  const verifiedCount = properties.filter((p) => p.verification.status === "verified").length;

  return (
    <DashboardShell title="My Properties" roleLabel="Property Owner" nav={OWNER_NAV}>
      <div className="space-y-5">

        {/* Summary bar */}
        <div className="rounded-xl border border-border/60 bg-card px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-base font-semibold text-foreground">My Properties</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {properties.length} listing{properties.length !== 1 ? "s" : ""} · {activeCount} active · {pendingCount} awaiting approval
              </p>
            </div>
            <Button size="sm" asChild>
              <Link href="/dashboard/owner/properties/new">
                <PlusCircle className="h-3.5 w-3.5" /> Create Property
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats strip */}
        {properties.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Total Listings", value: properties.length },
              { label: "Active", value: activeCount },
              { label: "Verified", value: verifiedCount },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg border border-border/50 bg-muted/10 px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="mt-1 text-xl font-bold tabular-nums text-primary">{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Listings */}
        {properties.length === 0 ? (
          <Card className="border-border/60">
            <CardContent className="flex flex-col items-center gap-4 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-border/60">
                <Building2 className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <div>
                <p className="font-semibold">No properties yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first on-chain property listing.
                </p>
              </div>
              <Button asChild>
                <Link href="/dashboard/owner/properties/new">
                  <PlusCircle className="h-4 w-4" /> Create Property
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/60">
            <CardHeader className="border-b border-border/60 pb-3">
              <CardTitle className="text-sm text-primary">All Listings</CardTitle>
              <CardDescription className="text-xs">
                Listings stay pending until an admin approves them for the marketplace.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                {properties.map((p) => {
                  const isCompletedDeal =
                    completedAsSeller.has(p.id) && (p.status === "sold" || p.status === "rented");

                  return (
                    <div
                      key={p.id}
                      className="flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-muted/20 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-border/60">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{p.title}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="font-mono text-[10px]">{p.chainId}</span>
                            <span>·</span>
                            <span>{p.location.city}</span>
                            <span>·</span>
                            <span className="font-semibold text-primary tabular-nums">{formatCurrency(p.price)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        {isCompletedDeal ? (
                          <Badge variant={p.status === "sold" ? "secondary" : "verified"} className="capitalize text-xs">
                            {p.status === "sold" ? "Sold" : "Rented"}
                          </Badge>
                        ) : p.status === "pending" ? (
                          <Badge variant="warning" className="text-xs">Awaiting approval</Badge>
                        ) : (
                          <Select
                            value={p.status}
                            onValueChange={(v) => {
                              setStatus(p.id, v as ListingStatus);
                              toast.success(`Status set to "${v}"`);
                            }}
                          >
                            <SelectTrigger className={cn("h-8 w-32 text-xs font-semibold capitalize", STATUS_COLOR[p.status])}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUSES.map((s) => (
                                <SelectItem key={s} value={s} className={cn("text-xs capitalize font-medium", STATUS_COLOR[s])}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {p.verification.status === "verified" ? (
                          <Badge variant="verified" className="gap-1 text-[10px]">
                            <ShieldCheck className="h-3 w-3" /> Verified
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="text-[10px]">Pending</Badge>
                        )}

                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" asChild>
                          <Link href={`/dashboard/owner/properties/${p.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
