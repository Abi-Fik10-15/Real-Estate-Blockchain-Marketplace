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
import { shortenAddress } from "@/lib/utils";

export function WalletConnect({
  size = "default",
  variant = "hero",
}: {
  size?: "default" | "sm" | "lg";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "hero";
}) {
  const { wallet, isConnecting, connect, disconnect } = useWalletStore();
  const [copied, setCopied] = React.useState(false);

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

  if (!wallet) {
    return (
      <Button
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

  const currency =
    wallet.chainId === 11155111 || wallet.chainId === 1 ? "ETH" : "MATIC";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size} className="gap-2">
          <span className="h-2 w-2 rounded-full bg-success" />
          {shortenAddress(wallet.address)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Wallet</span>
          <Badge variant="success">
            <Check className="h-3 w-3" /> Connected
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="space-y-3 px-2 py-2 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Address</p>
            <button
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
              <p className="font-medium">
                {wallet.balance} {currency}
              </p>
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
