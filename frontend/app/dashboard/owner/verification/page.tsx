"use client";

import { ShieldCheck, Building2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { OWNER_NAV } from "@/components/dashboard/nav-configs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OwnershipVerification } from "@/components/property/ownership-verification";
import { usePropertyStore } from "@/store/property-store";

import { useOwnerProperties } from "@/hooks/use-owner-properties";

export default function OwnerVerificationPage() {
  const properties = useOwnerProperties();

  const verified = properties.filter((p) => p.verification.status === "verified").length;
  const pending = properties.length - verified;

  return (
    <DashboardShell title="Ownership Verification" roleLabel="Property Owner" nav={OWNER_NAV}>
      <PageHeader
        title="Ownership Verification"
        description="Re-verify on-chain ownership records against the title registry oracle."
      />

      {/* Summary row */}
      {properties.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/50 px-4 py-2.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium">
              <span className="text-emerald-600 dark:text-emerald-400">{verified}</span>{" "}
              Verified
            </span>
          </div>
          {pending > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-2.5">
              <ShieldCheck className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">
                <span className="text-amber-600 dark:text-amber-400">{pending}</span>{" "}
                Awaiting verification
              </span>
            </div>
          )}
        </div>
      )}

      {properties.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium">No properties to verify</p>
            <p className="text-sm text-muted-foreground">
              Create a property listing to begin the verification process.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {properties.map((p) => (
            <Card key={p.id} className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-3">
                <div className="min-w-0">
                  <CardTitle className="truncate text-sm font-semibold">{p.title}</CardTitle>
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                    {p.chainId}
                  </p>
                </div>
                {p.verification.status === "verified" ? (
                  <Badge variant="verified" className="shrink-0 gap-1">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </Badge>
                ) : (
                  <Badge variant="warning" className="shrink-0">Pending</Badge>
                )}
              </CardHeader>
              <CardContent className="pt-4">
                <OwnershipVerification property={p} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
