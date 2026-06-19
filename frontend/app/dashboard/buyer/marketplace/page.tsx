"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { BUYER_NAV } from "@/components/dashboard/nav-configs";
import { MarketplaceView } from "@/components/marketplace/marketplace-view";

export default function BuyerMarketplacePage() {
  return (
    <DashboardShell title="Browse Properties" roleLabel="Buyer" nav={BUYER_NAV}>
      {/* <PageHeader
        title="Property Marketplace"
        description="Search verified listings, compare options, and submit purchase or rental requests."
      /> */}
      <MarketplaceView />
    </DashboardShell>
  );
}
