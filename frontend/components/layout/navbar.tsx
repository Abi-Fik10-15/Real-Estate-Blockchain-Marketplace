"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LazyWalletConnect } from "@/components/wallet/lazy-wallet-connect";
import { useAuthStore } from "@/store/auth-store";
import { PUBLIC_NAV_LINKS, BUYER_MARKETPLACE_PATH } from "@/lib/routes";
import { cn } from "@/lib/utils";

function NavAuthButtons({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const user = useAuthStore((s) => s.user);

  if (user) {
    return (
      <Button variant="outline" size="sm" className={className} asChild>
        <Link href={`/dashboard/${user.role}`} onClick={onNavigate}>
          My Account
        </Link>
      </Button>
    );
  }

  return (
    <>
      <Button variant="ghost" size="sm" className={className} asChild>
        <Link href="/login" onClick={onNavigate}>
          Sign In
        </Link>
      </Button>
      <Button size="sm" className={className} asChild>
        <Link href="/register" onClick={onNavigate}>
          Get Started
        </Link>
      </Button>
    </>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const user = useAuthStore((s) => s.user);

  const links = React.useMemo(
    () =>
      PUBLIC_NAV_LINKS.map((link) => {
        if (link.href === "/#featured-properties" && user?.role === "buyer") {
          return { ...link, href: BUYER_MARKETPLACE_PATH, label: "Browse Listings" };
        }
        return link;
      }),
    [user?.role]
  );

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = React.useCallback(
    (href: string) => {
      if (href.startsWith("/#")) return false;
      return pathname === href || pathname.startsWith(`${href}/`);
    },
    [pathname]
  );

  const navLinkClass = (href: string) =>
    cn(
      "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-primary/5 hover:text-primary-600",
      isActive(href) && "bg-primary/5 text-primary-600"
    );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/95 supports-[backdrop-filter]:bg-background/80 supports-[backdrop-filter]:backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4 px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="ChainEstate home">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 text-primary">
            <ShieldCheck className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground" aria-hidden>
            Chain<span className="text-primary">Estate</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main navigation">
          {links.map((l) => (
            <Link key={l.label} href={l.href} className={navLinkClass(l.href)}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <NavAuthButtons />
          <LazyWalletConnect variant="outline" size="sm" />
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-border/50 bg-background lg:hidden">
          <div className="container space-y-4 px-6 py-4 lg:px-8">
            <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
              {links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={navLinkClass(l.href)}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-col gap-2 rounded-xl border border-border/80 bg-muted/20 p-3">
              <NavAuthButtons onNavigate={() => setOpen(false)} className="w-full" />
              <LazyWalletConnect variant="outline" size="sm" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
