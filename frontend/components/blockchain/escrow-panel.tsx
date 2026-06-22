"use client";

import * as React from "react";
import { Loader2, ShieldCheck, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { contractClient } from "@/lib/contract";
import { api } from "@/services/api";
import { useWalletStore } from "@/store/wallet-store";
import { usePropertyStore } from "@/store/property-store";
import { useInquiryStore } from "@/store/inquiry-store";
import { isOnChainTokenId, etherscanTxUrl } from "@/lib/blockchain-utils";
import { formatCurrency, shortenAddress } from "@/lib/utils";

type EscrowTx = {
  id: string;
  propertyId: string;
  buyerId: string;
  sellerId: string;
  type: string;
  amount: number;
  status: string;
  txHash: string;
  blockchainTokenId: string;
};

export function EscrowPanel({ transactions }: { transactions: EscrowTx[] }) {
  const queryClient = useQueryClient();
  const { wallet, connect, isConnecting } = useWalletStore();
  const properties = usePropertyStore((s) => s.properties);
  const fetchProperties = usePropertyStore((s) => s.fetchProperties);
  const fetchInquiries = useInquiryStore((s) => s.fetchInquiries);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const escrowPending = transactions.filter((t) => t.status === "escrow");

  const handleConfirm = async (tx: EscrowTx) => {
    if (!wallet) {
      try {
        await connect();
      } catch {
        toast.error("Connect your owner wallet in MetaMask first");
      }
      return;
    }

    setPendingId(tx.id);
    try {
      let confirmTxHash = `completed-${tx.id}`;

      if (tx.type === "rental") {
        await api.confirmSaleTransaction(tx.id, confirmTxHash);
      } else if (isOnChainTokenId(tx.blockchainTokenId)) {
        await contractClient.ensureSepolia();
        const result = await contractClient.confirmSale(tx.blockchainTokenId);
        confirmTxHash = result.txHash;
        await api.confirmSaleTransaction(tx.id, confirmTxHash);
      } else {
        await api.confirmSaleTransaction(tx.id, confirmTxHash);
      }

      await fetchProperties(true);
      await fetchInquiries();
      queryClient.invalidateQueries({ queryKey: ["transactions", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });

      toast.success(
        tx.type === "rental" ? "Rental confirmed" : "Sale confirmed on-chain",
        {
          description: confirmTxHash.startsWith("0x")
            ? `Tx ${shortenAddress(confirmTxHash, 8)}`
            : undefined,
        }
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Confirm sale failed");
    } finally {
      setPendingId(null);
    }
  };

  if (escrowPending.length === 0) {
    return (
      <Card className="border-border/60">
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-border/60">
            <ShieldCheck className="h-6 w-6 text-muted-foreground/40" />
          </div>
          <p className="text-sm text-muted-foreground">
            No pending escrows. When a buyer funds escrow, confirm the sale here to release funds and transfer the NFT.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="border-b border-border/60 pb-3">
        <CardTitle className="text-sm text-primary">Pending Confirmations</CardTitle>
        <CardDescription className="text-xs">
          {escrowPending.length} {escrowPending.length === 1 ? "escrow" : "escrows"} awaiting your confirmation
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/40">
          {escrowPending.map((tx) => {
            const prop = properties.find((p) => p.id === tx.propertyId);
            const explorer = etherscanTxUrl(tx.txHash);

            return (
              <div
                key={tx.id}
                className="flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-muted/20 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <p className="font-semibold">{prop?.title ?? "Property"}</p>
                  <p className="text-xs text-muted-foreground">
                    Token #{tx.blockchainTokenId} ·{" "}
                    <span className="font-semibold text-primary">{formatCurrency(tx.amount)}</span>
                    {tx.type === "rental" && <span className="text-muted-foreground">/mo</span>}
                  </p>
                  {tx.txHash && (
                    <p className="font-mono text-[11px] text-muted-foreground">
                      Escrow tx:{" "}
                      {explorer ? (
                        <a href={explorer} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                          {shortenAddress(tx.txHash, 10)}
                        </a>
                      ) : (
                        shortenAddress(tx.txHash, 10)
                      )}
                    </p>
                  )}
                  <Badge variant="warning" className="mt-1 text-xs">
                    Escrow funded — awaiting confirmation
                  </Badge>
                </div>
                <Button
                  size="sm"
                  className="shrink-0 gap-1.5"
                  disabled={pendingId === tx.id || isConnecting}
                  onClick={() => handleConfirm(tx)}
                >
                  {pendingId === tx.id ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Confirming...</>
                  ) : !wallet ? (
                    <><Wallet className="h-3.5 w-3.5" /> Connect Wallet</>
                  ) : (
                    <><ShieldCheck className="h-3.5 w-3.5" /> {tx.type === "rental" ? "Confirm Rental" : "Confirm Sale"}</>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
