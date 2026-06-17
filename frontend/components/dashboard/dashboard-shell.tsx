"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletConnect } from "@/components/wallet/wallet-connect";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useNotifications } from "@/hooks/use-notifications";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

export function DashboardShell({
  title,
  roleLabel,
  nav,
  children,
}: {
  title: string;
  roleLabel: string;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { count, clearCount } = useNotifications();
  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isActive = (href: string) =>
    pathname === href || (href !== nav[0]?.href && pathname.startsWith(`${href}/`));

  const handleLogout = () => {
    logout();
    toast.info("Signed out");
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <Link href="/" className="flex h-16 items-center gap-3 border-b border-border px-6">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block font-semibold leading-tight text-foreground">
              ChainEstate
            </span>
            <span className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Dashboard
            </span>
          </span>
        </Link>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2" aria-label={`${roleLabel} navigation`}>
          {nav.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded",
                    active ? "bg-primary/20" : "bg-muted"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </span>
                <span className="flex-1 truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="space-y-2 border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-2.5">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback>{initials || "U"}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user?.name ?? "Guest User"}</p>
              <p className="truncate text-xs text-muted-foreground">{roleLabel}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-sm sm:px-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
             
              <div className="min-w-0 flex gap-2 items-center">
                <h1 className="truncate text-primary-500 font-semibold sm:text-lg">{title}</h1>
                {/* <div className=" flex items-center gap-2">
                  <Badge variant="secondary" className="truncate text-xs font-medium">
                    {roleLabel}
                  </Badge>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <Badge variant="outline" className="truncate text-xs font-medium text-muted-foreground">
                    Workspace
                  </Badge>
                </div> */}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8"
              onClick={clearCount}
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Button>
            <ThemeToggle />
            <WalletConnect size="sm" />
          </div>
        </header>

        <div className="sticky top-16 z-20 border-b border-border bg-muted/50 px-4 py-2 lg:hidden">
          <nav className="flex gap-2 overflow-x-auto pb-2 lg:hidden" aria-label={`${roleLabel} navigation`}>
            {nav.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
