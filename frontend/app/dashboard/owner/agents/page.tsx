"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Info, Loader2, Plus, ShieldOff, UserCog } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { OWNER_NAV } from "@/components/dashboard/nav-configs";
import { Card, CardContent } from "@/components/ui/card";
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
import { shortenAddress, cn } from "@/lib/utils";

export default function OwnerAgentsPage() {
  const user = useAuthStore((s) => s.user);
  const properties = usePropertyStore((s) => s.properties).filter(
    (p) => p.ownerId === user?.id
  );
  const assignAgent = usePropertyStore((s) => s.assignAgent);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = React.useState<Record<string, string>>({});
  const { data: agents = [] } = useAgents();

  const handleAssign = async (propertyId: string, agentId: string | null) => {
    setPendingId(propertyId);
    try {
      if (!agentId) {
        await assignAgent(propertyId, null);
        toast.success("Agent removed from listing");
      } else {
        const agent = agents.find((a) => a.id === agentId)!;
        await assignAgent(propertyId, { id: agent.id, wallet: agent.walletAddress });
        toast.success(`${agent.name} assigned to listing`);
        setSelectedAgent((prev) => ({ ...prev, [propertyId]: "" }));
      }
    } catch {
      toast.error("Failed to update agent assignment");
    } finally {
      setPendingId(null);
    }
  };

  if (properties.length === 0) {
    return (
      <DashboardShell title="Assign Agents" roleLabel="Property Owner" nav={OWNER_NAV}>
        <PageHeader
          title="Agent Authorization"
          description="Authorize agents to manage individual listings. Each change is recorded on-chain."
        />
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="rounded-full bg-muted p-3">
              <UserCog className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">No properties registered yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                You need to register a property before you can assign an agent to manage it.
              </p>
            </div>
            <Button asChild className="mt-2 gap-2">
              <Link href="/dashboard/owner/properties/new">
                <Plus className="h-4 w-4" />
                Create Property
              </Link>
            </Button>
          </CardContent>
        </Card>
      </DashboardShell>
    );
  }

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

      <div className="flex flex-col gap-4">
        {properties.map((p) => {
          const agent = agents.find((a) => a.id === p.agentId);
          const isPending = pendingId === p.id;
          const pendingSelection = selectedAgent[p.id] ?? "";

          return (
            <Card key={p.id} className="overflow-hidden">
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                {/* Thumbnail */}
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-14 sm:w-14">
                  {p.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <UserCog className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Title / type */}
                <div className="min-w-0 flex-1">
                  {p.type && (
                    <Badge
                      variant="outline"
                      className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
                    >
                      {p.type}
                    </Badge>
                  )}
                  <p className="truncate text-sm font-semibold leading-tight">{p.title}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {shortenAddress(p.chainId, 6)}
                  </p>
                </div>

                {/* Status */}
                <div className="flex shrink-0 flex-col items-start gap-1 sm:items-center">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Status
                  </span>
                  {p.agentId ? (
                    <Badge variant="verified" className="gap-1">
                      <Check className="h-3 w-3" /> Agent Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 text-muted-foreground">
                      <ShieldOff className="h-3 w-3" /> No Agent
                    </Badge>
                  )}
                </div>

                {/* Authorized agent */}
                <div className="flex shrink-0 flex-col items-start gap-1 sm:items-center">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Authorized Agent
                  </span>
                  {agent ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={agent.avatar} alt={agent.name} />
                        <AvatarFallback>
                          <UserCog className="h-3.5 w-3.5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left sm:text-center">
                        <p className="text-xs font-medium leading-tight">{agent.name}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">
                          {p.agentWallet ? shortenAddress(p.agentWallet, 4) : "—"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs italic text-muted-foreground">Unassigned</span>
                  )}
                </div>

                {/* Action */}
                <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
                  {p.agentId ? (
                    <Button
                      variant="outline"
                      className="w-full gap-2 text-destructive hover:text-destructive sm:w-auto"
                      disabled={isPending}
                      onClick={() => handleAssign(p.id, null)}
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ShieldOff className="h-4 w-4" />
                      )}
                      Remove Agent
                    </Button>
                  ) : (
                    <>
                      <Select
                        value={pendingSelection}
                        onValueChange={(v) =>
                          setSelectedAgent((prev) => ({ ...prev, [p.id]: v }))
                        }
                        disabled={isPending}
                      >
                        <SelectTrigger className="w-full sm:w-44">
                          <SelectValue placeholder="Select agent..." />
                        </SelectTrigger>
                        <SelectContent>
                          {agents.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        className={cn("gap-2")}
                        disabled={isPending || !pendingSelection}
                        onClick={() => handleAssign(p.id, pendingSelection)}
                      >
                        {isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        Assign Agent
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DashboardShell>
  );
}