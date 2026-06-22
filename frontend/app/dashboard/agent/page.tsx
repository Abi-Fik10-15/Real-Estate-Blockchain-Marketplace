"use client";

import Link from "next/link";
import {
  Building2,
  ClipboardList,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Users,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AGENT_NAV } from "@/components/dashboard/nav-configs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePropertyStore } from "@/store/property-store";
import { useInquiryStore } from "@/store/inquiry-store";
import { useAuthStore } from "@/store/auth-store";
import { formatCurrency, shortenAddress } from "@/lib/utils";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  );
}

export default function AgentDashboard() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;
  const properties = usePropertyStore((s) => s.properties);
  const assigned = userId ? properties.filter((p) => p.agentId === userId) : [];
  const allInquiries = useInquiryStore((s) => s.inquiries);

  // Scope inquiries to only properties this agent manages
  const assignedIds = new Set(assigned.map((p) => p.id));
  const inquiries = allInquiries.filter((i) => assignedIds.has(i.propertyId));
  const openLeads = inquiries.filter((i) => i.status !== "closed").length;
  const unreadLeads = inquiries.filter((i) => i.status === "new").length;

  const activeCount = assigned.filter((p) => p.status === "active").length;
  const pendingVerification = assigned.filter((p) => p.verification.status !== "verified").length;

  return (
    <DashboardShell title="Agent Dashboard" roleLabel="Property Agent" nav={AGENT_NAV}>
      <div className="space-y-5">

        {/* ── Summary bar ───────────────────────────────────────── */}
        <div className="rounded-xl border border-border/60 bg-card px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-base font-semibold text-foreground">
                Welcome back,{" "}
                <span className="text-primary">{user?.name ?? "Agent"}</span>
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {assigned.length} assigned {assigned.length === 1 ? "property" : "properties"}
                {unreadLeads > 0 && (
                  <> · <span className="font-medium text-amber-600 dark:text-amber-400">{unreadLeads} unread {unreadLeads === 1 ? "request" : "requests"}</span></>
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {[
                { label: "Active Listings", value: activeCount.toLocaleString() },
                { label: "Open Leads", value: openLeads.toLocaleString() },
                { label: "Pending Verification", value: pendingVerification.toLocaleString() },
              ].map((s) => (
                <div key={s.label} className="text-right">
                  <p className="text-lg font-bold tabular-nums text-primary">{s.value}</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── KPI cards ─────────────────────────────────────────── */}
        <div className="space-y-3">
          <SectionLabel>Overview</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Assigned Properties", value: assigned.length, icon: Building2 },
              { label: "Active Leads", value: openLeads, icon: Users },
              { label: "Active Listings", value: activeCount, icon: ClipboardList },
              { label: "Pending Verification", value: pendingVerification, icon: ShieldCheck },
            ].map(({ label, value, icon: Icon }) => (
              <Card key={label} className="border-border/60">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/30 text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-bold tabular-nums text-primary">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ── Main content ──────────────────────────────────────── */}
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Assigned properties — wider */}
          <div className="space-y-3 lg:col-span-2">
            <SectionLabel>Assigned Properties</SectionLabel>
            <Card className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-3">
                <div>
                  <CardTitle className="text-sm text-primary">Portfolio</CardTitle>
                  <CardDescription className="text-xs">Properties you are authorized to manage</CardDescription>
                </div>
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" asChild>
                  <Link href="/dashboard/agent/properties">
                    Manage all <ExternalLink className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/40">
                  {assigned.slice(0, 6).map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-12 shrink-0 overflow-hidden rounded-md border border-border/60">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{p.title}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {p.location.city} · <span className="font-mono">{shortenAddress(p.ownerWallet, 4)}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="hidden text-sm font-semibold text-primary tabular-nums sm:block">
                          {formatCurrency(p.price)}
                        </span>
                        <Badge variant="verified" className="text-[10px] px-2">Authorized</Badge>
                      </div>
                    </div>
                  ))}
                  {assigned.length === 0 && (
                    <div className="flex flex-col items-center gap-3 py-12 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-border/60">
                        <Building2 className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                      <p className="text-sm text-muted-foreground">No properties assigned yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent buyer requests — sidebar */}
          <div className="space-y-3">
            <SectionLabel>Recent Requests</SectionLabel>
            <Card className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-sm text-primary">
                    <MessageSquare className="h-4 w-4" />
                    Buyer Requests
                  </CardTitle>
                  <CardDescription className="text-xs">Latest purchase &amp; rental inquiries</CardDescription>
                </div>
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" asChild>
                  <Link href="/dashboard/agent/requests">
                    All <ExternalLink className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/40">
                  {inquiries.slice(0, 5).map((i) => (
                    <div key={i.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{i.propertyTitle}</p>
                        <p className="truncate text-[11px] text-muted-foreground">{i.buyerName}</p>
                      </div>
                      <Badge
                        variant={i.status === "new" ? "warning" : i.status === "closed" ? "success" : "secondary"}
                        className="shrink-0 capitalize text-[10px] px-2"
                      >
                        {i.type}
                      </Badge>
                    </div>
                  ))}
                  {inquiries.length === 0 && (
                    <div className="flex items-center gap-2 px-4 py-8 text-sm text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      No requests yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </DashboardShell>
  );
}
