"use client";

import Link from "next/link";
import * as React from "react";
import {
  Heart,
  Home,
  Key,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  Circle,
  AlertCircle,
  MessageSquare,
  Bookmark,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { BUYER_NAV } from "@/components/dashboard/nav-configs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePropertyStore } from "@/store/property-store";
import { useSavedStore } from "@/store/saved-store";
import { useInquiryStore } from "@/store/inquiry-store";
import { useAuthStore } from "@/store/auth-store";
import { useWalletStore } from "@/store/wallet-store";
import { useBuyerProperties } from "@/hooks/use-buyer-properties";
import { useMyTransactions } from "@/hooks/use-transactions";
import { cn, formatCurrency, shortenAddress } from "@/lib/utils";
import { BUYER_MARKETPLACE_PATH } from "@/lib/routes";

function StatCard({
  label,
  value,
  icon: Icon,
  iconClass,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  iconClass: string;
}) {
  return (
    <Card className="border-border/60 transition-shadow hover:shadow-md">
      <CardContent className="flex items-center justify-between p-5">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-primary">{value}</p>
        </div>
        <div className={cn("rounded-xl p-2.5", iconClass)}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function BuyerDashboard() {
  const properties = usePropertyStore((s) => s.properties);
  const savedIds = useSavedStore((s) => s.savedIds);
  const inquiries = useInquiryStore((s) => s.inquiries);
  const user = useAuthStore((s) => s.user);
  const { wallet, connect } = useWalletStore();

  const handleConnectWallet = async () => {
    try {
      await connect();
      toast.success("Wallet connected on Sepolia");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to connect wallet",
      );
    }
  };

  const [hasVerifiedOnce, setHasVerifiedOnce] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setHasVerifiedOnce(
        localStorage.getItem("chainestate_verified_at_least_once") === "true",
      );
    }
  }, []);

  const buyerId = user?.id ?? "u-buyer-1";
  const myInquiries = inquiries.filter((i) => i.buyerId === buyerId);
  const activeInquiries = myInquiries.filter(
    (i) => i.status === "new" || i.status === "in_progress",
  );
  const acquiredProperties = useBuyerProperties();
  const { data: transactions = [] } = useMyTransactions();
  const completedTransactions = transactions.filter(
    (t) => t.buyerId === buyerId && t.status === "completed",
  );
  const activeListings = properties.filter((p) => p.status === "active");
  const saved = activeListings.filter((p) => savedIds.includes(p.id));
  const display = saved.length > 0 ? saved : activeListings.slice(0, 4);
  const purchases = completedTransactions.filter((t) => t.type === "sale").length;
  const rentals = completedTransactions.filter(
    (t) => t.type === "rental",
  ).length;
  const verifiedCount = properties.filter(
    (p) => p.verification.status === "verified",
  ).length;
  const ownedOrRented = acquiredProperties.filter(
    (p) => p.status === "sold" || p.status === "rented",
  );

  const isWalletConnected = !!wallet;
  const isProfileComplete = !!(user?.phone && user?.email && user?.name);
  const hasSavedListings = savedIds.length > 0;

  const checklistSteps = [
    {
      id: "wallet",
      title: "Link Web3 wallet",
      description:
        "Connect your wallet to sign property escrows and hold title NFTs.",
      completed: isWalletConnected,
      actionLabel: "Connect wallet",
      actionHref: "/dashboard/buyer/settings",
      actionFn: isWalletConnected ? undefined : handleConnectWallet,
    },
    {
      id: "profile",
      title: "Complete KYC profile",
      description:
        "Fill in contact details and submit identity documents in Settings.",
      completed: isProfileComplete && user?.kycStatus === "verified",
      actionLabel: "Open settings",
      actionHref: "/dashboard/buyer/settings",
    },
    {
      id: "save",
      title: "Save your favorites",
      description: "Bookmark listings you're interested in buying or renting.",
      completed: hasSavedListings,
      actionLabel: "Browse listings",
      actionHref: BUYER_MARKETPLACE_PATH,
    },
    {
      id: "verify",
      title: "Verify title registry",
      description: "Verify a property's on-chain deed against Sepolia.",
      completed: hasVerifiedOnce,
      actionLabel: "Verify property",
      actionHref: "/dashboard/buyer/verification",
    },
  ];

  const completedCount = checklistSteps.filter((step) => step.completed).length;
  const progressPercent = Math.round(
    (completedCount / checklistSteps.length) * 100,
  );

  return (
    <DashboardShell title="Buyer Dashboard" roleLabel="Buyer" nav={BUYER_NAV}>
      <div className="space-y-5">
        {/* Welcome summary bar */}
        <div className="rounded-xl border border-border/60 bg-card px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Welcome back,{" "}
                <span className="text-primary">{user?.name ?? "Buyer"}</span>
              </h1>
              <p className="mt-0.5 max-w-xl text-xs text-muted-foreground">
                Track offers, escrow transactions, and on-chain deed
                verification from one place.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={BUYER_MARKETPLACE_PATH}>Browse listings</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/buyer/requests">View requests</Link>
              </Button>
            </div>
          </div>

          {wallet ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/40 pt-3">
              <Badge variant="success" className="gap-1 text-[10px]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Wallet connected
              </Badge>
              <Badge variant="outline" className="font-mono text-[10px]">
                {shortenAddress(wallet.address, 8)}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {wallet.network || "Sepolia"}
              </Badge>
            </div>
          ) : (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Connect a Web3 wallet in{" "}
                <Link
                  href="/dashboard/buyer/settings"
                  className="font-medium underline underline-offset-2"
                >
                  Settings
                </Link>{" "}
                to enable escrow payments.
              </span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Saved properties"
            value={savedIds.length}
            icon={Heart}
            iconClass="bg-rose-500/10 text-rose-500"
          />
          <StatCard
            label="Active requests"
            value={activeInquiries.length}
            icon={MessageSquare}
            iconClass="bg-blue-500/10 text-blue-500"
          />
          <StatCard
            label="Purchased"
            value={purchases}
            icon={ShoppingBag}
            iconClass="bg-purple-500/10 text-purple-500"
          />
          <StatCard
            label="Rented"
            value={rentals}
            icon={Key}
            iconClass="bg-emerald-500/10 text-emerald-500"
          />
        </div>

        {/* Owned / rented properties */}
        {ownedOrRented.length > 0 && (
          <Card className="border-border/60">
            <CardHeader className="border-b border-border/40 pb-3">
              <CardTitle className="text-sm font-semibold text-primary">
                My properties
              </CardTitle>
              <CardDescription className="text-xs">
                Properties you have purchased or rented after completing a
                transaction
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pt-4">
              {ownedOrRented.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 p-3"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 truncate text-sm font-semibold">
                      <Home className="h-3.5 w-3.5 shrink-0 text-primary" />
                      {p.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      <span className="font-semibold text-primary">
                        {formatCurrency(p.price)}
                        {p.listingType === "rent" && "/mo"}
                      </span>
                      {" · "}
                      {p.location.city}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge
                      variant={p.status === "sold" ? "secondary" : "verified"}
                      className="text-[10px] capitalize"
                    >
                      {p.status === "sold" ? "Purchased" : "Rented"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-3 text-xs"
                      asChild
                    >
                      <Link href={`/property/${p.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          {/* Onboarding checklist */}
          <Card className="border-border/60">
            <CardHeader className="border-b border-border/40 pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold text-primary">
                    Getting started
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Complete these steps to unlock the full buyer experience
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    <span className="font-semibold text-primary">
                      {completedCount}
                    </span>
                    /{checklistSteps.length}
                  </span>
                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-primary">
                    {progressPercent}%
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="divide-y divide-border/40 p-0">
              {checklistSteps.map((step) => (
                <div
                  key={step.id}
                  className="flex items-start justify-between gap-4 px-5 py-4"
                >
                  <div className="flex gap-3">
                    {step.completed ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                    ) : (
                      <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground/50" />
                    )}
                    <div className="space-y-0.5">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          step.completed &&
                            "text-muted-foreground line-through",
                        )}
                      >
                        {step.title}
                      </p>
                      <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {!step.completed && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 shrink-0 px-3 text-xs"
                      onClick={step.actionFn}
                      asChild={!step.actionFn}
                    >
                      {step.actionFn ? (
                        <span>{step.actionLabel}</span>
                      ) : (
                        <Link href={step.actionHref}>
                          {step.actionLabel}
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Link>
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Saved / recommended quickview */}
          <Card className="border-border/60">
            <CardHeader className="border-b border-border/40 pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-semibold text-primary">
                    {saved.length > 0 ? "Saved properties" : "Recommended"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Quick access to property listings
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs text-primary"
                  asChild
                >
                  <Link href="/dashboard/buyer/saved">View all</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-4">
              {display.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                    <Bookmark className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-primary">
                    No listings yet
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Browse the marketplace to find properties.
                  </p>
                  <Button size="sm" className="mt-3" asChild>
                    <Link href={BUYER_MARKETPLACE_PATH}>Browse listings</Link>
                  </Button>
                </div>
              ) : (
                display.slice(0, 3).map((p, index) => (
                  <div
                    key={p.id || `listing-${index}`}
                    className="group flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 p-3 transition-colors hover:border-primary/20"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold transition-colors group-hover:text-primary">
                        {p.title}
                      </p>
                      <p className="mt-0.5 text-xs">
                        <span className="font-bold text-primary">
                          {formatCurrency(p.price)}
                          {p.listingType === "rent" && "/mo"}
                        </span>
                        <span className="text-muted-foreground">
                          {" "}
                          · {p.location.city}
                        </span>
                      </p>
                      {p.verification.status === "verified" && (
                        <Badge
                          variant="verified"
                          className="mt-1.5 h-4 px-1.5 text-[9px]"
                        >
                          Verified
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 shrink-0 px-3 text-xs"
                      asChild
                    >
                      <Link href={`/property/${p.id}`}>View</Link>
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Verified registry footnote */}
        {verifiedCount > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
            <span>
              <span className="font-semibold text-primary">{verifiedCount}</span>{" "}
              {verifiedCount === 1 ? "listing has" : "listings have"} verified
              on-chain registry records.
            </span>
            <Button
              variant="link"
              size="sm"
              className="ml-auto h-auto p-0 text-xs"
              asChild
            >
              <Link href="/dashboard/buyer/verification">Verify a property</Link>
            </Button>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
