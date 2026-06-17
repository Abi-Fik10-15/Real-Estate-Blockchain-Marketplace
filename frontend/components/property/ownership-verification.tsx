"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Clock, ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { contractClient } from "@/lib/contract";
import { api } from "@/services/api";
import { usePropertyStore } from "@/store/property-store";
import { useWalletStore } from "@/store/wallet-store";
import { isOnChainTokenId, etherscanTxUrl, etherscanTokenUrl } from "@/lib/blockchain-utils";
import { CONTRACT_ADDRESS } from "@/lib/constants";
import { formatDateTime, shortenAddress } from "@/lib/utils";
import type { Property } from "@/types";

export function OwnershipVerification({ property }: { property: Property }) {
  const queryClient = useQueryClient();
  const { wallet, connect, isConnecting } = useWalletStore();
  const updateProperty = usePropertyStore((s) => s.updateProperty);

  const [verifying, setVerifying] = React.useState(false);
  const [verifiedAt, setVerifiedAt] = React.useState(property.verification.verifiedAt);
  const [txHash, setTxHash] = React.useState(property.verification.txHash);

  React.useEffect(() => {
    setVerifiedAt(property.verification.verifiedAt);
    setTxHash(property.verification.txHash);
  }, [property]);

  const handleVerify = async () => {
    if (!wallet) {
      try {
        await connect();
        toast.success("Wallet connected");
      } catch {
        toast.error("Wallet connection failed");
      }
      return;
    }

    setVerifying(true);
    try {
      const tokenId = property.chainId;

      if (!isOnChainTokenId(tokenId)) {
        throw new Error("Property is not minted on-chain yet — create listing with blockchain enabled");
      }

      const isOwner = await contractClient.verifyOwnership(tokenId, wallet.address);
      if (!isOwner) {
        const apiVerified = await api.verifyOwnershipOnChain(wallet.address, tokenId);
        if (!apiVerified) {
          throw new Error("On-chain owner does not match your connected wallet");
        }
      }

      const onChain = await contractClient.getOnChainProperty(tokenId);
      const timestamp = new Date().toISOString();
      const recordHash = onChain ? `owner:${onChain.owner.slice(0, 10)}` : "verified";

      setVerifiedAt(timestamp);
      setTxHash(recordHash);

      await updateProperty(property.id, {
        ownerWallet: onChain?.owner ?? wallet.address,
        verification: {
          status: "verified",
          verifiedAt: timestamp,
          txHash: recordHash,
        },
      });

      queryClient.invalidateQueries({ queryKey: ["property", property.id] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });

      toast.success("Ownership verified on-chain");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const isVerified = property.verification.status === "verified";
  const tokenExplorer =
    isOnChainTokenId(property.chainId) && CONTRACT_ADDRESS
      ? etherscanTokenUrl(CONTRACT_ADDRESS, property.chainId)
      : "";

  return (
    <Card className={isVerified ? "border-success/30 glass-card" : "border-amber-500/20 glass-card"}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <span className="flex items-center gap-2">
            <ShieldCheck className={isVerified ? "h-5 w-5 text-success" : "h-5 w-5 text-amber-500"} /> Ownership Verification
          </span>
          <Badge variant={isVerified ? "verified" : "warning"}>
            {isVerified ? (
              <>
                <BadgeCheck className="h-3 w-3" /> Blockchain Verified
              </>
            ) : (
              <>
                <Clock className="h-3 w-3" /> Verification Pending
              </>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <Row
          label="Token ID"
          value={
            tokenExplorer ? (
              <a href={tokenExplorer} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline font-mono text-xs">
                #{property.chainId}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              property.chainId
            )
          }
          mono
        />
        <Separator />
        <Row label="Owner Wallet" value={shortenAddress(property.ownerWallet, 6)} mono />
        <Separator />
        <Row
          label="Authorized Agent"
          value={
            property.agentWallet ? shortenAddress(property.agentWallet, 6) : "None assigned"
          }
          mono={!!property.agentWallet}
        />
        <Separator />
        <Row
          label="Verification Time"
          value={
            verifiedAt ? (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> {formatDateTime(verifiedAt)}
              </span>
            ) : (
              "Pending"
            )
          }
        />
        {txHash && txHash !== "verified" && (
          <>
            <Separator />
            <Row
              label="On-chain record"
              value={
                etherscanTxUrl(txHash) ? (
                  <a href={etherscanTxUrl(txHash)} target="_blank" rel="noreferrer" className="text-primary hover:underline font-mono text-xs">
                    {shortenAddress(txHash, 8)}
                  </a>
                ) : (
                  shortenAddress(txHash, 8)
                )
              }
              mono
            />
          </>
        )}
        <Button
          variant={isVerified ? "success" : "hero"}
          className="mt-2 w-full shadow-soft"
          onClick={handleVerify}
          disabled={verifying || isConnecting}
        >
          {verifying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Verifying on-chain...
            </>
          ) : isConnecting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Connecting wallet...
            </>
          ) : !wallet ? (
            <>
              <ShieldCheck className="h-4 w-4" /> Connect Wallet to Verify
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" /> Verify Ownership
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-xs" : "font-medium"}>{value}</span>
    </div>
  );
}
