"use client";

import * as React from "react";
import { BadgeCheck, Clock, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { mockBlockchain } from "@/services/mock-blockchain";
import { formatDateTime, shortenAddress } from "@/lib/utils";
import type { Property } from "@/types";

export function OwnershipVerification({ property }: { property: Property }) {
  const [verifying, setVerifying] = React.useState(false);
  const [verifiedAt, setVerifiedAt] = React.useState(property.verification.verifiedAt);
  const [txHash, setTxHash] = React.useState(property.verification.txHash);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const event = await mockBlockchain.verifyOwnership(property.chainId);
      setVerifiedAt(event.timestamp);
      setTxHash(event.txHash);
      toast.success("Ownership verified on-chain", {
        description: `Tx ${shortenAddress(event.txHash, 8)}`,
      });
    } catch {
      toast.error("Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Card className="border-success/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-success" /> Ownership Verification
          </span>
          <Badge variant="verified">
            <BadgeCheck className="h-3 w-3" /> Blockchain Verified
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <Row label="Property ID" value={property.chainId} mono />
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
        {txHash && (
          <>
            <Separator />
            <Row label="Tx Hash" value={shortenAddress(txHash, 8)} mono />
          </>
        )}
        <Button variant="success" className="mt-2 w-full" onClick={handleVerify} disabled={verifying}>
          {verifying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Verifying on-chain...
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
