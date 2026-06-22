"use client";

import { Building2, ShieldCheck, ShieldOff } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { OWNER_NAV } from "@/components/dashboard/nav-configs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OwnershipVerification } from "@/components/property/ownership-verification";
import { useOwnerProperties } from "@/hooks/use-owner-properties";

export default function OwnerVerificationPage() {
  const properties = useOwnerProperties();
  const verified = properties.filter((p) => p.verification.status === "verified").length;
  const pending = properties.length - verified;

  return (
    <DashboardShell title="Ownership Verification" roleLabel="Property Owner" nav={OWNER_NAV}>
      <div className="space-y-5">

        {/* Summary bar */}
        <div className="rounded-xl border border-border/60 bg-card px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-base font-semibold text-foreground">Ownership Verification</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Re-verify on-chain ownership records against the title registry oracle.
              </p>
            </div>
            {properties.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/10 px-3 py-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs font-medium">
                    <span className="text-primary">{verified}</span> verified
                  </span>
                </div>
                {pending > 0 && (
                  <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-1.5">
                    <ShieldOff className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                      {pending} pending
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats strip */}
        {properties.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Total Properties", value: properties.length },
              { label: "Verified", value: verified },
              { label: "Awaiting Verification", value: pending },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg border border-border/50 bg-muted/10 px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="mt-1 text-xl font-bold tabular-nums text-primary">{value}</p>
              </div>
            ))}
          </div>
        )}

        {properties.length === 0 ? (
          <Card className="border-border/60">
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-border/60">
                <Building2 className="h-7 w-7 text-muted-foreground/40" />
              </div>
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
                <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-3">
                  <div className="min-w-0">
                    <CardTitle className="truncate text-sm text-primary">{p.title}</CardTitle>
                    <CardDescription className="font-mono text-[10px]">{p.chainId}</CardDescription>
                  </div>
                  {p.verification.status === "verified" ? (
                    <Badge variant="verified" className="shrink-0 gap-1 text-xs">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </Badge>
                  ) : (
                    <Badge variant="warning" className="shrink-0 text-xs">Pending</Badge>
                  )}
                </CardHeader>
                <CardContent className="pt-4">
                  <OwnershipVerification property={p} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </div>
    </DashboardShell>
  );
}
