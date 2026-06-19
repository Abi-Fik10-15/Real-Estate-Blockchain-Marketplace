"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { AGENT_NAV } from "@/components/dashboard/nav-configs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePropertyStore } from "@/store/property-store";
import { useAuthStore } from "@/store/auth-store";
import { formatCurrency, shortenAddress } from "@/lib/utils";
import type { ListingStatus } from "@/types";

const STATUSES: ListingStatus[] = ["active", "pending", "sold", "rented", "draft"];

export default function AgentPropertiesPage() {
  const userId = useAuthStore((s) => s.user?.id);
  const properties = usePropertyStore((s) => s.properties);
  const assigned = userId ? properties.filter((p) => p.agentId === userId) : [];
  const setStatus = usePropertyStore((s) => s.setStatus);

  return (
    <DashboardShell title="Assigned Properties" roleLabel="Property Agent" nav={AGENT_NAV}>
      <PageHeader
        title="Manage Listings"
        description="Update listing status for properties you are authorized to manage."
      />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assigned.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <p className="font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.location.city} · {p.chainId}
                    </p>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {shortenAddress(p.ownerWallet, 5)}
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(p.price)}</TableCell>
                  <TableCell>
                    <Select
                      value={p.status}
                      onValueChange={(v) => {
                        setStatus(p.id, v as ListingStatus);
                        toast.success(`Status set to ${v}`);
                      }}
                    >
                      <SelectTrigger className="h-8 w-32 capitalize">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/property/${p.id}`}>View</Link>
                    </Button>
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
