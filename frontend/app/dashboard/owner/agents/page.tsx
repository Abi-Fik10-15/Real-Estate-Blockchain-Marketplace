"use client";

import * as React from "react";
import Link from "next/link";
import {
  Check,
  Info,
  Loader2,
  Mail,
  Plus,
  ShieldCheck,
  ShieldOff,
  UserCog,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { OWNER_NAV } from "@/components/dashboard/nav-configs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { InviteAgentPanel } from "@/features/agents/invite-agent-panel";
import { shortenAddress, cn } from "@/lib/utils";
import type { User } from "@/types";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  );
}

export default function OwnerAgentsPage() {
  const user = useAuthStore((s) => s.user);
  const fetchByOwner = usePropertyStore((s) => s.fetchByOwner);
  const isLoadingProperties = usePropertyStore((s) => s.isLoading);
  const properties = usePropertyStore((s) => s.properties).filter(
    (p) => p.ownerId === user?.id
  );
  const assignAgent = usePropertyStore((s) => s.assignAgent);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [pendingAgentAssign, setPendingAgentAssign] = React.useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = React.useState<Record<string, string>>({});
  const [directoryProperty, setDirectoryProperty] = React.useState<Record<string, string>>({});
  const [highlightAgentId, setHighlightAgentId] = React.useState<string | null>(null);
  const { data: agents = [], isLoading: agentsLoading, refetch: refetchAgents } = useAgents();

  React.useEffect(() => {
    if (user?.id) {
      void fetchByOwner(user.id);
    }
  }, [user?.id, fetchByOwner]);

  const assignedCount = properties.filter((p) => !!p.agentId).length;

  const handleAssign = async (propertyId: string, agentId: string | null) => {
    setPendingId(propertyId);
    try {
      if (!agentId) {
        await assignAgent(propertyId, null);
        toast.success("Agent removed from listing");
      } else {
        const agent = agents.find((a) => a.id === agentId);
        if (!agent) {
          toast.error("Agent not found");
          return;
        }
        await assignAgent(propertyId, { id: agent.id, wallet: agent.walletAddress });
        toast.success(`${agent.name} assigned to listing`);
        setSelectedAgent((prev) => ({ ...prev, [propertyId]: agentId }));
      }
    } catch {
      toast.error("Failed to update agent assignment");
    } finally {
      setPendingId(null);
    }
  };

  const handleAssignFromDirectory = async (agent: User) => {
    const propertyId = directoryProperty[agent.id];
    if (!propertyId) {
      toast.error("Select a listing first");
      return;
    }
    setPendingAgentAssign(agent.id);
    try {
      await assignAgent(propertyId, { id: agent.id, wallet: agent.walletAddress });
      toast.success(`${agent.name} assigned to listing`);
      setSelectedAgent((prev) => ({ ...prev, [propertyId]: agent.id }));
    } catch {
      toast.error("Failed to assign agent");
    } finally {
      setPendingAgentAssign(null);
    }
  };

  const handleAgentFound = (agent: User) => {
    setHighlightAgentId(agent.id);
    void refetchAgents();
  };

  return (
    <DashboardShell title="Assign Agents" roleLabel="Property Owner" nav={OWNER_NAV}>
      <div className="space-y-5">
        <div className="rounded-xl border border-border/60 bg-card px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-base font-semibold text-foreground">Agent Management</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {properties.length > 0 ? (
                  <>
                    {properties.length} {properties.length === 1 ? "property" : "properties"} ·{" "}
                    <span className="text-primary">{assignedCount} with agent</span> ·{" "}
                    {properties.length - assignedCount} unassigned · {agents.length} available
                    agents
                  </>
                ) : (
                  <>
                    {agents.length} available {agents.length === 1 ? "agent" : "agents"} · create a
                    listing to assign one
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            Browse registered agents below, then assign one to each of your listings. Assigned agents
            can manage buyer inquiries, update listing status, and run verification checks.
          </p>
        </div>

        <div>
          <SectionLabel>Add Agent</SectionLabel>
          <div className="mt-2">
            <InviteAgentPanel onAgentFound={handleAgentFound} />
          </div>
        </div>

        <div>
          <SectionLabel>Available Agents</SectionLabel>
          <Card className="mt-2 border-border/60">
            <CardHeader className="border-b border-border/60 pb-3">
              <CardTitle className="text-sm text-primary">Agent Directory</CardTitle>
              <CardDescription className="text-xs">
                Active agents registered on ChainEstate
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {agentsLoading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading agents…
                </div>
              ) : agents.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                  No agents in the directory yet. Use <strong>Add Agent</strong> above to invite
                  someone or share the agent signup link.
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {agents.map((agent) => {
                    const assignedListings = properties.filter((p) => p.agentId === agent.id);
                    const isAssignPending = pendingAgentAssign === agent.id;
                    const selectedProperty = directoryProperty[agent.id] ?? "";

                    return (
                      <div
                        key={agent.id}
                        className={cn(
                          "flex flex-col gap-3 px-5 py-3.5 lg:flex-row lg:items-center lg:justify-between",
                          highlightAgentId === agent.id && "bg-primary/5"
                        )}
                      >
                        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={agent.avatar} alt={agent.name} />
                            <AvatarFallback>{agent.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-medium">{agent.name}</p>
                              {agent.kycStatus === "verified" && (
                                <Badge variant="verified" className="gap-1 text-[10px]">
                                  <ShieldCheck className="h-3 w-3" /> KYC
                                </Badge>
                              )}
                            </div>
                            <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                              <Mail className="h-3 w-3 shrink-0" />
                              {agent.email}
                            </p>
                            {agent.walletAddress && (
                              <p className="font-mono text-[10px] text-muted-foreground">
                                {shortenAddress(agent.walletAddress, 6)}
                              </p>
                            )}
                          </div>
                          <div className="text-right text-xs text-muted-foreground lg:ml-auto lg:mr-4">
                            <p className="font-semibold tabular-nums text-primary">
                              {assignedListings.length}
                            </p>
                            <p>your listings</p>
                          </div>
                        </div>

                        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
                          {properties.length > 0 ? (
                            <>
                              <Select
                                value={selectedProperty || undefined}
                                onValueChange={(v) =>
                                  setDirectoryProperty((prev) => ({ ...prev, [agent.id]: v }))
                                }
                                disabled={isAssignPending}
                              >
                                <SelectTrigger className="h-8 w-full text-xs sm:w-48">
                                  <SelectValue placeholder="Select listing…" />
                                </SelectTrigger>
                                <SelectContent>
                                  {properties.map((p) => (
                                    <SelectItem key={p.id} value={p.id} className="text-xs">
                                      {p.title}
                                      {p.agentId === agent.id ? " (assigned)" : ""}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                className="gap-1.5"
                                disabled={
                                  isAssignPending ||
                                  !selectedProperty ||
                                  properties.find((p) => p.id === selectedProperty)?.agentId ===
                                    agent.id
                                }
                                onClick={() => void handleAssignFromDirectory(agent)}
                              >
                                {isAssignPending ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Check className="h-3.5 w-3.5" />
                                )}
                                Assign to listing
                              </Button>
                            </>
                          ) : (
                            <Button asChild variant="outline" size="sm" className="gap-1.5">
                              <Link href="/dashboard/owner/properties/new">
                                <Plus className="h-3.5 w-3.5" />
                                Create listing to assign
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <SectionLabel>Property Assignments</SectionLabel>
          <Card className="mt-2 border-border/60">
            <CardHeader className="border-b border-border/60 pb-3">
              <CardTitle className="text-sm text-primary">Listings</CardTitle>
              <CardDescription className="text-xs">
                Assign or change the agent for each property
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingProperties ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading your listings…
                </div>
              ) : properties.length === 0 ? (
                <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-border/60">
                    <UserCog className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">No properties to assign yet</p>
                    <p className="max-w-sm text-sm text-muted-foreground">
                      Create a listing first, then pick an agent from the directory above for that
                      property.
                    </p>
                  </div>
                  <Button asChild size="sm" className="mt-1 gap-2">
                    <Link href="/dashboard/owner/properties/new">
                      <Plus className="h-4 w-4" /> Create Property
                    </Link>
                  </Button>
                </div>
              ) : (
              <div className="divide-y divide-border/40">
                {properties.map((p) => {
                  const agent = agents.find((a) => a.id === p.agentId);
                  const isPending = pendingId === p.id;
                  const pendingSelection =
                    selectedAgent[p.id] ?? p.agentId ?? "";

                  return (
                    <div
                      key={p.id}
                      className="flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-muted/20 lg:flex-row lg:items-center"
                    >
                      <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-border/60">
                        {p.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted">
                            <UserCog className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          {p.type}
                        </p>
                        <p className="truncate text-sm font-semibold">{p.title}</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {p.chainId ? shortenAddress(p.chainId, 6) : "Pending mint"}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-col gap-1">
                        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          Agent
                        </span>
                        {p.agentId ? (
                          <Badge variant="verified" className="gap-1 text-xs">
                            <Check className="h-3 w-3" /> Assigned
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 text-xs text-muted-foreground">
                            <ShieldOff className="h-3 w-3" /> Unassigned
                          </Badge>
                        )}
                      </div>

                      {agent && (
                        <div className="flex shrink-0 items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={agent.avatar} alt={agent.name} />
                            <AvatarFallback>
                              <UserCog className="h-3.5 w-3.5" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-medium">{agent.name}</p>
                            <p className="font-mono text-[10px] text-muted-foreground">
                              {p.agentWallet ? shortenAddress(p.agentWallet, 4) : "—"}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
                        <Select
                          value={pendingSelection || undefined}
                          onValueChange={(v) =>
                            setSelectedAgent((prev) => ({ ...prev, [p.id]: v }))
                          }
                          disabled={isPending || agents.length === 0}
                        >
                          <SelectTrigger className="h-8 w-full text-xs sm:w-44">
                            <SelectValue placeholder="Select agent…" />
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
                          disabled={
                            isPending ||
                            !pendingSelection ||
                            pendingSelection === p.agentId
                          }
                          onClick={() => handleAssign(p.id, pendingSelection)}
                        >
                          {isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          {p.agentId ? "Change" : "Assign"}
                        </Button>
                        {p.agentId && (
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn("gap-1.5 text-destructive hover:text-destructive")}
                            disabled={isPending}
                            onClick={() => {
                              setSelectedAgent((prev) => ({ ...prev, [p.id]: "" }));
                              void handleAssign(p.id, null);
                            }}
                          >
                            <ShieldOff className="h-3.5 w-3.5" />
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
