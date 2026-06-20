"use client";

import * as React from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
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
import { toast } from "sonner";
import { usePropertyStore } from "@/store/property-store";
import { formatCurrency, shortenAddress } from "@/lib/utils";

export default function AdminPropertiesPage() {
  const properties = usePropertyStore((s) => s.properties);
  const approveProperty = usePropertyStore((s) => s.approveProperty);
  const [query, setQuery] = React.useState("");
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setPendingId(id);
    try {
      await approveProperty(id);
      toast.success("Listing verified and published");
    } catch {
      toast.error("Failed to approve listing");
    } finally {
      setPendingId(null);
    }
  };

  const filtered = properties.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.location.city.toLowerCase().includes(query.toLowerCase()) ||
      p.chainId.toLowerCase().includes(query.toLowerCase()),
  );

  const pendingCount = properties.filter((p) => p.status === "pending").length;

  return (
    <DashboardShell title="All Properties" roleLabel="Administrator" nav={ADMIN_NAV}>
      <div className="space-y-5">
        {/* Summary bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              <span className="text-primary">{properties.length}</span>{" "}
              {properties.length === 1 ? "property" : "properties"} on platform
              {pendingCount > 0 && (
                <span className="text-muted-foreground">
                  {" "}· {pendingCount} pending approval
                </span>
              )}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Platform-wide registry of every on-chain property listing.
            </p>
          </div>
          <Input
            placeholder="Search properties…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8 w-full text-sm sm:w-56"
          />
        </div>

        {/* Table */}
        <Card className="border-border/60">
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-primary">No properties found</p>
                <p className="text-xs text-muted-foreground">
                  Try a different search term.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Token</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <p className="font-medium">{p.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.location.city}
                        </p>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{p.chainId}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {shortenAddress(p.ownerWallet, 4)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(p.price)}
                      </TableCell>
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
                        <div className="flex justify-end gap-2">
                          {p.status === "pending" && (
                            <Button
                              size="sm"
                              disabled={pendingId === p.id}
                              onClick={() => handleApprove(p.id)}
                            >
                              Approve
                            </Button>
                          )}
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/property/${p.id}`}>Open</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
