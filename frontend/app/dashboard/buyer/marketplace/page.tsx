"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { BUYER_NAV } from "@/components/dashboard/nav-configs";
import { MarketplaceView } from "@/components/marketplace/marketplace-view";

export default function BuyerMarketplacePage() {
  return (
    <DashboardShell title="Browse Properties" roleLabel="Buyer" nav={BUYER_NAV}>
      <MarketplaceView />
    </DashboardShell>
  );
}
