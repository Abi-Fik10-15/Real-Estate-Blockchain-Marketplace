"use client";

import Link from "next/link";
import {
  Building2,
  ClipboardList,
  MessageSquare,
  ShieldCheck,
  Users,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { AGENT_NAV } from "@/components/dashboard/nav-configs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePropertyStore } from "@/store/property-store";
import { useInquiryStore } from "@/store/inquiry-store";
import { formatCurrency } from "@/lib/utils";

const AGENT_ID = "u-agent-1";

export default function AgentDashboard() {
  const assigned = usePropertyStore((s) => s.properties).filter(
    (p) => p.agentId === AGENT_ID
  );
  const inquiries = useInquiryStore((s) => s.inquiries);
  const openLeads = inquiries.filter((i) => i.status !== "closed").length;

  return (
    <DashboardShell title="Agent Dashboard" roleLabel="Property Agent" nav={AGENT_NAV}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Assigned Properties" value={assigned.length} icon={Building2} />
        <StatCard label="Active Leads" value={openLeads} icon={Users} accent="accent" />
        <StatCard
          label="Managed Listings"
          value={assigned.filter((p) => p.status === "active").length}
          icon={ClipboardList}
          accent="success"
        />
        <StatCard
          label="Pending Verification"
          value={assigned.filter((p) => p.verification.status !== "verified").length}
          icon={ShieldCheck}
          accent="warning"
        />
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Assigned Properties</CardTitle>
          <Button size="sm" variant="ghost" asChild>
            <Link href="/dashboard/agent/properties">Manage all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Owner Wallet</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Authorization</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assigned.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <p className="font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.location.city}</p>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {p.ownerWallet.slice(0, 10)}…
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(p.price)}</TableCell>
                  <TableCell>
                    <Badge variant="verified">Authorized ✓</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4" /> Recent Buyer Requests
          </CardTitle>
          <Button size="sm" variant="ghost" asChild>
            <Link href="/dashboard/agent/requests">View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {inquiries.slice(0, 3).map((i) => (
            <div
              key={i.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{i.propertyTitle}</p>
                <p className="truncate text-xs text-muted-foreground">{i.buyerName}</p>
              </div>
              <Badge variant="outline" className="capitalize">
                {i.type}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
