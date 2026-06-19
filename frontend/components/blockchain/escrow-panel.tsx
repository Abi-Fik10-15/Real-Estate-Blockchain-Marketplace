"use client";

import * as React from "react";
import { Loader2, ShieldCheck, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { contractClient } from "@/lib/contract";
import { api } from "@/services/api";
import { useWalletStore } from "@/store/wallet-store";
import { usePropertyStore } from "@/store/property-store";
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
      <Card className="border-dashed border-border/80">
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No pending escrows. When a buyer funds escrow, confirm the sale here to release funds and transfer the NFT.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {escrowPending.map((tx) => {
        const prop = properties.find((p) => p.id === tx.propertyId);
        const explorer = etherscanTxUrl(tx.txHash);

        return (
          <Card key={tx.id} className="border-border/60">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <p className="font-semibold">{prop?.title ?? "Property"}</p>
                <p className="text-xs text-muted-foreground">
                  Token #{tx.blockchainTokenId} · {formatCurrency(tx.amount)}
                </p>
                {tx.txHash && (
                  <p className="font-mono text-[11px] text-muted-foreground">
                    Escrow tx:{" "}
                    {explorer ? (
                      <a
                        href={explorer}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline"
                      >
                        {shortenAddress(tx.txHash, 10)}
                      </a>
                    ) : (
                      shortenAddress(tx.txHash, 10)
                    )}
                  </p>
                )}
                <Badge variant="warning" className="mt-1">
                  Escrow funded — awaiting your confirmation
                </Badge>
              </div>
              <Button
                variant="hero"
                size="sm"
                className="shrink-0 gap-1.5"
                disabled={pendingId === tx.id || isConnecting}
                onClick={() => handleConfirm(tx)}
              >
                {pendingId === tx.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Confirming...
                  </>
                ) : !wallet ? (
                  <>
                    <Wallet className="h-4 w-4" /> Connect Wallet
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />{" "}
                    {tx.type === "rental" ? "Confirm Rental" : "Confirm Sale"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
