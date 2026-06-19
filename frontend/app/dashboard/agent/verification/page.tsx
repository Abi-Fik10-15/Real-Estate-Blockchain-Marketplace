"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { AGENT_NAV } from "@/components/dashboard/nav-configs";
import { OwnershipVerification } from "@/components/property/ownership-verification";
import { usePropertyStore } from "@/store/property-store";
import { useAuthStore } from "@/store/auth-store";

export default function AgentVerificationPage() {
  const userId = useAuthStore((s) => s.user?.id);
  const assigned = usePropertyStore((s) => s.properties).filter(
    (p) => p.agentId === userId,
  );

  return (
    <DashboardShell title="Verification Center" roleLabel="Property Agent" nav={AGENT_NAV}>
      <PageHeader
        title="Verification Center"
        description="Verify on-chain ownership for the listings you manage before closing a deal."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {assigned.map((p) => (
          <div key={p.id} className="space-y-2">
            <p className="text-sm font-medium">{p.title}</p>
            <OwnershipVerification property={p} />
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
