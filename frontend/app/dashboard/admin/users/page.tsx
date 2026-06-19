"use client";

import * as React from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { ADMIN_NAV } from "@/components/dashboard/nav-configs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUserStore } from "@/store/user-store";
import { shortenAddress } from "@/lib/utils";

export default function AdminUsersPage() {
  const users = useUserStore((s) => s.users);
  const toggleStatus = useUserStore((s) => s.toggleStatus);
  const [query, setQuery] = React.useState("");

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      u.role.includes(query.toLowerCase())
  );

  return (
    <DashboardShell title="User Management" roleLabel="Administrator" nav={ADMIN_NAV}>
      <PageHeader
        title="User Management"
        description="Suspend or reactivate accounts and monitor verification status."
        actions={
          <Input
            placeholder="Search users..."
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
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={u.avatar} alt={u.name} />
                        <AvatarFallback>{u.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{u.role}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {shortenAddress(u.walletAddress)}
                  </TableCell>
                  <TableCell>
                    {u.verified ? (
                      <Badge variant="verified">Verified</Badge>
                    ) : (
                      <Badge variant="outline">Unverified</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {u.status === "active" ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Suspended</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant={u.status === "active" ? "ghost" : "hero"}
                      onClick={() => {
                        toggleStatus(u.id);
                        toast.success(
                          u.status === "active" ? "Account suspended" : "Account reactivated"
                        );
                      }}
                    >
                      {u.status === "active" ? "Suspend" : "Activate"}
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
