"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Copy, Loader2, Search, Send, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";
import type { User } from "@/types";

type InviteAgentPanelProps = {
  onAgentFound?: (agent: User) => void;
};

export function InviteAgentPanel({ onAgentFound }: InviteAgentPanelProps) {
  const queryClient = useQueryClient();
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [lookupResult, setLookupResult] = React.useState<User | null>(null);
  const [searching, setSearching] = React.useState(false);
  const [inviting, setInviting] = React.useState(false);

  const agentSignupUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/register?role=agent${email ? `&email=${encodeURIComponent(email.trim().toLowerCase())}` : ""}`
      : "/register?role=agent";

  const handleLookup = async () => {
    if (!email.trim()) {
      toast.error("Enter an email address");
      return;
    }
    setSearching(true);
    setLookupResult(null);
    try {
      const agent = await api.lookupAgentByEmail(email);
      if (agent) {
        setLookupResult(agent);
        onAgentFound?.(agent);
        toast.success(`${agent.name} is already registered as an agent`);
      } else {
        toast.message("No agent found — send an invitation below");
      }
    } catch {
      toast.error("Lookup failed");
    } finally {
      setSearching(false);
    }
  };

  const handleInvite = async () => {
    if (!email.trim()) {
      toast.error("Enter an email address");
      return;
    }
    setInviting(true);
    try {
      const result = await api.inviteAgent(email, message.trim() || undefined);
      if (result.status === "existing" && result.user) {
        setLookupResult(result.user);
        onAgentFound?.(result.user);
      }
      toast.success(result.message);
      void queryClient.invalidateQueries({ queryKey: ["agents"] });
    } catch (error) {
      const msg =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message === "string"
          ? (error as { response: { data: { message: string } } }).response.data.message
          : "Could not send invitation";
      toast.error(msg);
    } finally {
      setInviting(false);
    }
  };

  const copySignupLink = async () => {
    try {
      await navigator.clipboard.writeText(agentSignupUrl);
      toast.success("Agent signup link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="border-b border-border/60 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm text-primary">
          <UserPlus className="h-4 w-4" />
          Add Agent
        </CardTitle>
        <CardDescription className="text-xs">
          Find an existing agent by email or invite someone new to register on ChainEstate.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="agent-email">Agent email</Label>
            <Input
              id="agent-email"
              type="email"
              placeholder="agent@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-message">Optional message</Label>
            <Textarea
              id="invite-message"
              rows={1}
              placeholder="We'd like you to represent our listings…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[38px] resize-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={searching || !email.trim()}
            onClick={() => void handleLookup()}
          >
            {searching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Search className="h-3.5 w-3.5" />
            )}
            Find agent
          </Button>
          <Button
            type="button"
            size="sm"
            className="gap-1.5"
            disabled={inviting || !email.trim()}
            onClick={() => void handleInvite()}
          >
            {inviting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Send invitation
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => void copySignupLink()}
          >
            <Copy className="h-3.5 w-3.5" />
            Copy signup link
          </Button>
        </div>

        {lookupResult && (
          <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={lookupResult.avatar} alt={lookupResult.name} />
              <AvatarFallback>{lookupResult.name[0]}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-medium">{lookupResult.name}</p>
                <Badge variant="verified" className="text-[10px]">
                  Active agent
                </Badge>
              </div>
              <p className="truncate text-xs text-muted-foreground">{lookupResult.email}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
