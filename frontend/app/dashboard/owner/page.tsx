"use client";

import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  PlusCircle,
  ShieldCheck,
  UserCog,
  ArrowLeftRight,
  TrendingUp,
  Clock,
  ExternalLink,
  Percent,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { OWNER_NAV } from "@/components/dashboard/nav-configs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePropertyStore } from "@/store/property-store";
import { useInquiryStore } from "@/store/inquiry-store";
import { useAuthStore } from "@/store/auth-store";
import { formatCurrency } from "@/lib/utils";

import { useOwnerProperties } from "@/hooks/use-owner-properties";
import { useMyTransactions } from "@/hooks/use-transactions";

const STATUS_VARIANT: Record<string, "success" | "warning" | "secondary" | "outline"> = {
  active: "success",
  pending: "warning",
  sold: "secondary",
  rented: "secondary",
  draft: "outline",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  );
}

export default function OwnerDashboard() {
  const user = useAuthStore((s) => s.user);
  const properties = useOwnerProperties();
  const inquiries = useInquiryStore((s) => s.inquiries).filter((i) =>
    properties.some((p) => p.id === i.propertyId)
  );
  const { data: transactions = [] } = useMyTransactions();

  const activeCount = properties.filter((p) => p.status === "active").length;
  const pendingInquiries = inquiries.filter((i) => i.status === "new").length;
  const agentCount = new Set(properties.map((p) => p.agentId).filter(Boolean)).size;
  const unverifiedCount = properties.filter(
    (p) => p.verification.status !== "verified"
  ).length;

  const completedRentals = transactions.filter(
    (t) => t.type === "rental" && t.status === "completed" && t.sellerId === user?.id
  );
  const annualRentalIncome = completedRentals.reduce((sum, t) => sum + t.amount * 12, 0);
  const totalPortfolioValue = properties.reduce((sum, p) => sum + p.price, 0);
  const grossYield =
    totalPortfolioValue > 0
      ? ((annualRentalIncome / totalPortfolioValue) * 100).toFixed(1)
      : null;

  const QUICK_ACTIONS = [
    {
      href: "/dashboard/owner/properties/new",
      icon: PlusCircle,
      label: "Create Listing",
      description: "Add a new on-chain property",
    },
    {
      href: "/dashboard/owner/agents",
      icon: UserCog,
      label: "Assign Agents",
      description: "Authorize wallet-based agents",
    },
    {
      href: "/dashboard/owner/transfers",
      icon: ArrowLeftRight,
      label: "Transfer Ownership",
      description: "Move title deeds on-chain",
    },
    {
      href: "/dashboard/owner/verification",
      icon: ShieldCheck,
      label: "Verify Registry",
      description: "Confirm oracle ledger status",
    },
  ];

  return (
    <DashboardShell title="Owner Dashboard" roleLabel="Property Owner" nav={OWNER_NAV}>
      <div className="space-y-5">

        {/* ── Summary bar ───────────────────────────────────────── */}
        <div className="rounded-xl border border-border/60 bg-card px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-base font-semibold text-foreground">
                Welcome back,{" "}
                <span className="text-primary">{user?.name ?? "Owner"}</span>
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {properties.length} {properties.length === 1 ? "property" : "properties"} in your portfolio
                {pendingInquiries > 0 && (
                  <> · <span className="font-medium text-amber-600 dark:text-amber-400">{pendingInquiries} unread {pendingInquiries === 1 ? "inquiry" : "inquiries"}</span></>
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {[
                { label: "Active Listings", value: activeCount.toLocaleString() },
                { label: "Portfolio Value", value: formatCurrency(totalPortfolioValue) },
                { label: "Gross Yield", value: grossYield ? `${grossYield}%` : "—" },
              ].map((s) => (
                <div key={s.label} className="text-right">
                  <p className="text-lg font-bold tabular-nums text-primary">{s.value}</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── KPI cards ─────────────────────────────────────────── */}
        <div className="space-y-3">
          <SectionLabel>Portfolio Overview</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {[
              { label: "Total Properties", value: properties.length, icon: Building2 },
              { label: "Active Listings", value: activeCount, icon: CheckCircle2 },
              { label: "Assigned Agents", value: agentCount, icon: UserCog },
              { label: "Pending Verification", value: unverifiedCount, icon: ShieldCheck },
              { label: "Gross Rental Yield", value: grossYield ? `${grossYield}%` : "—", icon: Percent, sub: `${completedRentals.length} active rental${completedRentals.length !== 1 ? "s" : ""}` },
            ].map(({ label, value, icon: Icon, sub }) => (
              <Card key={label} className="border-border/60">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/30 text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-bold tabular-nums text-primary">{value}</p>
                  {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ── Main content ──────────────────────────────────────── */}
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Properties + Inquiries */}
          <div className="space-y-5 lg:col-span-2">

            <div className="space-y-3">
              <SectionLabel>My Properties</SectionLabel>
              <Card className="border-border/60">
                <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-3">
                  <div>
                    <CardTitle className="text-sm text-primary">Portfolio</CardTitle>
                    <CardDescription className="text-xs">Recent listings overview</CardDescription>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" asChild>
                    <Link href="/dashboard/owner/properties">
                      Manage all <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/40">
                    {properties.slice(0, 6).map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-muted/30"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-12 shrink-0 overflow-hidden rounded-md border border-border/60">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{p.title}</p>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              {p.chainId} · {p.location.city}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="hidden text-sm font-semibold text-primary tabular-nums sm:block">
                            {formatCurrency(p.price)}
                          </span>
                          <Badge variant={STATUS_VARIANT[p.status] ?? "outline"} className="capitalize text-[10px] px-2">
                            {p.status}
                          </Badge>
                          {p.verification.status === "verified" ? (
                            <Badge variant="verified" className="text-[10px] px-2">Verified</Badge>
                          ) : (
                            <Badge variant="warning" className="text-[10px] px-2">Pending</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                    {properties.length === 0 && (
                      <div className="flex flex-col items-center gap-3 py-12 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-border/60">
                          <Building2 className="h-6 w-6 text-muted-foreground/40" />
                        </div>
                        <p className="text-sm text-muted-foreground">No properties yet.</p>
                        <Button size="sm" asChild>
                          <Link href="/dashboard/owner/properties/new">
                            <PlusCircle className="h-3.5 w-3.5" /> Create first listing
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              <SectionLabel>Recent Inquiries</SectionLabel>
              <Card className="border-border/60">
                <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-3">
                  <div>
                    <CardTitle className="text-sm text-primary">Buyer Requests</CardTitle>
                    <CardDescription className="text-xs">Purchase & rental inquiries</CardDescription>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" asChild>
                    <Link href="/dashboard/owner/inquiries">
                      View all <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/40">
                    {inquiries.slice(0, 4).map((inq) => (
                      <div key={inq.id} className="flex items-center justify-between gap-3 px-5 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{inq.propertyTitle}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {inq.buyerName} · <span className="capitalize">{inq.type}</span>
                          </p>
                        </div>
                        <Badge
                          variant={inq.status === "new" ? "warning" : inq.status === "closed" ? "success" : "secondary"}
                          className="capitalize text-[10px] px-2 shrink-0"
                        >
                          {inq.status === "new" ? "New" : inq.status === "in_progress" ? "In Review" : "Closed"}
                        </Badge>
                      </div>
                    ))}
                    {inquiries.length === 0 && (
                      <div className="flex items-center gap-2 px-5 py-8 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        No inquiries yet.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="space-y-3">
              <SectionLabel>Quick Actions</SectionLabel>
              <Card className="border-border/60">
                <CardHeader className="border-b border-border/60 pb-3">
                  <CardTitle className="text-sm text-primary">Property Management</CardTitle>
                  <CardDescription className="text-xs">Blockchain owner controls</CardDescription>
                </CardHeader>
                <CardContent className="p-3 space-y-2">
                  {QUICK_ACTIONS.map(({ href, icon: Icon, label, description }) => (
                    <Link
                      key={href}
                      href={href}
                      className="group flex items-center gap-3 rounded-lg border border-border/50 bg-muted/10 px-3 py-2.5 transition-colors hover:border-primary/30 hover:bg-primary/5"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background text-muted-foreground transition-colors group-hover:border-primary/40 group-hover:text-primary">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground">{label}</p>
                        <p className="text-[11px] text-muted-foreground">{description}</p>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              <SectionLabel>Portfolio Value</SectionLabel>
              <Card className="border-border/60">
                <CardHeader className="border-b border-border/60 pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-primary">
                    <TrendingUp className="h-4 w-4" />
                    Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {[
                    { label: "Total Value", value: formatCurrency(totalPortfolioValue) },
                    {
                      label: "Avg. Price",
                      value: properties.length > 0
                        ? formatCurrency(Math.round(totalPortfolioValue / properties.length))
                        : "—",
                    },
                    {
                      label: "Sold / Rented",
                      value: properties.filter((p) => p.status === "sold" || p.status === "rented").length,
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold text-primary tabular-nums">{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

      </div>
    </DashboardShell>
  );
}
