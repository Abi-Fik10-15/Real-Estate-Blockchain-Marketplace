"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletConnect } from "@/components/wallet/wallet-connect";
import { useAuthStore } from "@/store/auth-store";
import { PUBLIC_NAV_LINKS, BUYER_MARKETPLACE_PATH } from "@/lib/routes";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/faq", label: "FAQ" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const user = useAuthStore((s) => s.user);

  const links = PUBLIC_NAV_LINKS.map((link) => {
    if (link.href === "/#featured-properties" && user?.role === "buyer") {
      return { ...link, href: BUYER_MARKETPLACE_PATH, label: "Browse Listings" };
    }
    return link;
  });

  const isActive = (href: string) => {
    if (href.startsWith("/#")) {
      return pathname === "/" && typeof window !== "undefined" && false;
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            Chain<span className="text-gradient">Estate</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                isActive(l.href) && "text-foreground"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          {user ? (
            <Button variant="ghost" asChild>
              <Link href={`/dashboard/${user.role}`}>My Account</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button variant="hero" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
          <WalletConnect />
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background lg:hidden">
          <div className="container flex flex-col gap-1 py-4">
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              {user ? (
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/${user.role}`} onClick={() => setOpen(false)}>
                    My Account
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/login" onClick={() => setOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button variant="hero" asChild>
                    <Link href="/register" onClick={() => setOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </>
              )}
              <WalletConnect />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
