"use client";

import Link from "next/link";
import { Users, Building2, CalendarDays, ArrowRight, ExternalLink } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { OWNER_NAV } from "@/components/dashboard/nav-configs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  const inquiries = useInquiryStore((s) => s.inquiries);

  const activeRentals = transactions.filter(
    (t) => t.type === "rental" && t.status === "completed" && t.sellerId === user?.id
  );
  const pendingRentals = transactions.filter(
    (t) => t.type === "rental" && t.status === "escrow" && t.sellerId === user?.id
  );

  const getProperty = (id: string) => properties.find((p) => p.id === id);
  const getTenantName = (buyerId: string, propertyId: string): string => {
    const inq = inquiries.find((i) => i.buyerId === buyerId && i.propertyId === propertyId);
    return inq?.buyerName ?? `Tenant (${buyerId.slice(-6)})`;
  };

  const totalMonthlyIncome = activeRentals.reduce((sum, t) => sum + t.amount, 0);

  return (
    <DashboardShell title="Tenant Management" roleLabel="Property Owner" nav={OWNER_NAV}>
      <div className="space-y-5">

        {/* Summary bar */}
        <div className="rounded-xl border border-border/60 bg-card px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-base font-semibold text-foreground">Tenant Management</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Track active rental agreements, tenant details, and monthly income.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {[
                { label: "Active Tenants", value: activeRentals.length.toLocaleString() },
                { label: "Monthly Income", value: formatCurrency(totalMonthlyIncome) },
                { label: "Pending Escrow", value: pendingRentals.length.toLocaleString() },
              ].map((s) => (
                <div key={s.label} className="text-right">
                  <p className="text-lg font-bold tabular-nums text-primary">{s.value}</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Active Tenants", value: activeRentals.length, icon: Users },
            { label: "Monthly Income", value: formatCurrency(totalMonthlyIncome), icon: CalendarDays },
            { label: "Pending Confirmation", value: pendingRentals.length, icon: Building2 },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/10 px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background text-muted-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="mt-0.5 text-lg font-bold tabular-nums text-primary">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pending escrow banner */}
        {pendingRentals.length > 0 && (
          <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
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

        {/* Tenants table */}
        <Card className="border-border/60">
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle className="text-sm text-primary">Active Tenants</CardTitle>
            <CardDescription className="text-xs">Completed rental transactions from your portfolio</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-3 p-5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/40" />
                ))}
              </div>
            ) : activeRentals.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-border/60">
                  <Users className="h-6 w-6 text-muted-foreground/30" />
                </div>
                <p className="font-medium text-foreground">No active tenants</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Completed rental transactions will appear here.
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
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={prop.images[0]}
                                alt={prop.title}
                                className="h-9 w-12 shrink-0 rounded-lg object-cover border border-border/60"
                              />
                            )}
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{prop?.title ?? t.propertyId}</p>
                              <p className="text-[11px] text-muted-foreground">{prop?.location.city ?? "—"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium">{tenantName}</p>
                          <p className="font-mono text-xs text-muted-foreground">{t.buyerId.slice(-8)}</p>
                        </TableCell>
                        <TableCell className="font-semibold text-primary tabular-nums">
                          {formatCurrency(t.amount)}<span className="text-muted-foreground font-normal">/mo</span>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {t.blockchainTokenId || "—"}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {t.confirmTxHash ? (
                            explorerUrl ? (
                              <a href={explorerUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                                {shortenAddress(t.confirmTxHash, 6)}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              shortenAddress(t.confirmTxHash, 6)
                            )
                          ) : "—"}
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

      </div>
    </DashboardShell>
  );
}
