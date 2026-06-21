"use client";

import * as React from "react";
import { toast } from "sonner";
import { Users } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
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
      u.role.includes(query.toLowerCase()),
  );

  const activeCount = users.filter((u) => u.status === "active").length;
  const suspendedCount = users.length - activeCount;

  return (
    <DashboardShell title="User Management" roleLabel="Administrator" nav={ADMIN_NAV}>
      <div className="space-y-5">
        {/* Summary bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              <span className="text-primary">{users.length}</span> registered users
              {suspendedCount > 0 && (
                <span className="text-muted-foreground">
                  {" "}· {suspendedCount} suspended
                </span>
              )}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Suspend or reactivate accounts and monitor verification status.
            </p>
          </div>
          <Input
            placeholder="Search users…"
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
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-primary">No users found</p>
                <p className="text-xs text-muted-foreground">
                  Try a different search term.
                </p>
              </div>
            ) : (
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
                            <AvatarFallback className="text-xs">
                              {u.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize text-sm">{u.role}</TableCell>
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
                          variant={u.status === "active" ? "outline" : "default"}
                          onClick={() => {
                            toggleStatus(u.id);
                            toast.success(
                              u.status === "active"
                                ? "Account suspended"
                                : "Account reactivated",
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
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
