"use client";

import Link from "next/link";
import * as React from "react";
import { Heart, Home, Key, ShieldCheck, ShoppingBag, ArrowRight, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ScaleOnHover } from "@/components/ui/motion";
import { BUYER_NAV } from "@/components/dashboard/nav-configs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePropertyStore } from "@/store/property-store";
import { useSavedStore } from "@/store/saved-store";
import { useInquiryStore } from "@/store/inquiry-store";
import { useAuthStore } from "@/store/auth-store";
import { useWalletStore } from "@/store/wallet-store";
import { useBuyerProperties } from "@/hooks/use-buyer-properties";
import { useMyTransactions } from "@/hooks/use-transactions";
import { formatCurrency, shortenAddress } from "@/lib/utils";
import { BUYER_MARKETPLACE_PATH } from "@/lib/routes";

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
      toast.error(error instanceof Error ? error.message : "Failed to connect wallet");
    }
  };

  const [hasVerifiedOnce, setHasVerifiedOnce] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setHasVerifiedOnce(localStorage.getItem("chainestate_verified_at_least_once") === "true");
    }
  }, []);

  const buyerId = user?.id ?? "u-buyer-1";
  const myInquiries = inquiries.filter((i) => i.buyerId === buyerId);
  const acquiredProperties = useBuyerProperties();
  const { data: transactions = [] } = useMyTransactions();
  const completedTransactions = transactions.filter(
    (t) => t.buyerId === buyerId && t.status === "completed"
  );
  const activeListings = properties.filter((p) => p.status === "active");
  const saved = activeListings.filter((p) => savedIds.includes(p.id));
  const display = saved.length > 0 ? saved : activeListings.slice(0, 4);
  const purchases = completedTransactions.filter((t) => t.type === "sale").length;
  const rentals = completedTransactions.filter((t) => t.type === "rental").length;
  const ownedOrRented = acquiredProperties.filter(
    (p) => p.status === "sold" || p.status === "rented"
  );

  // Onboarding Checklist logic
  const isWalletConnected = !!wallet;
  const isProfileComplete = !!(user?.phone && user?.email && user?.name);
  const hasSavedListings = savedIds.length > 0;

  const checklistSteps = [
    {
      id: "wallet",
      title: "Link Web3 Wallet",
      description: "Connect your decentralized wallet to sign property escrows and hold title NFTs.",
      completed: isWalletConnected,
      actionLabel: "Connect Wallet",
      actionHref: "/dashboard/buyer/settings",
      actionFn: isWalletConnected ? undefined : handleConnectWallet,
    },
    {
      id: "profile",
      title: "Complete KYC Profile",
      description: "Fill in contact details and submit identity documents in Settings.",
      completed: isProfileComplete && user?.kycStatus === "verified",
      actionLabel: "Open Settings",
      actionHref: "/dashboard/buyer/settings",
    },
    {
      id: "save",
      title: "Save Your Favorites",
      description: "Bookmark listings you're interested in buying or renting.",
      completed: hasSavedListings,
      actionLabel: "Browse Properties",
      actionHref: BUYER_MARKETPLACE_PATH,
    },
    {
      id: "verify",
      title: "Verify Title Registry",
      description: "Verify a property's on-chain oracle registration details.",
      completed: hasVerifiedOnce,
      actionLabel: "Verify Property",
      actionHref: "/dashboard/buyer/verification",
    },
  ];

  const completedCount = checklistSteps.filter((step) => step.completed).length;
  const progressPercent = Math.round((completedCount / checklistSteps.length) * 100);

  return (
    <DashboardShell title="Buyer Dashboard" roleLabel="Buyer / Renter" nav={BUYER_NAV}>
      {/* Welcome & Glassmorphic Hero */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-border bg-card/30 backdrop-blur-md p-6 md:p-8">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]" />
        <div className="relative z-10">

          <h1 className="text-3xl font-extrabold tracking-tight text-primary-600">
            Welcome back, {user?.name ?? "Elena"}!
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground text-sm">
            Manage your real estate offers, track simulated escrow transactions, and verify immutable deed registries on the blockchain.
          </p>
          {wallet ? (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary border border-primary/25">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                Wallet Connected
              </span>
              <span className="font-mono text-muted-foreground">{shortenAddress(wallet.address)}</span>
              <span className="rounded-md bg-primary/10 border border-primary/30 px-2 py-0.5 text-xs font-semibold text-primary">
                {wallet.network || "Sepolia Testnet"}
              </span>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-2 text-primary bg-primary/5 border border-primary/20 rounded-lg p-3 max-w-md text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 text-primary" />
              <span>Connect a Web3 wallet in Settings to enable escrow payments.</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ScaleOnHover key="stat-saved">
          <Card className="relative overflow-hidden border border-border/80 bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
            <CardContent className="flex items-center justify-between p-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Saved Properties</p>
                <p className="text-3xl font-extrabold tracking-tight text-primary">{savedIds.length}</p>
              </div>
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <Heart className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </ScaleOnHover>

        <ScaleOnHover key="stat-purchases">
          <Card className="relative overflow-hidden border border-border/80 bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
            <CardContent className="flex items-center justify-between p-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Purchased</p>
                <p className="text-3xl font-extrabold tracking-tight text-primary">{purchases}</p>
              </div>
              <div className="rounded-xl bg-purple-500/10 p-3 text-purple-500">
                <ShoppingBag className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </ScaleOnHover>

        <ScaleOnHover key="stat-rentals">
          <Card className="relative overflow-hidden border border-border/80 bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
            <CardContent className="flex items-center justify-between p-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Rented</p>
                <p className="text-3xl font-extrabold tracking-tight text-primary">{rentals}</p>
              </div>
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
                <Key className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </ScaleOnHover>

        <ScaleOnHover key="stat-verified">
          <Card className="relative overflow-hidden border border-border/80 bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
            <CardContent className="flex items-center justify-between p-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Verified Registry Listings</p>
                <p className="text-3xl font-extrabold tracking-tight text-primary">
                  {properties.filter((p) => p.verification.status === "verified").length}
                </p>
              </div>
              <div className="rounded-xl bg-amber-500/10 p-3 text-amber-500">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </ScaleOnHover>
      </div>

      {ownedOrRented.length > 0 && (
        <Card className="mt-6 border border-border/80 bg-card/30 backdrop-blur-md shadow-lg">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-lg text-primary-600">My Properties</CardTitle>
            <CardDescription>
              Properties you have purchased or rented after completing the transaction
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {ownedOrRented.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-background/40 p-3"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 truncate text-sm font-semibold">
                    <Home className="h-3.5 w-3.5 shrink-0 text-primary" />
                    {p.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatCurrency(p.price)}
                    {p.listingType === "rent" && "/mo"} · {p.location.city}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={p.status === "sold" ? "secondary" : "verified"} className="capitalize">
                    {p.status === "sold" ? "Purchased" : "Rented"}
                  </Badge>
                  <Button size="sm" variant="outline" className="h-7 px-3 text-xs" asChild>
                    <Link href={`/property/${p.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Onboarding Checklist Card */}
        <Card className="lg:col-span-2 border border-border/80 bg-card/30 backdrop-blur-md shadow-lg">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-lg  text-primary-600">Web3 Onboarding & Setup</CardTitle>
                <CardDescription>Get your buyer profile ready for legal escrow payments</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-muted-foreground">
                  <span className="text-primary font-bold">{completedCount}</span> of <span className="text-primary font-bold">{checklistSteps.length}</span> complete
                </span>
                <div className="h-2 w-24 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-primary">{progressPercent}%</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 divide-y divide-border/30">
            {checklistSteps.map((step) => (
              <div key={step.id} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div className="flex gap-3">
                  {step.completed ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  ) : (
                    <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                  <div className="space-y-1">
                    <p className={`font-semibold text-sm ${step.completed ? "line-through text-muted-foreground/80" : ""}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground max-w-md leading-relaxed">{step.description}</p>
                  </div>
                </div>
                {!step.completed && (
                  <Button
                    size="sm"
                    variant={step.id === "wallet" ? "hero" : "outline"}
                    className="shrink-0 text-xs py-1 h-8 px-3"
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

        {/* Saved & Recommended Listings Quickview */}
        <Card className="border border-border/80 bg-card/30 backdrop-blur-md shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
            <div>
              <CardTitle className="text-base font-bol text-primary-600">
                {saved.length > 0 ? "Saved Properties" : "Recommended listings"}
              </CardTitle>
              <CardDescription className="text-xs">Quick access to property sheets</CardDescription>
            </div>
            <Button size="sm" variant="ghost" className="h-8 px-2.5 text-xs text-primary" asChild>
              <Link href="/dashboard/buyer/saved">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {display.slice(0, 3).map((p, index) => (
              <div
                key={p.id || `listing-${index}`}
                className="group relative flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-background/40 p-3 transition-colors hover:bg-muted/30"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    <Home className="h-3.5 w-3.5 shrink-0 text-primary" />
                    {p.title}
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-muted-foreground">
                    {formatCurrency(p.price)}
                    {p.listingType === "rent" && <span className="font-normal text-[10px]">/mo</span>}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">{p.location.city}</span>
                    {p.verification.status === "verified" && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <Badge variant="verified" className="px-1 py-0 h-4 text-[9px]">
                          Verified ✓
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
                <Button size="sm" variant="outline" className="h-7 px-3 text-xs shrink-0" asChild>
                  <Link href={`/property/${p.id}`}>View</Link>
                </Button>
              </div>
            ))}
            {display.length === 0 && (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No listings saved yet. Browse listings on the marketplace.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
