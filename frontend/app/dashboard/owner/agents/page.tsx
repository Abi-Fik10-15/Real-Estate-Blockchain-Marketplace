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
import { useAuthStore } from "@/store/auth-store";
import { useAgents } from "@/hooks/use-properties";
import { shortenAddress } from "@/lib/utils";

export default function OwnerAgentsPage() {
  const user = useAuthStore((s) => s.user);
  const properties = usePropertyStore((s) => s.properties).filter(
    (p) => p.ownerId === user?.id
  );
  const assignAgent = usePropertyStore((s) => s.assignAgent);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const { data: agents = [] } = useAgents();

  const handleAssign = async (propertyId: string, agentId: string) => {
    setPendingId(propertyId);
    try {
      if (agentId === "none") {
        await assignAgent(propertyId, null);
        toast.success("Agent removed from listing");
      } else {
        const agent = agents.find((a) => a.id === agentId)!;
        await assignAgent(propertyId, { id: agent.id, wallet: agent.walletAddress });
        toast.success(`${agent.name} assigned to listing`);
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

      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            Assigning an agent grants them dashboard access to manage inquiries, schedule visits,
            and update listing details for that property.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {properties.map((p) => (
          <Card key={p.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base">{p.title}</CardTitle>
                  <CardDescription className="font-mono text-xs">{p.chainId}</CardDescription>
                </div>
                {p.agentId ? (
                  <Badge variant="verified" className="gap-1">
                    <Check className="h-3 w-3" /> Agent Active
                  </Badge>
                ) : (
                  <Badge variant="outline">No Agent</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {p.agentId ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={agents.find((a) => a.id === p.agentId)?.avatar}
                        alt="Agent"
                      />
                      <AvatarFallback>
                        <UserCog className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {agents.find((a) => a.id === p.agentId)?.name ?? "Assigned Agent"}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {p.agentWallet ? shortenAddress(p.agentWallet, 6) : "—"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No agent assigned yet.</p>
                )}

                <Select
                  value={p.agentId ?? "none"}
                  onValueChange={(v) => handleAssign(p.id, v)}
                  disabled={pendingId === p.id}
                >
                  <SelectTrigger className="w-full sm:w-56">
                    {pendingId === p.id ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" /> Updating...
                      </span>
                    ) : (
                      <SelectValue placeholder="Select agent" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <span className="flex items-center gap-2">
                        <X className="h-3 w-3" /> Remove agent
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
