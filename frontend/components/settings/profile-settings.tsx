"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Camera,
  Check,
  Coins,
  Copy,
  Globe,
  Loader2,
  LogOut,
  RefreshCw,
  ShieldAlert,
  UserCheck,
  Wallet,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  ADMIN_NAV,
  AGENT_NAV,
  BUYER_NAV,
  OWNER_NAV,
} from "@/components/dashboard/nav-configs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/auth-store";
import { useWalletStore } from "@/store/wallet-store";
import { api } from "@/services/api";
import { shortenAddress } from "@/lib/utils";
import type { UserRole } from "@/types";

const ROLE_NAV = {
  buyer: BUYER_NAV,
  owner: OWNER_NAV,
  agent: AGENT_NAV,
  admin: ADMIN_NAV,
} as const;

const NOTIFICATIONS_KEY = "chainestate-email-notifications";
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

type ProfileSettingsProps = {
  title?: string;
  roleLabel: string;
  role: UserRole;
};

export function ProfileSettings({
  title = "Account Settings",
  roleLabel,
  role,
}: ProfileSettingsProps) {
  const nav = ROLE_NAV[role];
  const { user, updateUser, setUser } = useAuthStore();
  const { wallet, connect, disconnect, isConnecting } = useWalletStore();

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [name, setName] = React.useState(user?.name ?? "");
  const [email, setEmail] = React.useState(user?.email ?? "");
  const [phone, setPhone] = React.useState(user?.phone ?? "");
  const [notifications, setNotifications] = React.useState(true);
  const [copied, setCopied] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = React.useState(0);

  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone ?? "");
    }
  }, [user]);

  React.useEffect(() => {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    if (stored !== null) {
      setNotifications(stored === "true");
    }
  }, []);

  const displayAvatar = avatarPreview ?? user?.avatar;

  const handleNotificationsChange = (checked: boolean) => {
    setNotifications(checked);
    localStorage.setItem(NOTIFICATIONS_KEY, String(checked));
  };

  const handleCopy = () => {
    if (!wallet) return;
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    toast.success("Wallet address copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    setSaving(true);
    try {
      await updateUser({ name: name.trim(), email: email.trim(), phone: phone.trim() });
      toast.success("Profile saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      toast.error("Use a JPG, PNG, or WEBP image");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("Image must be 5 MB or smaller");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setUploadingAvatar(true);
    setUploadProgress(0);

    try {
      const { user: updatedUser } = await api.uploadAvatar(file, setUploadProgress);
      setUser(updatedUser);
      setAvatarPreview(null);
      toast.success("Profile photo updated");
    } catch (error) {
      setAvatarPreview(null);
      toast.error(error instanceof Error ? error.message : "Failed to upload photo");
    } finally {
      setUploadingAvatar(false);
      setUploadProgress(0);
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleWalletConnect = async () => {
    try {
      await connect();
      toast.success("Wallet connected on Sepolia");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Wallet connection cancelled");
    }
  };

  const handleWalletDisconnect = () => {
    disconnect();
    toast.info("Wallet disconnected");
  };

  return (
    <DashboardShell title={title} roleLabel={roleLabel} nav={nav}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card className="border border-border/80 bg-card/40 shadow-md backdrop-blur-sm">
            <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="relative">
                <Avatar className="h-28 w-28 border-2 border-primary/20">
                  <AvatarImage src={displayAvatar} alt={user?.name} />
                  <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">
                    {user?.name?.[0] ?? "U"}
                  </AvatarFallback>
                </Avatar>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 grid h-9 w-9 place-items-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-md transition hover:scale-105 disabled:opacity-60"
                  aria-label="Change profile photo"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_AVATAR_TYPES.join(",")}
                  className="hidden"
                  onChange={handleAvatarSelect}
                />

                {user?.verified && (
                  <span className="absolute left-0 top-0 rounded-full bg-emerald-500 p-1.5 text-white ring-2 ring-background">
                    <UserCheck className="h-4 w-4" />
                  </span>
                )}
              </div>

              {uploadingAvatar && uploadProgress > 0 && (
                <p className="text-xs text-muted-foreground">Uploading… {uploadProgress}%</p>
              )}

              <div>
                <p className="text-lg font-bold text-foreground">{user?.name ?? "User"}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {user?.verified ? (
                  <Badge variant="verified">KYC Verified</Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-amber-500/30 bg-amber-500/10 text-amber-500"
                  >
                    KYC Pending
                  </Badge>
                )}
                <Badge variant="secondary" className="capitalize">
                  {user?.role ?? "user"}
                </Badge>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? "Uploading…" : "Change photo"}
              </Button>

              <div className="mt-2 w-full border-t border-border/40 pt-4">
                <p className="mb-2 text-xs font-semibold text-muted-foreground">
                  Linked wallet
                </p>
                {wallet ? (
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      {shortenAddress(wallet.address, 10)}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-600 dark:text-amber-500">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>No wallet linked</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/80 bg-card/40 shadow-md backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Wallet className="h-4 w-4 text-primary" />
                MetaMask
              </CardTitle>
              <CardDescription className="text-xs">
                Connect on Sepolia for escrow and property NFTs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              {wallet ? (
                <div className="space-y-3">
                  <div className="space-y-2 rounded-lg border border-border/50 bg-background/40 p-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium">
                        <Globe className="h-3.5 w-3.5" /> Network
                      </span>
                      <span className="font-semibold text-foreground">{wallet.network}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-border/20 pt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium">
                        <Coins className="h-3.5 w-3.5" /> Balance
                      </span>
                      <span className="font-bold text-foreground">{wallet.balance} ETH</span>
                    </div>
                  </div>

                  {wallet.chainId !== 11155111 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Switch MetaMask to <strong>Sepolia</strong> for on-chain actions.
                    </p>
                  )}

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full border-red-500/20 bg-red-500/5 text-xs text-red-500 hover:border-red-500/40 hover:bg-red-500/10"
                    onClick={handleWalletDisconnect}
                  >
                    <LogOut className="mr-1.5 h-3.5 w-3.5" />
                    Disconnect wallet
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 py-1">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Link your MetaMask wallet to verify ownership and sign transactions.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="hero"
                    className="w-full text-xs"
                    onClick={handleWalletConnect}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Connecting…
                      </>
                    ) : (
                      <>
                        <Wallet className="mr-1.5 h-3.5 w-3.5" />
                        Connect MetaMask
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card className="border border-border/80 bg-card/40 shadow-md backdrop-blur-sm">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-lg font-bold">Profile details</CardTitle>
              <CardDescription>
                Update your name, contact info, and how we reach you
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form className="space-y-6" onSubmit={handleProfileSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="settings-name">Full name</Label>
                    <Input
                      id="settings-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settings-email">Email</Label>
                    <Input
                      id="settings-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="settings-phone">Phone</Label>
                  <Input
                    id="settings-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold">Email notifications</p>
                    <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
                      Inquiries, escrow updates, and verification alerts
                    </p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={handleNotificationsChange} />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" variant="hero" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      "Save changes"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border border-border/80 bg-card/40 shadow-md backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Account</CardTitle>
              <CardDescription>Read-only account information</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border/50 bg-muted/10 p-3">
                <p className="text-xs text-muted-foreground">Member since</p>
                <p className="text-sm font-medium">
                  {user?.joinedAt
                    ? new Date(user.joinedAt).toLocaleDateString()
                    : "—"}
                </p>
              </div>
              <div className="rounded-lg border border-border/50 bg-muted/10 p-3">
                <p className="text-xs text-muted-foreground">Account role</p>
                <p className="text-sm font-medium capitalize">{user?.role ?? "—"}</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-muted/10 p-3 sm:col-span-2">
                <p className="text-xs text-muted-foreground">Wallet on file</p>
                <p className="font-mono text-sm">
                  {user?.walletAddress
                    ? shortenAddress(user.walletAddress, 12)
                    : "Not linked"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
