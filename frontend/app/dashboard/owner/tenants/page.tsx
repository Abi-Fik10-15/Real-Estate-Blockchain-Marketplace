"use client";

import Link from "next/link";
import { Users, Building2, CalendarDays, ArrowRight, ExternalLink } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { OWNER_NAV } from "@/components/dashboard/nav-configs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMyTransactions } from "@/hooks/use-transactions";
import { usePropertyStore } from "@/store/property-store";
import { useInquiryStore } from "@/store/inquiry-store";
import { useAuthStore } from "@/store/auth-store";
import { formatCurrency, shortenAddress } from "@/lib/utils";
import { etherscanTxUrl } from "@/lib/blockchain-utils";

export default function OwnerTenantsPage() {
  const user = useAuthStore((s) => s.user);
  const { data: transactions = [], isLoading } = useMyTransactions();
  const properties = usePropertyStore((s) => s.properties);
  // Owner inquiries carry buyerName — use them to display tenant info without an admin-only user lookup
  const inquiries = useInquiryStore((s) => s.inquiries);

  // Active rentals = completed rental transactions where this owner is the seller
  const activeRentals = transactions.filter(
    (t) => t.type === "rental" && t.status === "completed" && t.sellerId === user?.id
  );

  // Pending escrow rentals (funded, awaiting confirmation)
  const pendingRentals = transactions.filter(
    (t) => t.type === "rental" && t.status === "escrow" && t.sellerId === user?.id
  );

  const getProperty = (id: string) => properties.find((p) => p.id === id);
  // Resolve tenant display name from inquiry (which the owner already has loaded)
  const getTenantName = (buyerId: string, propertyId: string): string => {
    const inq = inquiries.find(
      (i) => i.buyerId === buyerId && i.propertyId === propertyId
    );
    return inq?.buyerName ?? `Tenant (${buyerId.slice(-6)})`;
  };

  const totalMonthlyIncome = activeRentals.reduce((sum, t) => sum + t.amount, 0);

  return (
    <DashboardShell title="Tenant Management" roleLabel="Property Owner" nav={OWNER_NAV}>
      <PageHeader
        title="Tenant Management"
        description="Track active rental agreements, tenant details, and monthly income from your portfolio."
      />

      {/* Summary stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="border-border/60 bg-card/50">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active Tenants</p>
              <p className="mt-1 text-2xl font-bold">{activeRentals.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/50">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Monthly Income</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalMonthlyIncome)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/50">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pending Confirmation</p>
              <p className="mt-1 text-2xl font-bold text-amber-500">{pendingRentals.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending rentals banner */}
      {pendingRentals.length > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <span className="font-semibold">{pendingRentals.length} rental{pendingRentals.length !== 1 ? "s" : ""}</span>{" "}
            awaiting your confirmation in escrow.
          </p>
          <Button size="sm" variant="outline" asChild>
            <Link href="/dashboard/owner/escrow">
              Go to Escrow <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      )}

      {/* Active tenants table */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : activeRentals.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Users className="h-10 w-10 text-muted-foreground/30" />
              <p className="font-medium text-foreground">No active tenants</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Completed rental transactions will appear here. Buyers initiate rentals from the marketplace.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Monthly Rent</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeRentals.map((t) => {
                    const prop = getProperty(t.propertyId);
                  const tenantName = getTenantName(t.buyerId, t.propertyId);
                  const explorerUrl = t.confirmTxHash ? etherscanTxUrl(t.confirmTxHash) : null;

                  return (
                    <TableRow key={t.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          {prop?.images?.[0] && (
                            <img
                              src={prop.images[0]}
                              alt={prop.title}
                              className="h-9 w-12 shrink-0 rounded-lg object-cover border border-border/60"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {prop?.title ?? t.propertyId}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {prop?.location.city ?? "—"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{tenantName}</p>
                        <p className="font-mono text-xs text-muted-foreground">{t.buyerId.slice(-8)}</p>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(t.amount)}<span className="text-muted-foreground font-normal">/mo</span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {t.blockchainTokenId || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {t.confirmTxHash ? (
                          explorerUrl ? (
                            <a
                              href={explorerUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:underline"
                            >
                              {shortenAddress(t.confirmTxHash, 6)}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            shortenAddress(t.confirmTxHash, 6)
                          )
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="success" className="text-[10px]">Active</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
