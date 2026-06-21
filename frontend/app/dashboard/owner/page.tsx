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
import { ScaleOnHover } from "@/components/ui/motion";

import { useOwnerProperties } from "@/hooks/use-owner-properties";
import { useMyTransactions } from "@/hooks/use-transactions";

const STATUS_VARIANT: Record<string, "success" | "warning" | "secondary" | "outline"> = {
  active: "success",
  pending: "warning",
  sold: "secondary",
  rented: "secondary",
  draft: "outline",
};

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

  // Rental yield: completed rental transactions where this owner is the seller
  const completedRentals = transactions.filter(
    (t) => t.type === "rental" && t.status === "completed" && t.sellerId === user?.id
  );
  const annualRentalIncome = completedRentals.reduce((sum, t) => sum + t.amount * 12, 0);
  const totalPortfolioValue = properties.reduce((sum, p) => sum + p.price, 0);
  const grossYield = totalPortfolioValue > 0
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
      {/* Welcome banner */}
      <div className="mb-6 rounded-xl border border-border/60 bg-card/50 px-6 py-5">
        <h2 className="text-lg font-semibold tracking-tight">
          Welcome back, {user?.name ?? "Owner"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You have{" "}
          <span className="font-medium text-foreground">{properties.length} properties</span>{" "}
          in your portfolio
          {pendingInquiries > 0 && (
            <>
              {" "}and{" "}
              <span className="font-medium text-amber-600 dark:text-amber-400">
                {pendingInquiries} unread{" "}
                {pendingInquiries === 1 ? "inquiry" : "inquiries"}
              </span>
            </>
          )}
          .
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5 mb-6">
        <ScaleOnHover>
          <Card className="border-border/60 bg-card/50">
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Properties</p>
                <p className="mt-1.5 text-3xl font-bold tracking-tight">{properties.length}</p>
              </div>
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </ScaleOnHover>

        <ScaleOnHover>
          <Card className="border-border/60 bg-card/50">
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Listings</p>
                <p className="mt-1.5 text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{activeCount}</p>
              </div>
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </ScaleOnHover>

        <ScaleOnHover>
          <Card className="border-border/60 bg-card/50">
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Assigned Agents</p>
                <p className="mt-1.5 text-3xl font-bold tracking-tight text-accent">{agentCount}</p>
              </div>
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                <UserCog className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </ScaleOnHover>

        <ScaleOnHover>
          <Card className="border-border/60 bg-card/50">
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Verification</p>
                <p className="mt-1.5 text-3xl font-bold tracking-tight text-amber-500">{unverifiedCount}</p>
              </div>
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </ScaleOnHover>

        <ScaleOnHover>
          <Card className="border-border/60 bg-card/50">
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Gross Rental Yield</p>
                <p className="mt-1.5 text-3xl font-bold tracking-tight text-primary">
                  {grossYield !== null ? `${grossYield}%` : "—"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {completedRentals.length} active rental{completedRentals.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Percent className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </ScaleOnHover>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Properties table — wider */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
              <div>
                <CardTitle className="text-sm font-semibold">My Properties</CardTitle>
                <CardDescription className="text-xs">Recent portfolio overview</CardDescription>
              </div>
              <Button size="sm" variant="ghost" className="h-8 px-3 text-xs" asChild>
                <Link href="/dashboard/owner/properties">
                  Manage all <ExternalLink className="ml-1.5 h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                {properties.slice(0, 6).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-12 shrink-0 overflow-hidden rounded-lg border border-border/60">
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{p.title}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          {p.chainId} · {p.location.city}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="hidden text-sm font-semibold sm:block">
                        {formatCurrency(p.price)}
                      </span>
                      <Badge
                        variant={STATUS_VARIANT[p.status] ?? "outline"}
                        className="capitalize text-[10px] font-bold px-2"
                      >
                        {p.status}
                      </Badge>
                      {p.verification.status === "verified" ? (
                        <Badge variant="verified" className="text-[10px] font-bold px-2">Verified</Badge>
                      ) : (
                        <Badge variant="warning" className="text-[10px] font-bold px-2">Pending</Badge>
                      )}
                    </div>
                  </div>
                ))}
                {properties.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-12 text-center">
                    <Building2 className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No properties yet.</p>
                    <Button variant="hero" size="sm" asChild>
                      <Link href="/dashboard/owner/properties/new">
                        <PlusCircle className="h-3.5 w-3.5" /> Create first listing
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent inquiries */}
          <Card className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
              <div>
                <CardTitle className="text-sm font-semibold">Recent Inquiries</CardTitle>
                <CardDescription className="text-xs">Buyer purchase & rental requests</CardDescription>
              </div>
              <Button size="sm" variant="ghost" className="h-8 px-3 text-xs" asChild>
                <Link href="/dashboard/owner/inquiries">
                  View all <ExternalLink className="ml-1.5 h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                {inquiries.slice(0, 4).map((inq) => (
                  <div key={inq.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{inq.propertyTitle}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {inq.buyerName} · <span className="capitalize">{inq.type}</span>
                      </p>
                    </div>
                    <Badge
                      variant={inq.status === "new" ? "warning" : inq.status === "closed" ? "success" : "secondary"}
                      className="capitalize text-[10px] font-bold px-2 shrink-0"
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

        {/* Right sidebar — quick actions */}
        <div className="space-y-4">
          <Card className="border-border/60">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
              <CardDescription className="text-xs">Blockchain property management</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {QUICK_ACTIONS.map(({ href, icon: Icon, label, description }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-3 rounded-lg border border-border/50 bg-background/50 px-3.5 py-3 transition-colors hover:border-border hover:bg-muted/50"
                >
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border/60 bg-background text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground">{label}</p>
                    <p className="text-[11px] text-muted-foreground">{description}</p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Portfolio stats */}
          <Card className="border-border/60">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Portfolio Value
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Value</span>
                <span className="font-bold">
                  {formatCurrency(properties.reduce((sum, p) => sum + p.price, 0))}
                </span>
              </div>
              <div className="h-px bg-border/40" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg. Price</span>
                <span className="font-semibold">
                  {properties.length > 0
                    ? formatCurrency(
                        Math.round(
                          properties.reduce((s, p) => s + p.price, 0) /
                            properties.length
                        )
                      )
                    : "—"}
                </span>
              </div>
              <div className="h-px bg-border/40" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sold / Rented</span>
                <span className="font-semibold">
                  {properties.filter((p) => p.status === "sold" || p.status === "rented").length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
