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
import { cn, shortenAddress } from "@/lib/utils";

export function WalletConnect({
  size = "default",
  className,
}: {
  size?: "default" | "sm" | "lg";
  className?: string;
}) {
  const { wallet, isConnecting, connect, disconnect } = useWalletStore();
  const [copied, setCopied] = React.useState(false);

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
        variant="hero"
        size={size}
        className={className}
        onClick={() => {
          connect();
          toast.promise(Promise.resolve(), { loading: "Connecting wallet..." });
        }}
        disabled={isConnecting}
      >
        <WalletIcon className="h-4 w-4" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size} className={cn("gap-2", className)}>
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
              <p className="font-medium">{wallet.balance} MATIC</p>
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
