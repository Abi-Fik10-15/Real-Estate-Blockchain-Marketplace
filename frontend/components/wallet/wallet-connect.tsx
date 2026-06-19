"use client";

import * as React from "react";
import { Check, Copy, LogOut, Wallet as WalletIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useWalletStore } from "@/store/wallet-store";
import { SEPOLIA_CHAIN_ID } from "@/lib/constants";
import { shortenAddress } from "@/lib/utils";

export function WalletConnect({
  size = "default",
  variant = "hero",
}: {
  size?: "default" | "sm" | "lg";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "hero";
}) {
  const { wallet, isConnecting, hasHydrated, connect, disconnect, bindListeners } =
    useWalletStore();
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    bindListeners();
  }, [bindListeners]);

  const handleConnect = async () => {
    try {
      await connect();
      toast.success("Wallet connected on Sepolia");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to connect wallet");
    }
  };

  const handleCopy = async () => {
    if (!wallet) return;
    await navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    toast.success("Wallet address copied");
    setTimeout(() => setCopied(false), 1500);
  };

  if (!hasHydrated) {
    return (
      <Button variant={variant} size={size} type="button" disabled>
        <WalletIcon className="h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  if (!wallet) {
    return (
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={handleConnect}
        disabled={isConnecting}
      >
        <WalletIcon className="h-4 w-4" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    );
  }

  const onSepolia = wallet.chainId === SEPOLIA_CHAIN_ID;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size={size} className="gap-2">
          <span
            className={`h-2 w-2 rounded-full ${onSepolia ? "bg-success" : "bg-amber-500"}`}
          />
          {shortenAddress(wallet.address)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Wallet</span>
          <Badge variant={onSepolia ? "success" : "warning"}>
            <Check className="h-3 w-3" /> {onSepolia ? "Sepolia" : "Wrong network"}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="space-y-3 px-2 py-2 text-sm">
          {!onSepolia && (
            <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-xs text-amber-700 dark:text-amber-400">
              Switch MetaMask to <strong>Sepolia</strong> for on-chain actions.
            </p>
          )}
          <div>
            <p className="text-xs text-muted-foreground">Address</p>
            <button
              type="button"
              onClick={handleCopy}
              className="mt-0.5 flex w-full items-center justify-between rounded-md bg-muted px-2 py-1.5 font-mono text-xs hover:bg-muted/70"
            >
              {shortenAddress(wallet.address, 6)}
              {copied ? (
                <Check className="h-3.5 w-3.5 text-success" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Network</p>
              <p className="font-medium">{wallet.network}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className="font-medium">{wallet.balance} ETH</p>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => {
            disconnect();
            toast.info("Wallet disconnected");
          }}
        >
          <LogOut className="h-4 w-4" /> Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
