"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LazyWalletConnect } from "@/components/wallet/lazy-wallet-connect";

export function HeroCtaButtons() {
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Button size="lg" asChild>
        <Link href="/marketplace">
          Explore Properties <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
      <LazyWalletConnect size="lg" variant="outline" />
    </div>
  );
}
