"use client";

import { ArrowLeftRight, ShieldCheck, Building2, AlertTriangle } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { OWNER_NAV } from "@/components/dashboard/nav-configs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

      {/* Caution notice */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3.5">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <p className="text-sm text-amber-700 dark:text-amber-400">
          Transfers are <strong>permanent</strong> and cannot be reversed once confirmed on-chain.
          Only transfer to a wallet address you fully trust.
        </p>
      </div>

      {properties.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium">No properties to transfer</p>
            <p className="text-sm text-muted-foreground">
              You don&apos;t have any properties in your portfolio yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {properties.map((p) => (
            <Card key={p.id} className="border-border/60 transition-colors hover:border-border">
              <CardContent className="p-0">
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left: image + details */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-border/60">
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{p.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="rounded-md border border-border/60 bg-muted/50 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                          {p.chainId}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(p.price)}
                        </span>
                      </div>
                      <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
                        Owner:{" "}
                        <span className="text-foreground/70">
                          {shortenAddress(p.ownerWallet, 8)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Right: badge + action */}
                  <div className="flex shrink-0 items-center gap-3">
                    {p.verification.status === "verified" ? (
                      <Badge variant="verified" className="gap-1">
                        <ShieldCheck className="h-3 w-3" /> Verified
                      </Badge>
                    ) : (
                      <Badge variant="warning">Pending</Badge>
                    )}
                    <TransferOwnershipDialog
                      currentOwner={p.ownerWallet}
                      propertyChainId={p.chainId}
                      trigger={
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <ArrowLeftRight className="h-3.5 w-3.5" /> Transfer
                        </Button>
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
