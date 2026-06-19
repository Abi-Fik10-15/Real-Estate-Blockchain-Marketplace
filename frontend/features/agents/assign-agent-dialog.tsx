"use client";

import * as React from "react";
import { Check, Loader2, UserCog } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAgents } from "@/hooks/use-properties";
import { usePropertyStore } from "@/store/property-store";
import { shortenAddress } from "@/lib/utils";

export function AssignAgentDialog({
  propertyId,
  currentAgentId,
  trigger,
}: {
  propertyId: string;
  currentAgentId?: string;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [assigned, setAssigned] = React.useState<string | null>(currentAgentId ?? null);
  const assignAgent = usePropertyStore((s) => s.assignAgent);
  const { data: agents = [] } = useAgents();

  React.useEffect(() => {
    setAssigned(currentAgentId ?? null);
  }, [currentAgentId]);

  const toggle = async (agentId: string, wallet: string) => {
    setPendingId(agentId);
    try {
      if (assigned === agentId) {
        await assignAgent(propertyId, null);
        setAssigned(null);
        toast.success("Agent removed from listing");
      } else {
        await assignAgent(propertyId, { id: agentId, wallet });
        setAssigned(agentId);
        toast.success("Agent assigned to listing");
      }
    } catch {
      toast.error("Failed to update agent assignment");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline">
            <UserCog className="h-4 w-4" /> Assign Agent
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Agent</DialogTitle>
          <DialogDescription>
            Authorize an agent to manage your listing. Authorization is recorded on-chain.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {agents.map((a) => {
            const isAssigned = assigned === a.id;
            return (
              <div
                key={a.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="h-9 w-9">
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
                <div className="flex items-center gap-2">
                  {isAssigned && (
                    <Badge variant="verified">
                      <Check className="h-3 w-3" /> Authorized
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant={isAssigned ? "outline" : "hero"}
                    disabled={pendingId === a.id}
                    onClick={() => toggle(a.id, a.walletAddress)}
                  >
                    {pendingId === a.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isAssigned ? (
                      "Remove"
                    ) : (
                      "Assign"
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
