"use client";

import { Wallet } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { OWNER_NAV } from "@/components/dashboard/nav-configs";
import { EscrowPanel } from "@/components/blockchain/escrow-panel";
import { useMyTransactions } from "@/hooks/use-transactions";

export default function OwnerEscrowPage() {
  const { data: transactions = [], isLoading } = useMyTransactions();

  const pending = transactions.filter((t) => t.status === "escrow").length;

  return (
    <DashboardShell title="Escrow & Sales" roleLabel="Property Owner" nav={OWNER_NAV}>
      <div className="space-y-5">

        {/* Summary bar */}
        <div className="rounded-xl border border-border/60 bg-card px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-base font-semibold text-foreground">Escrow &amp; Sales</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Confirm on-chain sales after buyers fund escrow — releases ETH to you and transfers the property NFT.
              </p>
            </div>
            {pending > 0 && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-1.5">
                <Wallet className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                  {pending} pending {pending === 1 ? "escrow" : "escrows"}
                </span>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl border border-border/60 bg-muted/30" />
            ))}
          </div>
        ) : (
          <EscrowPanel transactions={transactions} />
        )}

      </div>
    </DashboardShell>
  );
}
