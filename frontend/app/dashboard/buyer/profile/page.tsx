"use client";

import * as React from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { BUYER_NAV } from "@/components/dashboard/nav-configs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth-store";
import { useWalletStore } from "@/store/wallet-store";
import { shortenAddress } from "@/lib/utils";
import { Wallet, LogOut, RefreshCw, Globe, Coins, Copy, Check, UserCheck, ShieldAlert } from "lucide-react";

export default function BuyerProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { wallet, connect, disconnect, switchNetwork, isConnecting } = useWalletStore();

  const [name, setName] = React.useState(user?.name ?? "");
  const [email, setEmail] = React.useState(user?.email ?? "");
  const [phone, setPhone] = React.useState(user?.phone ?? "");
  const [notifications, setNotifications] = React.useState(true);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone ?? "");
    }
  }, [user]);

  const handleCopy = () => {
    if (!wallet) return;
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    toast.success("Wallet address copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and Email are required");
      return;
    }
    updateUser({ name, email, phone });
    toast.success("Profile saved successfully");
  };

  const handleNetworkChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const chainId = parseInt(e.target.value, 10);
    const promise = switchNetwork(chainId);
    toast.promise(promise, {
      loading: "Switching network...",
      success: (data) => `Switched to ${(data as any)?.network ?? "target chain"}`,
      error: "Failed to switch network",
    });
  };

  const handleWalletConnect = () => {
    const promise = connect();
    toast.promise(promise, {
      loading: "Opening simulated Web3 wallet...",
      success: "Wallet connected successfully",
      error: "Wallet connection cancelled",
    });
  };

  const handleWalletDisconnect = () => {
    const promise = disconnect();
    toast.promise(promise, {
      loading: "Disconnecting wallet...",
      success: "Wallet disconnected",
      error: "Failed to disconnect",
    });
  };

  const isEth = wallet?.chainId === 1 || wallet?.chainId === 11155111;
  const currencySymbol = isEth ? "ETH" : "MATIC";

  return (
    <DashboardShell title="Profile Settings" roleLabel="Buyer / Renter" nav={BUYER_NAV}>
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Profile Card Summary */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="border border-border/80 bg-card/40 backdrop-blur-sm shadow-md">
            <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="relative">
                <Avatar className="h-24 w-24 border-2 border-primary/20">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                    {user?.name?.[0] ?? "U"}
                  </AvatarFallback>
                </Avatar>
                {user?.verified && (
                  <span className="absolute bottom-0 right-0 rounded-full bg-emerald-500 p-1.5 text-white ring-2 ring-background">
                    <UserCheck className="h-4 w-4" />
                  </span>
                )}
              </div>
              
              <div>
                <p className="font-bold text-lg text-foreground">{user?.name ?? "Elena Cruz"}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {user?.verified ? (
                  <Badge variant="verified">KYC Verified ✓</Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-500">
                    KYC Unverified
                  </Badge>
                )}
                <Badge variant="secondary" className="capitalize">
                  Role: {user?.role ?? "buyer"}
                </Badge>
              </div>

              <div className="w-full border-t border-border/40 pt-4 mt-2">
                <p className="text-xs text-muted-foreground font-semibold mb-2">Linked Wallet Address</p>
                {wallet ? (
                  <div className="flex items-center justify-between gap-2 rounded-lg bg-background/50 border border-border/60 px-3 py-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      {shortenAddress(wallet.address, 10)}
                    </span>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={handleCopy}>
                      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 px-3 py-2.5 text-xs text-amber-600 dark:text-amber-500 flex items-center gap-2 justify-center">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>No Web3 Wallet Linked</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Simulated Web3 Hub Card */}
          <Card className="border border-border/80 bg-card/40 backdrop-blur-sm shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Wallet className="h-4.5 w-4.5 text-primary" />
                Web3 Sandbox Console
              </CardTitle>
              <CardDescription className="text-xs">
                Simulate blockchain wallet interactions in a sandbox environment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              {wallet ? (
                <div className="space-y-3">
                  <div className="rounded-lg bg-background/40 border border-border/50 p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium">
                        <Globe className="h-3.5 w-3.5" /> Network
                      </span>
                      <span className="font-semibold text-foreground">{wallet.network}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/20 pt-2">
                      <span className="flex items-center gap-1 font-medium">
                        <Coins className="h-3.5 w-3.5" /> Balance
                      </span>
                      <span className="font-bold text-foreground">
                        {wallet.balance} {currencySymbol}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="network-select" className="text-xs">Switch Network Environment</Label>
                    <select
                      id="network-select"
                      className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      value={wallet.chainId}
                      onChange={handleNetworkChange}
                    >
                      <option value={80002}>Polygon Amoy (Testnet)</option>
                      <option value={11155111}>Ethereum Sepolia (Testnet)</option>
                      <option value={137}>Polygon PoS (Mainnet)</option>
                      <option value={1}>Ethereum Mainnet (Mainnet)</option>
                    </select>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs text-red-500 hover:text-red-600 border-red-500/20 hover:border-red-500/40 bg-red-500/5 hover:bg-red-500/10"
                    onClick={handleWalletDisconnect}
                  >
                    <LogOut className="mr-1.5 h-3.5 w-3.5" />
                    Disconnect Wallet
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 py-2">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Connect a mock wallet to test escrow lockups, smart contract parameters, gas estimations, and deed ownership minting.
                  </p>
                  <Button
                    size="sm"
                    variant="hero"
                    className="w-full text-xs"
                    onClick={handleWalletConnect}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Wallet className="mr-1.5 h-3.5 w-3.5" />
                        Connect Simulated Wallet
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profile Settings Form */}
        <div className="lg:col-span-2">
          <Card className="border border-border/80 bg-card/40 backdrop-blur-sm shadow-md">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-lg font-bold">Profile Details</CardTitle>
              <CardDescription>Update your personal information and messaging settings</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form className="space-y-6" onSubmit={handleProfileSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Elena Cruz"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="e.g. elena@chainestate.io"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="e.g. +1 (206) 555-0144"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border/60 p-4 bg-muted/20">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-sm">Email notifications</p>
                    <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                      Get real-time updates on inquiries, blockchain escrow releases, and verified listings.
                    </p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="submit" variant="hero" className="px-6">
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </DashboardShell>
  );
}
