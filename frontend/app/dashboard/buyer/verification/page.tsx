"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { BUYER_NAV } from "@/components/dashboard/nav-configs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { usePropertyStore } from "@/store/property-store";
import { useSavedStore } from "@/store/saved-store";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/services/api";
import { CONTRACT_ADDRESS } from "@/lib/constants";
import {
  etherscanTokenUrl,
  resolvePropertyTokenId,
} from "@/lib/blockchain-utils";
import { formatCurrency, shortenAddress } from "@/lib/utils";
import {
  Search,
  ShieldCheck,
  Activity,
  Award,
  Loader2,
  ExternalLink,
  Network,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { Property } from "@/types";

type OnChainSnapshot = {
  owner: string;
  tokenURI: string;
  inEscrow: boolean;
  escrowBuyer: string;
  escrowAmount: string;
};

function findPropertyByQuery(properties: Property[], query: string): Property | undefined {
  const q = query.trim().toLowerCase();
  return properties.find(
    (p) =>
      p.id === q ||
      p.chainId.toLowerCase() === q ||
      resolvePropertyTokenId(p.chainId) === q,
  );
}

function VerificationContent() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id");
  const queryClient = useQueryClient();

  const { properties, updateProperty } = usePropertyStore();
  const savedIds = useSavedStore((s) => s.savedIds);
  const user = useAuthStore((s) => s.user);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedPropId, setSelectedPropId] = React.useState("");
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [verifyLogs, setVerifyLogs] = React.useState<string[]>([]);
  const [onChainSnapshot, setOnChainSnapshot] = React.useState<OnChainSnapshot | null>(null);
  const [networkLabel, setNetworkLabel] = React.useState("Ethereum Sepolia");

  const savedProperties = properties.filter((p) => savedIds.includes(p.id));

  React.useEffect(() => {
    if (queryId) {
      const match = findPropertyByQuery(properties, queryId);
      if (match) {
        setSelectedPropId(match.id);
        setSearchQuery(match.chainId);
      }
    }
  }, [queryId, properties]);

  const appendLog = (message: string) => {
    setVerifyLogs((prev) => [...prev, message]);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const match = findPropertyByQuery(properties, searchQuery);
    if (match) {
      setSelectedPropId(match.id);
      setOnChainSnapshot(null);
      toast.success(`Loaded ${match.title}`);
    } else {
      toast.error(`No listing found for "${searchQuery}"`);
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedPropId(val);
    setOnChainSnapshot(null);
    const match = properties.find((p) => p.id === val);
    if (match) setSearchQuery(match.chainId);
  };

  const handleOnChainVerify = async () => {
    const property = properties.find((p) => p.id === selectedPropId);
    if (!property) return;

    const tokenId = resolvePropertyTokenId(property.chainId);
    if (!tokenId) {
      toast.error("This listing is not minted on Sepolia yet (no on-chain token ID).");
      return;
    }

    if (!CONTRACT_ADDRESS) {
      toast.error("Smart contract is not configured (NEXT_PUBLIC_CONTRACT_ADDRESS).");
      return;
    }

    setIsVerifying(true);
    setVerifyLogs([]);
    setOnChainSnapshot(null);

    try {
      appendLog(`Reading ERC-721 token #${tokenId} on Sepolia…`);
      const [status, onChain] = await Promise.all([
        api.getBlockchainStatus(),
        api.getOnChainToken(tokenId),
      ]);

      if (!status.enabled) {
        throw new Error("Backend blockchain service is not connected to Sepolia.");
      }

      setNetworkLabel(`${status.network} (chain ${status.chainId})`);
      appendLog(`Contract: ${shortenAddress(status.contractAddress, 8)}`);
      appendLog(`On-chain owner: ${shortenAddress(onChain.owner, 10)}`);

      const listingOwner = property.ownerWallet?.toLowerCase();
      const onChainOwner = onChain.owner.toLowerCase();

      if (listingOwner) {
        appendLog(`Listing owner wallet: ${shortenAddress(property.ownerWallet, 10)}`);
        if (listingOwner !== onChainOwner) {
          throw new Error(
            "Listing owner wallet does not match the on-chain deed owner. This deed may be misrepresented.",
          );
        }
        appendLog("Listing metadata matches on-chain ownerOf() — deed is authentic.");
      } else {
        const valid = await api.verifyOwnershipOnChain(onChain.owner, tokenId);
        if (!valid) throw new Error("Could not confirm on-chain ownership.");
        appendLog("On-chain token exists and ownership record is valid.");
      }

      if (onChain.inEscrow) {
        appendLog(
          `Note: token is in escrow (buyer ${shortenAddress(onChain.escrowBuyer, 8)}, ${onChain.escrowAmount} ETH).`,
        );
      }

      const verifiedAt = new Date().toISOString();
      const recordRef = `sepolia:token:${tokenId}`;

      await updateProperty(property.id, {
        ownerWallet: onChain.owner,
        verification: {
          status: "verified",
          verifiedAt,
          txHash: recordRef,
        },
        history: [
          {
            id: `ev-${Date.now()}`,
            type: "verification",
            description: `Buyer ${user?.name ?? "user"} verified deed against Sepolia contract`,
            txHash: recordRef,
            actor: user?.walletAddress || onChain.owner,
            timestamp: verifiedAt,
          },
          ...property.history,
        ],
      });

      setOnChainSnapshot(onChain);
      localStorage.setItem("chainestate_verified_at_least_once", "true");
      queryClient.invalidateQueries({ queryKey: ["property", property.id] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });

      appendLog("Verification complete — deed matches Sepolia registry.");
      toast.success("Property deed verified on Sepolia");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Verification failed";
      appendLog(`Error: ${message}`);
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  const activeProperty = properties.find((p) => p.id === selectedPropId);
  const tokenId = activeProperty ? resolvePropertyTokenId(activeProperty.chainId) : null;
  const isVerified = activeProperty?.verification.status === "verified";
  const tokenExplorer =
    tokenId && CONTRACT_ADDRESS ? etherscanTokenUrl(CONTRACT_ADDRESS, tokenId) : "";

  return (
    <DashboardShell title="Ownership Verification" roleLabel="Buyer / Renter" nav={BUYER_NAV}>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border border-border/80 bg-card/30 shadow-md backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Search className="h-4 w-4 text-primary" />
                Select listing to verify
              </CardTitle>
              <CardDescription className="text-xs">
                Pick a saved property or search by database ID / on-chain token ID
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="dropdown-select" className="text-xs font-semibold text-muted-foreground">
                  Saved listings
                </Label>
                <select
                  id="dropdown-select"
                  className="w-full cursor-pointer rounded-xl border border-border/80 bg-background/50 px-3 py-2.5 text-xs shadow-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={selectedPropId}
                  onChange={handleSelectChange}
                >
                  <option value="">— Choose saved property —</option>
                  {savedProperties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.chainId} — {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <form onSubmit={handleSearchSubmit} className="space-y-2.5 border-t border-border/30 pt-2">
                <Label htmlFor="search-id" className="text-xs font-semibold text-muted-foreground">
                  Or search by token / listing ID
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="search-id"
                    placeholder="e.g. 1 or EST-ABC123"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 rounded-xl bg-background/50 text-xs"
                  />
                  <Button type="submit" size="sm" variant="outline" className="h-9 shrink-0 rounded-xl px-4 text-xs">
                    Load
                  </Button>
                </div>
              </form>

              {activeProperty && (
                <div className="mt-3 space-y-3 rounded-xl border border-border/40 bg-background/40 p-4 text-xs shadow-inner">
                  <div className="flex items-center justify-between border-b border-border/20 pb-2">
                    <span className="font-medium text-muted-foreground">Title</span>
                    <span className="max-w-[150px] truncate font-bold">{activeProperty.title}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/20 pb-2">
                    <span className="font-medium text-muted-foreground">Price</span>
                    <span className="font-semibold">{formatCurrency(activeProperty.price)}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/20 pb-2">
                    <span className="font-medium text-muted-foreground">On-chain token</span>
                    <span className="font-mono">{tokenId ?? "Not minted"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-muted-foreground">Status</span>
                    <Badge variant={isVerified ? "verified" : "warning"} className="h-5 px-2 py-0 text-[10px]">
                      {isVerified ? "Verified" : "Not verified"}
                    </Badge>
                  </div>
                  {!tokenId && (
                    <p className="flex items-start gap-1.5 text-amber-600 dark:text-amber-400">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      Only minted Sepolia NFTs can be verified on-chain.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {(isVerifying || verifyLogs.length > 0) && (
            <Card className="overflow-hidden border border-border/80 bg-zinc-950 font-mono text-zinc-300 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-800 bg-zinc-900/50 pb-2.5">
                <CardTitle className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
                  <Activity className="h-3.5 w-3.5 text-emerald-500" />
                  SEPOLIA VERIFICATION LOG
                </CardTitle>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold tracking-widest text-emerald-500">
                  LIVE RPC
                </span>
              </CardHeader>
              <CardContent className="max-h-56 space-y-2 overflow-y-auto p-3 text-[10px] leading-relaxed">
                {verifyLogs.map((log, index) => (
                  <div key={index} className="flex items-start gap-2 text-emerald-500">
                    <span className="text-zinc-600">[{index + 1}]</span>
                    <span>{log}</span>
                  </div>
                ))}
                {isVerifying && (
                  <div className="flex items-center gap-2 pt-1 text-primary">
                    <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
                    <span>Querying Sepolia…</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeProperty && (
            <Button
              variant="hero"
              className="w-full rounded-xl py-2 text-xs shadow-md shadow-primary/20"
              onClick={handleOnChainVerify}
              disabled={isVerifying || !tokenId}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Verifying on Sepolia…
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-1.5 h-4 w-4" />
                  Verify on Sepolia
                </>
              )}
            </Button>
          )}
        </div>

        <div className="lg:col-span-3">
          {activeProperty && isVerified ? (
            <Card className="relative flex min-h-[460px] flex-col justify-between overflow-hidden rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-background p-6 shadow-xl md:p-8">
              <div className="absolute -z-10 right-0 top-0 h-48 w-48 rounded-full bg-amber-500/5 blur-3xl" />

              <div className="space-y-2 border-b-2 border-amber-500/20 pb-4 text-center">
                <div className="flex justify-center">
                  <div className="rounded-full border-2 border-amber-500/30 bg-amber-500/15 p-3.5 text-amber-500 shadow-md">
                    <Award className="h-8 w-8" />
                  </div>
                </div>
                <h2 className="text-base font-extrabold uppercase tracking-widest text-amber-500">
                  Sepolia Deed Verification
                </h2>
                <p className="mt-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                  On-chain ownerOf() matched listing metadata
                </p>
              </div>

              <div className="mt-4 flex flex-col items-center gap-3.5 rounded-xl border border-border/40 bg-background/40 p-3.5 sm:flex-row">
                <img
                  src={activeProperty.images[0]}
                  alt={activeProperty.title}
                  className="h-16 w-24 shrink-0 rounded-lg border border-border/60 object-cover shadow-sm"
                />
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-extrabold">{activeProperty.title}</p>
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                    {activeProperty.location.address}, {activeProperty.location.city}
                  </p>
                  <p className="mt-1 text-[11px] font-bold text-primary">
                    {formatCurrency(activeProperty.price)}
                  </p>
                </div>
              </div>

              <div className="space-y-4 py-6 text-xs">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Token ID
                    </p>
                    <p className="rounded border border-border/40 bg-background/50 px-2.5 py-1 font-mono text-sm font-bold">
                      #{tokenId}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Network
                    </p>
                    <p className="rounded border border-border/40 bg-background/50 px-2.5 py-1.5 text-xs font-bold capitalize">
                      {networkLabel}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Verified on-chain owner
                  </p>
                  <p className="truncate rounded border border-border/40 bg-background/50 px-2.5 py-1 font-mono text-xs">
                    {onChainSnapshot?.owner ?? activeProperty.ownerWallet}
                  </p>
                </div>

                {onChainSnapshot?.inEscrow && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-[11px] text-amber-700 dark:text-amber-400">
                    In escrow — buyer {shortenAddress(onChainSnapshot.escrowBuyer, 8)},{" "}
                    {onChainSnapshot.escrowAmount} ETH locked
                  </div>
                )}

                <div className="space-y-1.5 border-t border-border/30 pt-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Verified at
                  </p>
                  <p className="text-xs text-foreground">
                    {activeProperty.verification.verifiedAt
                      ? new Date(activeProperty.verification.verifiedAt).toLocaleString()
                      : "—"}
                  </p>
                </div>

                {tokenExplorer && (
                  <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                    <a href={tokenExplorer} target="_blank" rel="noreferrer">
                      View NFT on Etherscan
                      <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
              </div>

              <div className="flex flex-col items-center justify-between gap-4 border-t-2 border-amber-500/20 pt-4 sm:flex-row">
                <div className="flex items-center gap-2">
                  <Network className="h-8 w-8 text-amber-500/60" />
                  <div className="text-[10px] leading-tight">
                    <p className="font-bold">ChainEstate · Sepolia</p>
                    <p className="text-muted-foreground">Read-only deed verification</p>
                  </div>
                </div>
                <Badge variant="verified" className="px-3 py-1">
                  On-chain verified
                </Badge>
              </div>
            </Card>
          ) : (
            <Card className="flex h-full flex-col items-center justify-center border border-dashed border-border/80 bg-card/10 px-6 py-20 text-center">
              <Award className="mb-3 h-14 w-14 text-muted-foreground/30" />
              <h3 className="text-base font-bold">No verified deed yet</h3>
              <p className="mt-1 max-w-sm text-sm leading-normal text-muted-foreground">
                Select a minted listing and click <strong>Verify on Sepolia</strong> to compare the
                listing owner wallet with the ERC-721 owner on-chain.
              </p>
              {!CONTRACT_ADDRESS && (
                <p className="mt-4 text-xs text-amber-600">
                  Set <code className="rounded bg-muted px-1">NEXT_PUBLIC_CONTRACT_ADDRESS</code> in
                  frontend/.env
                </p>
              )}
            </Card>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

export default function BuyerVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse p-8 text-center text-xs text-muted-foreground">
          Loading…
        </div>
      }
    >
      <VerificationContent />
    </Suspense>
  );
}
