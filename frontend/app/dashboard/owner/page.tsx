"use client";

import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  PlusCircle,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { OWNER_NAV } from "@/components/dashboard/nav-configs";
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
import { formatCurrency } from "@/lib/utils";

const OWNER_ID = "u-owner-1";

export default function OwnerDashboard() {
  const properties = usePropertyStore((s) => s.properties).filter(
    (p) => p.ownerId === OWNER_ID
  );

  return (
    <DashboardShell title="Owner Dashboard" roleLabel="Property Owner" nav={OWNER_NAV}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Properties" value={properties.length} icon={Building2} />
        <StatCard
          label="Active Listings"
          value={properties.filter((p) => p.status === "active").length}
          icon={CheckCircle2}
          accent="success"
        />
        <StatCard
          label="Assigned Agents"
          value={new Set(properties.map((p) => p.agentId).filter(Boolean)).size}
          icon={UserCog}
          accent="accent"
        />
        <StatCard
          label="Pending Verification"
          value={properties.filter((p) => p.verification.status !== "verified").length}
          icon={ShieldCheck}
          accent="warning"
        />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Blockchain Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="hero" asChild>
            <Link href="/dashboard/owner/properties/new">
              <PlusCircle className="h-4 w-4" /> Create Property
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/owner/agents">
              <UserCog className="h-4 w-4" /> Assign Agents
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/owner/transfers">
              <ShieldCheck className="h-4 w-4" /> Transfer Ownership
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">My Properties</CardTitle>
          <Button size="sm" variant="ghost" asChild>
            <Link href="/dashboard/owner/properties">Manage all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Agent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.slice(0, 6).map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <p className="font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.location.city}</p>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(p.price)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {p.verification.status === "verified" ? (
                      <Badge variant="verified">Verified</Badge>
                    ) : (
                      <Badge variant="warning">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {p.agentWallet ? `${p.agentWallet.slice(0, 8)}…` : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
