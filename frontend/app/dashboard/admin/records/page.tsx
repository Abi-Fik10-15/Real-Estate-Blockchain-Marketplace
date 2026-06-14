"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { ADMIN_NAV } from "@/components/dashboard/nav-configs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePropertyStore } from "@/store/property-store";
import { shortenAddress } from "@/lib/utils";

export default function AdminRecordsPage() {
  const properties = usePropertyStore((s) => s.properties);

  return (
    <DashboardShell title="Ownership Records" roleLabel="Administrator" nav={ADMIN_NAV}>
      <PageHeader
        title="Ownership Records"
        description="Immutable on-chain ownership ledger across all registered properties."
      />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Owner Wallet</TableHead>
                <TableHead>Agent Wallet</TableHead>
                <TableHead>On-chain Events</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.chainId}</TableCell>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {shortenAddress(p.ownerWallet, 5)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {p.agentWallet ? shortenAddress(p.agentWallet, 5) : "—"}
                  </TableCell>
                  <TableCell>{p.history.length}</TableCell>
                  <TableCell>
                    {p.verification.status === "verified" ? (
                      <Badge variant="verified">Verified</Badge>
                    ) : (
                      <Badge variant="warning">Pending</Badge>
                    )}
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
