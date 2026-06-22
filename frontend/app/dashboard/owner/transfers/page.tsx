"use client";

import { AlertTriangle, ArrowLeftRight, Building2, ShieldCheck } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { OWNER_NAV } from "@/components/dashboard/nav-configs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TransferOwnershipDialog } from "@/features/ownership/transfer-dialog";
import { formatCurrency, shortenAddress } from "@/lib/utils";
import { useOwnerProperties } from "@/hooks/use-owner-properties";

export default function OwnerTransfersPage() {
  const properties = useOwnerProperties();
  const verifiedCount = properties.filter((p) => p.verification.status === "verified").length;

  return (
    <DashboardShell title="Ownership Transfer" roleLabel="Property Owner" nav={OWNER_NAV}>
      <div className="space-y-5">

        {/* Summary bar */}
        <div className="rounded-xl border border-border/60 bg-card px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-base font-semibold text-foreground">Ownership Transfers</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {properties.length} {properties.length === 1 ? "property" : "properties"} ·{" "}
                <span className="text-primary">{verifiedCount} verified</span> ·{" "}
                transfers are permanent on-chain
              </p>
            </div>
          </div>
        </div>

        {/* Warning notice */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3.5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Transfers are <strong>permanent</strong> and cannot be reversed once confirmed on-chain.
            Only transfer to a wallet address you fully trust.
          </p>
        </div>

        {properties.length === 0 ? (
          <Card className="border-border/60">
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-border/60">
                <Building2 className="h-7 w-7 text-muted-foreground/40" />
              </div>
              <p className="font-medium">No properties to transfer</p>
              <p className="text-sm text-muted-foreground">
                You don&apos;t have any properties in your portfolio yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/60">
            <CardHeader className="border-b border-border/60 pb-3">
              <CardTitle className="text-sm text-primary">Properties</CardTitle>
              <CardDescription className="text-xs">Select a property to initiate an on-chain transfer</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                {properties.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-muted/20 sm:flex-row sm:items-center sm:justify-between"
                  >
                    {/* Left: image + details */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-border/60">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{p.title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="rounded-md border border-border/60 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                            {p.chainId}
                          </span>
                          <span className="text-xs font-semibold text-primary tabular-nums">{formatCurrency(p.price)}</span>
                        </div>
                        <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                          Owner: <span className="text-foreground/70">{shortenAddress(p.ownerWallet, 8)}</span>
                        </p>
                      </div>
                    </div>

                    {/* Right: badge + action */}
                    <div className="flex shrink-0 items-center gap-3">
                      {p.verification.status === "verified" ? (
                        <Badge variant="verified" className="gap-1 text-xs">
                          <ShieldCheck className="h-3 w-3" /> Verified
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="text-xs">Pending</Badge>
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
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </DashboardShell>
  );
}
