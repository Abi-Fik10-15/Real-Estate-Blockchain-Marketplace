"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftRight, ExternalLink, Search } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ADMIN_NAV } from "@/components/dashboard/nav-configs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { api } from "@/services/api";
import { usePropertyStore } from "@/store/property-store";
import { useUserStore } from "@/store/user-store";
import { formatCurrency, shortenAddress } from "@/lib/utils";
import { etherscanTxUrl } from "@/lib/blockchain-utils";

const STATUS_VARIANT: Record<
  string,
  "success" | "warning" | "secondary" | "outline"
> = {
  completed: "success",
  escrow: "warning",
  initiated: "secondary",
  cancelled: "outline",
};

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AdminAuditPage() {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [typeFilter, setTypeFilter] = React.useState("all");

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions", "all"],
    queryFn: () => api.getAllTransactions(),
    staleTime: 30_000,
  });

  const properties = usePropertyStore((s) => s.properties);
  const users = useUserStore((s) => s.users);

  const getProperty = (id: string) => properties.find((p) => p.id === id);
  const getUser = (id: string) => users.find((u) => u.id === id);

  const filtered = transactions.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (typeFilter !== "all" && t.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const prop = getProperty(t.propertyId);
      const buyer = getUser(t.buyerId);
      const seller = getUser(t.sellerId);
      return (
        prop?.title.toLowerCase().includes(q) ||
        buyer?.name.toLowerCase().includes(q) ||
        seller?.name.toLowerCase().includes(q) ||
        t.txHash?.toLowerCase().includes(q) ||
        t.confirmTxHash?.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const completedCount = transactions.filter((t) => t.status === "completed").length;
  const escrowCount = transactions.filter((t) => t.status === "escrow").length;

  return (
    <DashboardShell
      title="Transaction Audit Log"
      roleLabel="Administrator"
      nav={ADMIN_NAV}
    >
      <div className="space-y-5">
        {/* Summary bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              <span className="text-primary">{transactions.length}</span>{" "}
              {transactions.length === 1 ? "transaction" : "transactions"}
              {completedCount > 0 && (
                <span className="text-muted-foreground">
                  {" "}· {completedCount} completed
                </span>
              )}
              {escrowCount > 0 && (
                <span className="text-muted-foreground">
                  {" "}· {escrowCount} in escrow
                </span>
              )}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Full ledger of all platform transactions — sales, rentals, escrow
              deposits, and on-chain confirmations.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search…"
                className="h-8 w-48 pl-8 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-36 text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="initiated">Initiated</SelectItem>
                <SelectItem value="escrow">Escrow</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-8 w-28 text-sm">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="sale">Sale</SelectItem>
                <SelectItem value="rental">Rental</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table card */}
        <Card className="border-border/60">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-3 p-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 animate-pulse rounded-lg bg-muted"
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                  <ArrowLeftRight className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-primary">
                  No transactions found
                </p>
                <p className="text-xs text-muted-foreground">
                  {transactions.length > 0
                    ? "Try adjusting your filters."
                    : "Transactions will appear here once users initiate sales or rentals."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Escrow Tx</TableHead>
                    <TableHead>Confirm Tx</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t) => {
                    const prop = getProperty(t.propertyId);
                    const buyer = getUser(t.buyerId);
                    const seller = getUser(t.sellerId);
                    const escrowUrl = t.txHash ? etherscanTxUrl(t.txHash) : null;
                    const confirmUrl = t.confirmTxHash
                      ? etherscanTxUrl(t.confirmTxHash)
                      : null;

                    return (
                      <TableRow key={t.id}>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {formatDate(t.createdAt)}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium">
                            {prop?.title ?? "—"}
                          </p>
                          <p className="font-mono text-[10px] text-muted-foreground">
                            {t.blockchainTokenId || "off-chain"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{buyer?.name ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">
                            {buyer?.role ?? ""}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{seller?.name ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">
                            {seller?.role ?? ""}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              t.type === "rental" ? "secondary" : "outline"
                            }
                            className="capitalize text-[10px]"
                          >
                            {t.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(t.amount)}
                          {t.type === "rental" && (
                            <span className="text-xs font-normal text-muted-foreground">
                              /mo
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {t.txHash ? (
                            escrowUrl ? (
                              <a
                                href={escrowUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-primary hover:underline"
                              >
                                {shortenAddress(t.txHash, 5)}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              shortenAddress(t.txHash, 5)
                            )
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {t.confirmTxHash ? (
                            confirmUrl ? (
                              <a
                                href={confirmUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-primary hover:underline"
                              >
                                {shortenAddress(t.confirmTxHash, 5)}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              shortenAddress(t.confirmTxHash, 5)
                            )
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={STATUS_VARIANT[t.status] ?? "outline"}
                            className="capitalize text-[10px]"
                          >
                            {t.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <p className="text-right text-xs text-muted-foreground">
          {filtered.length} of {transactions.length} transactions
        </p>
      </div>
    </DashboardShell>
  );
}
