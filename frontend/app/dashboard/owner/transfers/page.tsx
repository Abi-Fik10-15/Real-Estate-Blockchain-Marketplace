"use client";

import { ArrowLeftRight } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { OWNER_NAV } from "@/components/dashboard/nav-configs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TransferOwnershipDialog } from "@/features/ownership/transfer-dialog";
import { usePropertyStore } from "@/store/property-store";
import { formatCurrency, shortenAddress } from "@/lib/utils";

const OWNER_ID = "u-owner-1";

export default function OwnerTransfersPage() {
  const properties = usePropertyStore((s) => s.properties).filter(
    (p) => p.ownerId === OWNER_ID
  );

  return (
    <DashboardShell title="Ownership Transfer" roleLabel="Property Owner" nav={OWNER_NAV}>
      <PageHeader
        title="Ownership Transfer"
        description="Securely transfer property ownership to another wallet. Transfers are immutable on-chain."
      />
      <div className="space-y-3">
        {properties.map((p) => (
          <Card key={p.id}>
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium">{p.title}</p>
                <p className="text-xs text-muted-foreground">
                  {p.chainId} · {formatCurrency(p.price)}
                </p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  Owner: {shortenAddress(p.ownerWallet, 6)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {p.verification.status === "verified" ? (
                  <Badge variant="verified">Verified</Badge>
                ) : (
                  <Badge variant="warning">Pending</Badge>
                )}
                <TransferOwnershipDialog
                  currentOwner={p.ownerWallet}
                  propertyChainId={p.chainId}
                  trigger={
                    <Button variant="outline" size="sm">
                      <ArrowLeftRight className="h-4 w-4" /> Transfer
                    </Button>
                  }
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
