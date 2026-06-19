"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { OWNER_NAV } from "@/components/dashboard/nav-configs";
import { EscrowPanel } from "@/components/blockchain/escrow-panel";
import { useMyTransactions } from "@/hooks/use-transactions";

export default function OwnerEscrowPage() {
  const { data: transactions = [], isLoading } = useMyTransactions();

  return (
    <DashboardShell title="Escrow & Sales" roleLabel="Property Owner" nav={OWNER_NAV}>
      <PageHeader
        title="Escrow & Sales"
        description="Confirm on-chain sales after buyers fund escrow. This releases ETH to you and transfers the property NFT to the buyer."
      />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading transactions…</p>
      ) : (
        <EscrowPanel transactions={transactions} />
      )}
    </DashboardShell>
  );
}
