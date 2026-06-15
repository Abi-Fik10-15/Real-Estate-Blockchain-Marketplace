"use client";

import Link from "next/link";
import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { BUYER_NAV } from "@/components/dashboard/nav-configs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePropertyStore } from "@/store/property-store";
import { useSavedStore } from "@/store/saved-store";
import { useWalletStore } from "@/store/wallet-store";
import { mockBlockchain } from "@/services/mock-blockchain";
import { formatCurrency, shortenAddress } from "@/lib/utils";
import { Search, ShieldCheck, Activity, Award, Loader2, Map, CheckCircle2, FileText, Sparkles, Network } from "lucide-react";
import { toast } from "sonner";

function VerificationContent() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id");

  const { properties, updateProperty } = usePropertyStore();
  const savedIds = useSavedStore((s) => s.savedIds);
  const { wallet } = useWalletStore();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedPropId, setSelectedPropId] = React.useState<string>("");
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [verifyLogs, setVerifyLogs] = React.useState<string[]>([]);
  const [currentBlock, setCurrentBlock] = React.useState(194582192);

  // Filter listings for the dropdown
  const savedProperties = properties.filter((p) => savedIds.includes(p.id));

  // Sync state with URL queries if loaded
  React.useEffect(() => {
    if (queryId) {
      const match = properties.find(
        (p) => p.chainId.toLowerCase() === queryId.toLowerCase() || p.id === queryId
      );
      if (match) {
        setSelectedPropId(match.id);
        setSearchQuery(match.chainId);
      }
    }
  }, [queryId, properties]);

  // Handle manual input search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const match = properties.find(
      (p) => p.chainId.toLowerCase() === searchQuery.trim().toLowerCase()
    );

    if (match) {
      setSelectedPropId(match.id);
      toast.success(`Found listing details for ID ${match.chainId}`);
    } else {
      toast.error(`Property Chain ID "${searchQuery}" not found in title registry index.`);
    }
  };

  // Switch selection from dropdown
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedPropId(val);
    const match = properties.find((p) => p.id === val);
    if (match) {
      setSearchQuery(match.chainId);
    }
  };

  // Perform Simulated Oracle Ledger Lookup
  const handleOracleVerify = async () => {
    const property = properties.find((p) => p.id === selectedPropId);
    if (!property) return;

    setIsVerifying(true);
    setVerifyLogs([]);

    const steps = [
      "Connecting to oracle validators on decentralized consensus registry...",
      `Querying Smart Contract storage for Asset ID: ${property.chainId}...`,
      "Fetching cryptographic audit signatures from Chainestate Title Registry...",
      "Resolving GPS metadata coordinates and owner signature keys...",
      "Consensus confirmed! Deed matches 7/7 validator hashes.",
    ];

    for (let i = 0; i < steps.length; i++) {
      setVerifyLogs((prev) => [...prev, steps[i]]);
      await new Promise((r) => setTimeout(r, 650));
    }

    // Generate simulated block details
    const targetBlock = Math.floor(194582192 + Math.random() * 5000);
    setCurrentBlock(targetBlock);

    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
    const verifiedAt = new Date().toISOString();

    // Update Property Store state to verified
    updateProperty(property.id, {
      verification: {
        status: "verified",
        verifiedAt,
        txHash,
      },
      history: [
        {
          id: `ev-${Date.now()}`,
          type: "verification" as const,
          description: "Ownership details independently re-verified via ledger registry oracle",
          txHash,
          actor: wallet?.address ?? "0x0000000000000000000000000000000000000000",
          timestamp: verifiedAt,
        },
        ...property.history,
      ],
    });

    localStorage.setItem("chainestate_verified_at_least_once", "true");
    toast.success("Immutability parameters successfully verified on-chain!");
    setIsVerifying(false);
  };

  const activeProperty = properties.find((p) => p.id === selectedPropId);
  const isVerified = activeProperty?.verification.status === "verified";

  return (
    <DashboardShell title="Ownership Verification" roleLabel="Buyer / Renter" nav={BUYER_NAV}>
      

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Side: Autocomplete Selector & Verification Trigger */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-border/80 bg-card/30 backdrop-blur-md shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Search className="h-4.5 w-4.5 text-primary" />
                Select Listing to Verify
              </CardTitle>
              <CardDescription className="text-xs">
                Select one of your saved listings or enter a Property Chain ID directly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              {/* Dropdown Selector */}
              <div className="space-y-1.5">
                <Label htmlFor="dropdown-select" className="text-xs font-semibold">Saved Listings</Label>
                <select
                  id="dropdown-select"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={selectedPropId}
                  onChange={handleSelectChange}
                >
                  <option value="">-- Choose Bookmarked Property --</option>
                  {savedProperties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.chainId} - {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Direct Chain ID Search Form */}
              <form onSubmit={handleSearchSubmit} className="space-y-2.5 pt-2 border-t border-border/30">
                <Label htmlFor="search-id" className="text-xs font-semibold">Or Search Property Chain ID (e.g. EST-1001)</Label>
                <div className="flex gap-2">
                  <Input
                    id="search-id"
                    placeholder="e.g. EST-1000"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8.5 text-xs bg-background/50"
                  />
                  <Button type="submit" size="sm" variant="outline" className="h-8.5 shrink-0 px-3">
                    Load
                  </Button>
                </div>
              </form>

              {/* Loaded Property Quick Information */}
              {activeProperty && (
                <div className="rounded-lg bg-background/40 border border-border/40 p-3 mt-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Deed Title</span>
                    <span className="font-bold text-foreground">{activeProperty.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Asset Value</span>
                    <span className="font-semibold text-foreground">{formatCurrency(activeProperty.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Registry Status</span>
                    <Badge variant={isVerified ? "verified" : "warning"} className="h-4 px-1.5 py-0 text-[9px] font-bold">
                      {isVerified ? "Verified ✓" : "Pending Verification"}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verification Logs Console Card */}
          {activeProperty && (isVerifying || verifyLogs.length > 0) && (
            <Card className="border border-border/80 bg-zinc-950 text-zinc-300 font-mono shadow-md overflow-hidden">
              <CardHeader className="bg-zinc-900/50 pb-2.5 border-b border-zinc-800">
                <CardTitle className="text-xs text-zinc-400 flex items-center gap-1.5 font-bold">
                  <Activity className="h-3.5 w-3.5 text-primary" />
                  ORACLE LEDGER CONSOLE
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 text-[10px] space-y-2 max-h-56 overflow-y-auto leading-relaxed">
                {verifyLogs.map((log, index) => (
                  <div key={index} className="flex gap-2 items-start text-emerald-500">
                    <span className="text-zinc-600">[{index + 1}]</span>
                    <span>{log}</span>
                  </div>
                ))}
                {isVerifying && (
                  <div className="flex items-center gap-2 text-primary pt-1 animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                    <span>Synchronizing consensus hashes...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Registry Verify Button */}
          {activeProperty && !isVerifying && (
            <Button
              variant="hero"
              className="w-full text-xs py-2 shadow-md shadow-primary/20"
              onClick={handleOracleVerify}
              disabled={isVerifying}
            >
              <ShieldCheck className="mr-1.5 h-4 w-4" />
              Verify Registry Oracle
            </Button>
          )}
        </div>

        {/* Right Side: Certified Blockchain Verification Certificate */}
        <div className="lg:col-span-3">
          {activeProperty && isVerified ? (
            <Card className="relative overflow-hidden border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-background p-6 md:p-8 shadow-xl rounded-2xl flex flex-col justify-between min-h-[460px]">
              
              {/* Premium Background Artifact elements */}
              <div className="absolute top-0 right-0 h-48 w-48 bg-amber-500/5 rounded-full filter blur-3xl -z-10" />
              <div className="absolute bottom-0 left-0 h-32 w-32 bg-primary/5 rounded-full filter blur-2xl -z-10" />

              {/* Certificate Header */}
              <div className="border-b-2 border-amber-500/20 pb-4 space-y-2 text-center">
                <div className="flex justify-center">
                  <div className="rounded-full bg-amber-500/15 p-3.5 border-2 border-amber-500/30 text-amber-500 shadow-md">
                    <Award className="h-8 w-8 text-amber-500" />
                  </div>
                </div>
                <div>
                  <h2 className="text-base font-extrabold tracking-widest text-amber-500 uppercase">
                    Certificate of Registry Title Deed
                  </h2>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                    Immutable Smart Contract Title Proof
                  </p>
                </div>
              </div>

              {/* Certificate Details */}
              <div className="py-6 space-y-4 text-xs">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Property Chain Token ID</p>
                    <p className="font-mono text-sm font-bold text-foreground bg-background/50 border border-border/40 rounded px-2.5 py-1">
                      {activeProperty.chainId}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Title Registry Name</p>
                    <p className="font-bold text-foreground text-xs leading-normal bg-background/50 border border-border/40 rounded px-2.5 py-1.5 truncate">
                      {activeProperty.title}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Verified Deed Owner Wallet</p>
                  <p className="font-mono text-xs text-foreground bg-background/50 border border-border/40 rounded px-2.5 py-1 truncate">
                    {activeProperty.ownerWallet}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">GPS Coordinates</p>
                    <p className="font-mono text-xs text-foreground bg-background/50 border border-border/40 rounded px-2.5 py-1">
                      {activeProperty.location.lat.toFixed(4)}, {activeProperty.location.lng.toFixed(4)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Blockchain Ledger</p>
                    <p className="text-xs font-semibold text-foreground bg-background/50 border border-border/40 rounded px-2.5 py-1">
                      Polygon Amoy Testnet
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Verified Block</p>
                    <p className="font-mono text-xs text-foreground bg-background/50 border border-border/40 rounded px-2.5 py-1">
                      #{currentBlock.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border/30">
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                    <span className="uppercase tracking-wider font-semibold">Ledger Transaction Hash</span>
                    <Badge variant="outline" className="h-4 px-1 py-0 border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-[8px] font-bold uppercase">
                      Immutably Synced
                    </Badge>
                  </div>
                  <p className="font-mono text-[10px] text-muted-foreground bg-background/60 border border-border/30 rounded px-2.5 py-1 truncate select-all">
                    {activeProperty.verification.txHash ?? "0x7a892b0c34ef9a12c8b0c2d4e6f8a0a2b4c6d8e0f1122334455"}
                  </p>
                </div>
              </div>

              {/* Certificate Footer Stamp Seal */}
              <div className="border-t-2 border-amber-500/20 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Network className="h-8 w-8 text-amber-500/60" />
                  <div className="text-[10px] leading-tight">
                    <p className="font-bold text-foreground">CHAINESTATE PROTOCOL v1.0</p>
                    <p className="text-muted-foreground">Title Deed Verification Stamp</p>
                  </div>
                </div>
                <div className="rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-1 text-[9px] font-mono text-amber-600 dark:text-amber-500 text-center uppercase tracking-widest font-black">
                  SEAL OF IMMUTABILITY
                </div>
              </div>

            </Card>
          ) : (
            <Card className="border border-dashed border-border/80 bg-card/10 h-full flex flex-col items-center justify-center py-20 px-6 text-center">
              <Award className="h-14 w-14 text-muted-foreground/30 mb-3" />
              <h3 className="font-bold text-base text-foreground">No Verified Title Deed Loaded</h3>
              <p className="text-sm text-muted-foreground max-w-sm leading-normal mt-1">
                Select a bookmarked listing or paste a valid Property Chain ID on the left, then click "Verify Registry Oracle" to fetch the authenticated deed certificate.
              </p>
            </Card>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

export default function BuyerVerificationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground animate-pulse">Loading search params...</div>}>
      <VerificationContent />
    </Suspense>
  );
}
