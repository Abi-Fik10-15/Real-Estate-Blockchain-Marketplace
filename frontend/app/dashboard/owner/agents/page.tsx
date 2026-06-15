"use client";

import * as React from "react";
import { Check, Info, Loader2, UserCog, X } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { OWNER_NAV } from "@/components/dashboard/nav-configs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePropertyStore } from "@/store/property-store";
import { mockBlockchain } from "@/services/mock-blockchain";
import { MOCK_USERS } from "@/services/mock-data";
import { shortenAddress } from "@/lib/utils";

const OWNER_ID = "u-owner-1";

export default function OwnerAgentsPage() {
  const properties = usePropertyStore((s) => s.properties).filter(
    (p) => p.ownerId === OWNER_ID
  );
  const assignAgent = usePropertyStore((s) => s.assignAgent);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const agents = MOCK_USERS.filter((u) => u.role === "agent");

  const handleAssign = async (propertyId: string, agentId: string) => {
    setPendingId(propertyId);
    try {
      if (agentId === "none") {
        const current = properties.find((p) => p.id === propertyId)?.agentWallet;
        if (current) await mockBlockchain.revokeAgent(current);
        assignAgent(propertyId, null);
        toast.success("Agent authorization revoked on-chain");
      } else {
        const agent = agents.find((a) => a.id === agentId)!;
        await mockBlockchain.authorizeAgent(agent.walletAddress);
        assignAgent(propertyId, { id: agent.id, wallet: agent.walletAddress });
        toast.success(`${agent.name} authorized on-chain`);
      }
    } finally {
      setPendingId(null);
    }
  };

  return (
    <DashboardShell title="Assign Agents" roleLabel="Property Owner" nav={OWNER_NAV}>
      <PageHeader
        title="Agent Authorization"
        description="Authorize agents to manage individual listings. Each change is recorded on-chain."
      />

      {/* Info banner */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-sm text-primary/80">
          Authorized agents can update listing details and respond to inquiries on your behalf.
          Removing an agent revokes their on-chain access immediately.
        </p>
      </div>

      {/* Available agents roster */}
      <Card className="mb-6 border-border/60">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-sm font-semibold">Available Agents</CardTitle>
          <CardDescription className="text-xs">
            {agents.length} verified agent{agents.length !== 1 ? "s" : ""} in the network
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 p-3 transition-colors hover:border-border hover:bg-card/80"
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={a.avatar} alt={a.name} />
                  <AvatarFallback className="text-sm font-semibold">
                    {a.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{a.name}</p>
                  <p className="truncate font-mono text-[10px] text-muted-foreground">
                    {shortenAddress(a.walletAddress, 8)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Property ↔ agent assignment list */}
      <Card className="border-border/60">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-sm font-semibold">Assign by Property</CardTitle>
          <CardDescription className="text-xs">
            Select an agent for each listing. Changes are processed on-chain.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/40">
            {properties.map((p) => (
              <div
                key={p.id}
                className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                {/* Property info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-14 shrink-0 overflow-hidden rounded-lg border border-border/60">
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {p.location.city} ·{" "}
                      <span className="font-mono">{p.chainId}</span>
                    </p>
                  </div>
                </div>

                {/* Agent badge + selector */}
                <div className="flex shrink-0 items-center gap-3">
                  {p.agentWallet ? (
                    <Badge variant="verified" className="gap-1 font-mono text-[10px]">
                      <Check className="h-3 w-3" />
                      {shortenAddress(p.agentWallet, 4)}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 text-[10px]">
                      <X className="h-3 w-3" /> No agent
                    </Badge>
                  )}

                  <Select
                    value={p.agentId ?? "none"}
                    onValueChange={(v) => handleAssign(p.id, v)}
                    disabled={pendingId === p.id}
                  >
                    <SelectTrigger className="h-8 w-44 text-xs">
                      {pendingId === p.id ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" /> Processing…
                        </span>
                      ) : (
                        <SelectValue placeholder="Select agent" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <span className="flex items-center gap-2 text-xs">
                          <UserCog className="h-3.5 w-3.5" /> No agent
                        </span>
                      </SelectItem>
                      {agents.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          <span className="text-xs">{a.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}

            {properties.length === 0 && (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                No properties available.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
