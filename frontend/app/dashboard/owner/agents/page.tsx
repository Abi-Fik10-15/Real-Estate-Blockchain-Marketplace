"use client";

import * as React from "react";
import { Check, Loader2, UserCog, X } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { OWNER_NAV } from "@/components/dashboard/nav-configs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Available Agents</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {agents.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 rounded-lg border border-border/60 p-3"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={a.avatar} alt={a.name} />
                <AvatarFallback>{a.name[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium">{a.name}</p>
                <p className="truncate font-mono text-xs text-muted-foreground">
                  {shortenAddress(a.walletAddress, 6)}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-3">
        {properties.map((p) => (
          <Card key={p.id}>
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium">{p.title}</p>
                <p className="text-xs text-muted-foreground">
                  {p.location.city} · {p.chainId}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {p.agentWallet ? (
                  <Badge variant="verified">
                    <Check className="h-3 w-3" /> {shortenAddress(p.agentWallet, 4)}
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <X className="h-3 w-3" /> No agent
                  </Badge>
                )}
                <Select
                  value={p.agentId ?? "none"}
                  onValueChange={(v) => handleAssign(p.id, v)}
                  disabled={pendingId === p.id}
                >
                  <SelectTrigger className="w-44">
                    {pendingId === p.id ? (
                      <span className="flex items-center gap-2 text-sm">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing
                      </span>
                    ) : (
                      <SelectValue placeholder="Select agent" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <span className="flex items-center gap-2">
                        <UserCog className="h-3.5 w-3.5" /> No agent
                      </span>
                    </SelectItem>
                    {agents.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
