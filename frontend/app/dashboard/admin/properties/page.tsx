"use client";

import * as React from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { ADMIN_NAV } from "@/components/dashboard/nav-configs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePropertyStore } from "@/store/property-store";
import { formatCurrency, shortenAddress } from "@/lib/utils";

export default function AdminPropertiesPage() {
  const properties = usePropertyStore((s) => s.properties);
  const [query, setQuery] = React.useState("");

  const filtered = properties.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.location.city.toLowerCase().includes(query.toLowerCase()) ||
      p.chainId.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <DashboardShell title="All Properties" roleLabel="Administrator" nav={ADMIN_NAV}>
      <PageHeader
        title="All Properties"
        description="Platform-wide registry of every on-chain property listing."
        actions={
          <Input
            placeholder="Search properties..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full sm:w-64"
          />
        }
      />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead className="text-right">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <p className="font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.location.city}</p>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{p.chainId}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {shortenAddress(p.ownerWallet, 4)}
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
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/property/${p.id}`}>Open</Link>
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
