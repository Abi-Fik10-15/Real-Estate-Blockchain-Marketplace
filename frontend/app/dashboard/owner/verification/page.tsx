"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { OWNER_NAV } from "@/components/dashboard/nav-configs";
import { OwnershipVerification } from "@/components/property/ownership-verification";
import { usePropertyStore } from "@/store/property-store";

const OWNER_ID = "u-owner-1";

export default function OwnerVerificationPage() {
  const properties = usePropertyStore((s) => s.properties).filter(
    (p) => p.ownerId === OWNER_ID
  );

  return (
    <DashboardShell title="Ownership Verification" roleLabel="Property Owner" nav={OWNER_NAV}>
      <PageHeader
        title="Ownership Verification"
        description="Re-verify on-chain ownership records against the title registry oracle."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {properties.map((p) => (
          <div key={p.id} className="space-y-2">
            <p className="text-sm font-medium">{p.title}</p>
            <OwnershipVerification property={p} />
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
