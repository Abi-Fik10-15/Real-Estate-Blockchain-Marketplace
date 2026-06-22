import * as React from "react";
import { BadgeCheck, Clock, ExternalLink, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isOnChainTokenId, etherscanTxUrl, etherscanTokenUrl } from "@/lib/blockchain-utils";
import { CONTRACT_ADDRESS } from "@/lib/constants";
import { cn, formatDateTime, shortenAddress } from "@/lib/utils";
import type { Property } from "@/types";

export function OwnershipVerification({ property }: { property: Property }) {
  const isVerified = property.verification.status === "verified";
  const { verifiedAt, txHash } = property.verification;
  const tokenExplorer =
    isOnChainTokenId(property.chainId) && CONTRACT_ADDRESS
      ? etherscanTokenUrl(CONTRACT_ADDRESS, property.chainId)
      : "";

  return (
    <Card className="border-border/60 bg-card shadow-none">
      <CardHeader className="border-b border-border/40 px-4 pb-3 pt-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-primary">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/30 text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
          </span>
          Ownership Verification
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 px-4 pb-4 pt-3">
        <div className="divide-y divide-border/40">
          <Row
            label="Token ID"
            value={
              tokenExplorer ? (
                <a
                  href={tokenExplorer}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
                >
                  #{property.chainId}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                property.chainId
              )
            }
            mono
          />
          <Row
            label="Owner Wallet"
            value={shortenAddress(property.ownerWallet, 6)}
            mono
          />
          <Row
            label="Authorized Agent"
            value={
              property.agentWallet
                ? shortenAddress(property.agentWallet, 6)
                : "None assigned"
            }
            mono={!!property.agentWallet}
          />
          <Row
            label="Verification Time"
            value={
              verifiedAt ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  {formatDateTime(verifiedAt)}
                </span>
              ) : (
                "Pending"
              )
            }
          />
          {txHash && txHash !== "verified" && (
            <Row
              label="On-chain record"
              value={
                etherscanTxUrl(txHash) ? (
                  <a
                    href={etherscanTxUrl(txHash)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-primary hover:underline"
                  >
                    {shortenAddress(txHash, 8)}
                  </a>
                ) : (
                  shortenAddress(txHash, 8)
                )
              }
              mono
            />
          )}
        </div>

        <Badge
          variant="outline"
          className={cn(
            "flex w-full justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium",
            isVerified
              ? "border-emerald-200/80 bg-emerald-50/40 text-emerald-700 dark:border-emerald-800/80 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border-amber-200/80 bg-amber-50/40 text-amber-700 dark:border-amber-800/80 dark:bg-amber-950/40 dark:text-amber-300",
          )}
        >
          {isVerified ? (
            <>
              <BadgeCheck className="h-3.5 w-3.5" />
              Blockchain Verified
            </>
          ) : (
            <>
              <Clock className="h-3.5 w-3.5" />
              Verification Pending
            </>
          )}
        </Badge>
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("text-right text-sm", mono && "font-mono text-xs")}>
        {value}
      </span>
    </div>
  );
}
