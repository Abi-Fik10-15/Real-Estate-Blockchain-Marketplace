"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { BUYER_NAV } from "@/components/dashboard/nav-configs";
import { MarketplaceView } from "@/components/marketplace/marketplace-view";
import { MapSection } from "@/components/landing/map-section"; // adjust path

export default function BuyerMarketplacePage() {
  const [view, setView] = useState<"marketplace" | "map">("marketplace");

  return (
    <DashboardShell
      title="Browse Properties"
      roleLabel="Buyer"
      nav={BUYER_NAV}
    >
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setView("marketplace")}
          className={`rounded-lg px-4 py-2 font-medium transition ${
            view === "marketplace"
              ? "bg-[#2463eb] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          List View
        </button>

        <button
          onClick={() => setView("map")}
          className={`rounded-lg px-4 py-2 font-medium transition ${
            view === "map"
              ? "bg-[#2463eb] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Map View
        </button>
      </div>

      {view === "marketplace" ? (
        <MarketplaceView />
      ) : (
        <MapSection />
      )}
    </DashboardShell>
  );
}