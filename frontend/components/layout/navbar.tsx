"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletConnect } from "@/components/wallet/wallet-connect";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/#map-preview", label: "Map Explore" },
  { href: "/#trusted-agents", label: "Agents" },
  { href: "/#footer", label: "About" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container max-w-[1280px] flex h-14 items-center justify-between gap-2 md:gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-brand text-primary-foreground shadow-glow">
            <ShieldCheck className="h-4.5 w-4.5" />
          </span>
          <span className="text-base font-bold tracking-tight hidden sm:inline-block">
            Chain<span className="text-gradient">Estate</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href.startsWith("/#") && pathname === "/");
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
                  isActive && "text-foreground font-semibold"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden lg:flex items-center gap-1.5">
          <ThemeToggle />
          <Button variant="ghost" size="sm" className="h-8 text-xs px-3" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-xs px-3" asChild>
            <Link href="/register">Register</Link>
          </Button>
          <WalletConnect size="sm" className="h-8 text-xs" />
          <Button variant="default" size="sm" className="h-8 text-xs px-3 bg-primary text-primary-foreground hover:bg-primary/95 shadow-soft" asChild>
            <Link href="/dashboard/owner">List Property</Link>
          </Button>
        </div>

        {/* Mobile Action Controls */}
        <div className="flex lg:hidden items-center gap-1.5 ml-auto">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen((o) => !o)} aria-label="Toggle Menu">
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-border/60 bg-background lg:hidden">
          <div className="container flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2 pt-2 border-t border-border/60">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs h-9" asChild>
                  <Link href="/login" onClick={() => setOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs h-9" asChild>
                  <Link href="/register" onClick={() => setOpen(false)}>
                    Register
                  </Link>
                </Button>
              </div>
              <WalletConnect size="sm" className="w-full h-9 justify-center text-xs" />
              <Button variant="default" size="sm" className="w-full text-xs h-9 bg-primary text-primary-foreground hover:bg-primary/95" asChild>
                <Link href="/dashboard/owner" onClick={() => setOpen(false)}>
                  List Property
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
