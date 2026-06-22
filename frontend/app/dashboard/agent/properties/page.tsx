"use client";

import * as React from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AGENT_NAV } from "@/components/dashboard/nav-configs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePropertyStore } from "@/store/property-store";
import { useAuthStore } from "@/store/auth-store";
import { formatCurrency, shortenAddress } from "@/lib/utils";
import type { ListingStatus } from "@/types";

const STATUSES: ListingStatus[] = ["active", "pending", "sold", "rented", "draft"];

const STATUS_COLOR: Record<ListingStatus, string> = {
  active: "text-emerald-600 dark:text-emerald-400",
  pending: "text-amber-600 dark:text-amber-400",
  sold: "text-primary",
  rented: "text-primary",
  draft: "text-muted-foreground",
};

export default function AgentPropertiesPage() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;
  const properties = usePropertyStore((s) => s.properties);
  const assigned = userId ? properties.filter((p) => p.agentId === userId) : [];
  const setStatus = usePropertyStore((s) => s.setStatus);

  const activeCount = assigned.filter((p) => p.status === "active").length;
  const verifiedCount = assigned.filter((p) => p.verification.status === "verified").length;

  return (
    <DashboardShell title="Assigned Properties" roleLabel="Property Agent" nav={AGENT_NAV}>
      <div className="space-y-5">

        {/* Summary bar */}
        <div className="rounded-xl border border-border/60 bg-card px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-base font-semibold text-foreground">Manage Listings</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {assigned.length} assigned {assigned.length === 1 ? "property" : "properties"} · {activeCount} active · {verifiedCount} verified
              </p>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        {assigned.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Total Assigned", value: assigned.length },
              { label: "Active", value: activeCount },
              { label: "Verified", value: verifiedCount },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg border border-border/50 bg-muted/10 px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="mt-1 text-xl font-bold tabular-nums text-primary">{value}</p>
              </div>
            ))}
          </div>
        )}

        {assigned.length === 0 ? (
          <Card className="border-border/60">
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-border/60">
                <Building2 className="h-7 w-7 text-muted-foreground/40" />
              </div>
              <p className="font-medium">No properties assigned yet</p>
              <p className="text-sm text-muted-foreground">
                A property owner must authorize you before listings appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/60">
            <CardHeader className="border-b border-border/60 pb-3">
              <CardTitle className="text-sm text-primary">Assigned Listings</CardTitle>
              <CardDescription className="text-xs">
                Update listing status for properties you are authorized to manage.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                {assigned.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-muted/20 sm:flex-row sm:items-center sm:justify-between"
                  >
                    {/* Left: thumbnail + info */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-border/60">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{p.title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                          <span>{p.location.city}</span>
                          <span>·</span>
                          <span className="font-mono text-[10px]">{p.chainId}</span>
                          <span>·</span>
                          <span className="font-semibold text-primary tabular-nums">{formatCurrency(p.price)}</span>
                        </div>
                        <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                          Owner: {shortenAddress(p.ownerWallet, 5)}
                        </p>
                      </div>
                    </div>

                    {/* Right: status + action */}
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Select
                        value={p.status}
                        onValueChange={(v) => {
                          setStatus(p.id, v as ListingStatus);
                          toast.success(`Status set to "${v}"`);
                        }}
                      >
                        <SelectTrigger className={`h-8 w-32 text-xs font-semibold capitalize ${STATUS_COLOR[p.status]}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s} className={`text-xs capitalize font-medium ${STATUS_COLOR[s]}`}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {p.verification.status === "verified" ? (
                        <Badge variant="verified" className="text-[10px]">Verified</Badge>
                      ) : (
                        <Badge variant="warning" className="text-[10px]">Pending</Badge>
                      )}

                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" asChild>
                        <Link href={`/property/${p.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </DashboardShell>
  );
}
