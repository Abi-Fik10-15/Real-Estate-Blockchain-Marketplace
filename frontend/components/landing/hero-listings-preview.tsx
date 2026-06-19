import Link from "next/link";
import { ArrowRight, BadgeCheck, Blocks, Link2, MapPin, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BUYER_MARKETPLACE_PATH } from "@/lib/routes";

const PREVIEW_PROPERTIES = [
  {
    title: "Marina Bay Suite",
    location: "Singapore",
    price: "$3,100,000",
    type: "Apartment",
    verified: true,
    chainId: "EST-1001",
    tokenId: "#1042",
  },
  {
    title: "Downtown Loft",
    location: "New York, USA",
    price: "$1,800,000",
    type: "Condo",
    verified: true,
    chainId: "EST-1002",
    tokenId: "#883",
  },
  {
    title: "Beachfront Villa",
    location: "Bali, Indonesia",
    price: "$3,600,000",
    type: "Villa",
    verified: false,
    chainId: "EST-1006",
    tokenId: "Pending",
  },
] as const;

export function HeroListingsPreview() {
  return (
    <div className="relative hidden lg:flex lg:justify-end lg:pl-4">
      <div className="group relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border/80 bg-background p-5 shadow-sm transition-[box-shadow,transform] duration-300 ease-out motion-reduce:transition-none hover:-translate-y-1 hover:shadow-lg motion-reduce:hover:transform-none">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-primary/5 to-transparent" />

        <div className="relative mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Featured Listings
            </p>
            <Badge variant="outline" className="border-primary/30 text-[10px] text-primary">
              Live
            </Badge>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1.5">
            <Blocks className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
            <p className="text-[10px] text-muted-foreground">
              <span className="font-medium text-foreground">ERC-721</span> · Sepolia testnet · On-chain registry
            </p>
          </div>
        </div>

        <div className="relative space-y-3">
          {PREVIEW_PROPERTIES.map((p) => (
            <div
              key={p.chainId}
              className="rounded-xl border border-border/70 bg-background px-4 py-3 transition-[border-color,background-color] duration-200 hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">{p.title}</p>
                    {p.verified && (
                      <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                    )}
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" aria-hidden />
                    {p.location}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-primary">{p.price}</p>
                  <p className="text-[11px] text-muted-foreground">{p.type}</p>
                </div>
              </div>

              <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-border/40 pt-2.5">
                <Badge variant="outline" className="font-mono text-[10px]">
                  {p.chainId}
                </Badge>
                <Badge variant="outline" className="font-mono text-[10px]">
                  Token {p.tokenId}
                </Badge>
                {p.verified ? (
                  <span className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                    <ShieldCheck className="h-3 w-3" aria-hidden />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/5 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                    Mint pending
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="relative mt-4 flex items-center justify-between border-t border-border/50 pt-4">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
            <Link2 className="h-3 w-3 text-primary" aria-hidden />
            Registry synced on-chain
          </div>
          <Link
            href={`/login?redirect=${encodeURIComponent(BUYER_MARKETPLACE_PATH)}`}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-7 text-xs")}
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
