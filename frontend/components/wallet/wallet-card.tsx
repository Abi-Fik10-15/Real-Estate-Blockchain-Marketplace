"use client";

import { Check, Wallet as WalletIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useWalletStore } from "@/store/wallet-store";
import { SEPOLIA_CHAIN_ID } from "@/lib/constants";
import { shortenAddress } from "@/lib/utils";

/** Detailed wallet status card used on auth pages and dashboards. */
export function WalletCard() {
  const { wallet, isConnecting, connect, disconnect } = useWalletStore();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <WalletIcon className="h-5 w-5 text-primary" /> Wallet
        </CardTitle>
        {wallet ? (
          <Badge variant="success">
            <Check className="h-3 w-3" /> Connected
          </Badge>
        ) : (
          <Badge variant="outline">Disconnected</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {wallet ? (
          <>
            <Row label="Wallet" value={shortenAddress(wallet.address, 6)} mono />
            <Separator />
            <Row label="Network" value={wallet.network} />
            <Separator />
            <Row
              label="Balance"
              value={`${wallet.balance} ${wallet.chainId === SEPOLIA_CHAIN_ID || wallet.chainId === 1 ? "ETH" : "ETH"}`}
            />
            <Separator />
            <Row
              label="Status"
              value={
                <span className="flex items-center gap-1.5 text-success">
                  <span className="h-2 w-2 rounded-full bg-success" /> Connected
                </span>
              }
            />
            <Button variant="outline" className="w-full" onClick={() => disconnect()}>
              Disconnect Wallet
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow">
              <WalletIcon className="h-7 w-7" />
            </div>
            <p className="text-sm text-muted-foreground">
              Connect your wallet to verify ownership and sign transactions.
            </p>
            <Button
              type="button"
              variant="hero"
              className="w-full"
              disabled={isConnecting}
              onClick={async () => {
                try {
                  await connect();
                  toast.success("Wallet connected on Sepolia");
                } catch (error) {
                  toast.error(
                    error instanceof Error ? error.message : "Failed to connect wallet",
                  );
                }
              }}
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          </div>
        )}
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
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono" : "font-medium"}>{value}</span>
    </div>
  );
}
