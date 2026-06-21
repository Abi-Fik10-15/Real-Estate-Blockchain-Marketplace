"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePropertyStore } from "@/store/property-store";
import { useSavedStore } from "@/store/saved-store";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/services/api";
import { CONTRACT_ADDRESS } from "@/lib/constants";
import {
  etherscanTokenUrl,
  resolvePropertyTokenId,
} from "@/lib/blockchain-utils";
import { cn, formatCurrency, shortenAddress } from "@/lib/utils";
import {
  Search,
  ShieldCheck,
  Activity,
  BadgeCheck,
  Loader2,
  ExternalLink,
  Network,
  AlertCircle,
  Shield,
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

const VERIFY_STEPS = [
  {
    title: "Select a listing",
    description: "Choose a saved property or search by token / listing ID.",
  },
  {
    title: "Read on-chain data",
    description: "We fetch ownerOf() from the Sepolia smart contract.",
  },
  {
    title: "Compare records",
    description: "Listing metadata is matched against the on-chain deed owner.",
  },
  {
    title: "Certificate issued",
    description: "A verified status is saved to your dashboard history.",
  },
] as const;

function findPropertyByQuery(
  properties: Property[],
  query: string,
): Property | undefined {
  const q = query.trim().toLowerCase();
  return properties.find(
    (p) =>
      p.id === q ||
      p.chainId.toLowerCase() === q ||
      resolvePropertyTokenId(p.chainId) === q,
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/40 py-2 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "max-w-[55%] truncate text-right text-xs font-semibold text-foreground",
          mono && "font-mono",
        )}
      >
        {value}
      </span>
    </div>
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
  const [onChainSnapshot, setOnChainSnapshot] =
    React.useState<OnChainSnapshot | null>(null);
  const [networkLabel, setNetworkLabel] = React.useState("Ethereum Sepolia");

  const savedProperties = properties.filter((p) => savedIds.includes(p.id));
  const verifiedSavedCount = savedProperties.filter(
    (p) => p.verification.status === "verified",
  ).length;

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

  const handleSelectChange = (val: string) => {
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
      toast.error(
        "This listing is not minted on Sepolia yet (no on-chain token ID).",
      );
      return;
    }

    if (!CONTRACT_ADDRESS) {
      toast.error(
        "Smart contract is not configured (NEXT_PUBLIC_CONTRACT_ADDRESS).",
      );
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
        throw new Error(
          "Backend blockchain service is not connected to Sepolia.",
        );
      }

      setNetworkLabel(`${status.network} (chain ${status.chainId})`);
      appendLog(`Contract: ${shortenAddress(status.contractAddress, 8)}`);
      appendLog(`On-chain owner: ${shortenAddress(onChain.owner, 10)}`);

      const listingOwner = property.ownerWallet?.toLowerCase();
      const onChainOwner = onChain.owner.toLowerCase();

      if (listingOwner) {
        appendLog(
          `Listing owner wallet: ${shortenAddress(property.ownerWallet, 10)}`,
        );
        if (listingOwner !== onChainOwner) {
          throw new Error(
            "Listing owner wallet does not match the on-chain deed owner. This deed may be misrepresented.",
          );
        }
        appendLog(
          "Listing metadata matches on-chain ownerOf() — deed is authentic.",
        );
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
      const message =
        error instanceof Error ? error.message : "Verification failed";
      appendLog(`Error: ${message}`);
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  const activeProperty = properties.find((p) => p.id === selectedPropId);
  const tokenId = activeProperty
    ? resolvePropertyTokenId(activeProperty.chainId)
    : null;
  const isVerified = activeProperty?.verification.status === "verified";
  const tokenExplorer =
    tokenId && CONTRACT_ADDRESS
      ? etherscanTokenUrl(CONTRACT_ADDRESS, tokenId)
      : "";

  return (
    <DashboardShell
      title="Ownership Verification"
      roleLabel="Buyer"
      nav={BUYER_NAV}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              <span className="text-primary">{verifiedSavedCount}</span> of{" "}
              {savedProperties.length} saved{" "}
              {savedProperties.length === 1 ? "property" : "properties"}{" "}
              verified on-chain
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Compare listing metadata with Sepolia ERC-721 ownership records
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/buyer/saved">View saved</Link>
          </Button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(280px,320px)_1fr]">
          <div className="space-y-4">
            <Card className="border-border/60">
              <CardHeader className="border-b border-border/40 pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Search className="h-4 w-4" />
                  Select listing to verify
                </CardTitle>
                <CardDescription className="text-xs">
                  Pick a saved property or search by token / listing ID
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="dropdown-select"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Saved listings
                  </Label>
                  <Select
                    value={selectedPropId || undefined}
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger id="dropdown-select" className="h-9 text-xs">
                      <SelectValue placeholder="Choose saved property" />
                    </SelectTrigger>
                    <SelectContent>
                      {savedProperties.length === 0 ? (
                        <SelectItem value="__none" disabled>
                          No saved properties
                        </SelectItem>
                      ) : (
                        savedProperties.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.chainId} — {p.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <form
                  onSubmit={handleSearchSubmit}
                  className="space-y-2 border-t border-border/40 pt-4"
                >
                  <Label
                    htmlFor="search-id"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Or search by token / listing ID
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="search-id"
                      placeholder="e.g. 1 or EST-ABC123"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9 text-xs"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      variant="outline"
                      className="h-9 shrink-0 px-4 text-xs"
                    >
                      Load
                    </Button>
                  </div>
                </form>

                {activeProperty && (
                  <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                    <DetailRow label="Title" value={activeProperty.title} />
                    <DetailRow
                      label="Price"
                      value={formatCurrency(activeProperty.price)}
                    />
                    <DetailRow
                      label="On-chain token"
                      value={tokenId ?? "Not minted"}
                      mono
                    />
                    <div className="flex items-center justify-between gap-3 pt-2">
                      <span className="text-xs text-muted-foreground">
                        Status
                      </span>
                      <Badge
                        variant={isVerified ? "verified" : "warning"}
                        className="text-[10px]"
                      >
                        {isVerified ? "Verified" : "Not verified"}
                      </Badge>
                    </div>
                    {!tokenId && (
                      <p className="mt-3 flex items-start gap-1.5 rounded-md bg-amber-500/10 px-2.5 py-2 text-[11px] text-amber-700 dark:text-amber-400">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        Only minted Sepolia NFTs can be verified on-chain.
                      </p>
                    )}
                  </div>
                )}

                {activeProperty && (
                  <Button
                    className="w-full text-xs"
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
              </CardContent>
            </Card>

            {(isVerifying || verifyLogs.length > 0) && (
              <Card className="overflow-hidden border-border/60 bg-zinc-950 font-mono text-zinc-300">
                <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-800 py-3">
                  <CardTitle className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
                    <Activity className="h-3.5 w-3.5 text-emerald-500" />
                    Verification log
                  </CardTitle>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-500">
                    LIVE
                  </span>
                </CardHeader>
                <CardContent className="max-h-52 space-y-1.5 overflow-y-auto p-3 text-[10px] leading-relaxed">
                  {verifyLogs.map((log, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-start gap-2",
                        log.startsWith("Error:")
                          ? "text-red-400"
                          : "text-emerald-400",
                      )}
                    >
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

            <Card className="border-border/60 bg-muted/20">
              <CardHeader className="border-b border-border/40 pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Shield className="h-4 w-4" />
                  How it works
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ol className="relative space-y-4 border-l border-primary/20 pl-4">
                  {VERIFY_STEPS.map((step, index) => (
                    <li key={step.title} className="relative">
                      <span
                        className={cn(
                          "absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full border-2 border-background",
                          index === VERIFY_STEPS.length - 1
                            ? "bg-emerald-500"
                            : "bg-primary",
                        )}
                      />
                      <p className="text-xs font-semibold text-foreground">
                        {index + 1}. {step.title}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>

          <div className="min-w-0">
            {activeProperty && isVerified ? (
              <Card className="overflow-hidden border-border/60">
                <div className="border-b border-emerald-200/60 bg-emerald-50/50 px-6 py-5 text-center dark:border-emerald-900/40 dark:bg-emerald-950/20">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                    <BadgeCheck className="h-7 w-7" />
                  </div>
                  <h2 className="mt-3 text-base font-semibold text-primary">
                    On-chain deed verified
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    ownerOf() matched listing metadata on Sepolia
                  </p>
                </div>

                <CardContent className="space-y-5 p-5 sm:p-6">
                  <div className="flex gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                    <img
                      src={activeProperty.images[0]}
                      alt={activeProperty.title}
                      className="h-16 w-24 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {activeProperty.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {activeProperty.location.city},{" "}
                        {activeProperty.location.country}
                      </p>
                      <p className="mt-1 text-sm font-bold text-primary">
                        {formatCurrency(activeProperty.price)}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        Token ID
                      </p>
                      <p className="mt-1 font-mono text-sm font-semibold">
                        #{tokenId}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        Network
                      </p>
                      <p className="mt-1 text-xs font-semibold capitalize">
                        {networkLabel}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Verified on-chain owner
                    </p>
                    <p className="mt-1 truncate font-mono text-xs">
                      {onChainSnapshot?.owner ?? activeProperty.ownerWallet}
                    </p>
                  </div>

                  {onChainSnapshot?.inEscrow && (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400">
                      In escrow — buyer{" "}
                      {shortenAddress(onChainSnapshot.escrowBuyer, 8)},{" "}
                      {onChainSnapshot.escrowAmount} ETH locked
                    </div>
                  )}

                  <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Verified at
                    </p>
                    <p className="mt-1 text-xs">
                      {activeProperty.verification.verifiedAt
                        ? new Date(
                            activeProperty.verification.verifiedAt,
                          ).toLocaleString()
                        : "—"}
                    </p>
                  </div>

                  {tokenExplorer && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      asChild
                    >
                      <a
                        href={tokenExplorer}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View NFT on Etherscan
                        <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-4">
                    <div className="flex items-center gap-2">
                      <Network className="h-5 w-5 text-muted-foreground" />
                      <div className="text-[11px] leading-tight">
                        <p className="font-semibold">ChainEstate · Sepolia</p>
                        <p className="text-muted-foreground">
                          Read-only deed verification
                        </p>
                      </div>
                    </div>
                    <Badge variant="verified" className="text-[10px]">
                      On-chain verified
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-20 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                  <ShieldCheck className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-primary">
                  No verified deed yet
                </h3>
                <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                  Select a minted listing and click{" "}
                  <strong className="font-medium text-foreground">
                    Verify on Sepolia
                  </strong>{" "}
                  to compare the listing owner with the on-chain ERC-721 record.
                </p>
                {!CONTRACT_ADDRESS && (
                  <p className="mt-4 text-xs text-amber-600">
                    Set{" "}
                    <code className="rounded bg-muted px-1">
                      NEXT_PUBLIC_CONTRACT_ADDRESS
                    </code>{" "}
                    in frontend/.env
                  </p>
                )}
                {savedProperties.length === 0 && (
                  <Button size="sm" className="mt-5" asChild>
                    <Link href="/dashboard/buyer/marketplace">
                      Browse listings
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

export default function BuyerVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-8">
          <div className="h-12 animate-pulse rounded-xl bg-muted" />
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="h-80 animate-pulse rounded-xl bg-muted" />
            <div className="h-80 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      }
    >
      <VerificationContent />
    </Suspense>
  );
}
