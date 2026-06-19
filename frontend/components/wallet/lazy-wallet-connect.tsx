"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

export const LazyWalletConnect = dynamic(
  () =>
    import("@/components/wallet/wallet-connect").then((mod) => mod.WalletConnect),
  {
    ssr: false,
    loading: () => (
      <Button variant="outline" size="sm" disabled className="min-w-[9.5rem]">
        Connect Wallet
      </Button>
    ),
  }
);
