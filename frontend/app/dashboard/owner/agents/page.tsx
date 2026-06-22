"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Info, Loader2, Plus, ShieldOff, UserCog } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
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

  const assignedCount = properties.filter((p) => !!p.agentId).length;

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
        <div className="space-y-5">
          <div className="rounded-xl border border-border/60 bg-card px-5 py-4">
            <h1 className="text-base font-semibold text-foreground">Agent Authorization</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Authorize agents to manage individual listings on-chain.
            </p>
          </div>
          <Card className="border-border/60">
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-border/60">
                <UserCog className="h-7 w-7 text-muted-foreground/40" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">No properties registered yet</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  You need to register a property before you can assign an agent.
                </p>
              </div>
              <Button asChild className="mt-2 gap-2">
                <Link href="/dashboard/owner/properties/new">
                  <Plus className="h-4 w-4" /> Create Property
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Assign Agents" roleLabel="Property Owner" nav={OWNER_NAV}>
      <div className="space-y-5">

        {/* Summary bar */}
        <div className="rounded-xl border border-border/60 bg-card px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-base font-semibold text-foreground">Agent Authorization</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {properties.length} {properties.length === 1 ? "property" : "properties"} ·{" "}
                <span className="text-primary">{assignedCount} with agent</span> ·{" "}
                {properties.length - assignedCount} unassigned
              </p>
            </div>
          </div>
        </div>

        {/* Info notice */}
        <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            Assigning an agent grants them dashboard access to manage inquiries, schedule visits,
            and update listing details for that property.
          </p>
        </div>

        {/* Property cards */}
        <Card className="border-border/60">
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle className="text-sm text-primary">Properties</CardTitle>
            <CardDescription className="text-xs">Manage agent assignments per listing</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/40">
              {properties.map((p) => {
                const agent = agents.find((a) => a.id === p.agentId);
                const isPending = pendingId === p.id;
                const pendingSelection = selectedAgent[p.id] ?? "";

                return (
                  <div
                    key={p.id}
                    className="flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-muted/20 sm:flex-row sm:items-center"
                  >
                    {/* Thumbnail */}
                    <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-border/60">
                      {p.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <UserCog className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <div className="min-w-0 flex-1">
                      {p.type && (
                        <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          {p.type}
                        </p>
                      )}
                      <p className="truncate text-sm font-semibold">{p.title}</p>
                      <p className="font-mono text-xs text-muted-foreground">{shortenAddress(p.chainId, 6)}</p>
                    </div>

                    {/* Status */}
                    <div className="flex shrink-0 flex-col gap-1">
                      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Status</span>
                      {p.agentId ? (
                        <Badge variant="verified" className="gap-1 text-xs">
                          <Check className="h-3 w-3" /> Agent Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 text-xs text-muted-foreground">
                          <ShieldOff className="h-3 w-3" /> No Agent
                        </Badge>
                      )}
                    </div>

                    {/* Current agent */}
                    {agent && (
                      <div className="flex shrink-0 flex-col gap-1">
                        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Assigned</span>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={agent.avatar} alt={agent.name} />
                            <AvatarFallback><UserCog className="h-3 w-3" /></AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-medium">{agent.name}</p>
                            <p className="font-mono text-[10px] text-muted-foreground">
                              {p.agentWallet ? shortenAddress(p.agentWallet, 4) : "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action */}
                    <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
                      {p.agentId ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn("gap-1.5 text-destructive hover:text-destructive")}
                          disabled={isPending}
                          onClick={() => handleAssign(p.id, null)}
                        >
                          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldOff className="h-3.5 w-3.5" />}
                          Remove
                        </Button>
                      ) : (
                        <div className="flex w-full items-center gap-2 sm:w-auto">
                          <Select
                            value={pendingSelection}
                            onValueChange={(v) => setSelectedAgent((prev) => ({ ...prev, [p.id]: v }))}
                            disabled={isPending}
                          >
                            <SelectTrigger className="h-8 w-full text-xs sm:w-40">
                              <SelectValue placeholder="Select agent..." />
                            </SelectTrigger>
                            <SelectContent>
                              {agents.map((a) => (
                                <SelectItem key={a.id} value={a.id} className="text-xs">
                                  {a.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            className="gap-1.5"
                            disabled={isPending || !pendingSelection}
                            onClick={() => handleAssign(p.id, pendingSelection)}
                          >
                            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                            Assign
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

      </div>
    </DashboardShell>
  );
}
