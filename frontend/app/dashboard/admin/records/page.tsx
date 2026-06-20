"use client";

import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Loader2, ShieldCheck } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ADMIN_NAV } from "@/components/dashboard/nav-configs";
import { AdminKycPanel } from "@/components/dashboard/admin/admin-kyc-panel";
import { api } from "@/services/api";
import { CONTRACT_ADDRESS } from "@/lib/constants";
import {
  etherscanAddressUrl,
  etherscanTokenUrl,
  isOnChainTokenId,
} from "@/lib/blockchain-utils";
import { shortenAddress } from "@/lib/utils";

type OwnershipRecord = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  ownerWallet: string;
  agentWallet: string;
  priceEth: number;
  status: string;
  inEscrow: boolean;
  escrowBuyer: string;
  escrowAmount: string;
  verificationStatus: string;
  onChain: boolean;
};

export default function AdminRecordsPage() {
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["ownership-records"],
    queryFn: () => api.getOwnershipRecords() as Promise<OwnershipRecord[]>,
  });

  const { data: chainStatus } = useQuery({
    queryKey: ["blockchain-status"],
    queryFn: () => api.getBlockchainStatus(),
  });

  const { data: kycStats } = useQuery({
    queryKey: ["kyc", "stats"],
    queryFn: () => api.getKycStats(),
  });

  const onChainCount = records.filter((r) => r.onChain).length;

  return (
    <DashboardShell title="KYC & Verification" roleLabel="Administrator" nav={ADMIN_NAV}>
      <div className="space-y-5">
        {/* Summary bar */}
        <div className="rounded-xl border border-border/60 bg-card px-4 py-3">
          <p className="text-sm font-medium text-foreground">
            <span className="text-primary">{records.length}</span>{" "}
            ownership{" "}
            {records.length === 1 ? "record" : "records"}
            {onChainCount > 0 && (
              <span className="text-muted-foreground">
                {" "}· {onChainCount} on-chain (Sepolia)
              </span>
            )}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {chainStatus?.enabled
              ? `On-chain via Sepolia ${shortenAddress(chainStatus.contractAddress ?? "", 8)} — review KYC submissions and property ownership records.`
              : "Review KYC submissions and property ownership records."}
          </p>
        </div>

        <Tabs defaultValue="kyc" className="space-y-4">
          <TabsList>
            <TabsTrigger value="kyc">
              KYC Review
              {kycStats?.pending ? ` (${kycStats.pending})` : ""}
            </TabsTrigger>
            <TabsTrigger value="ownership">Ownership Records</TabsTrigger>
          </TabsList>

          <TabsContent value="kyc">
            <AdminKycPanel />
          </TabsContent>

          <TabsContent value="ownership">
            <Card className="border-border/60">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="space-y-3 p-6">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="h-12 animate-pulse rounded-lg bg-muted"
                      />
                    ))}
                  </div>
                ) : records.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                      <ShieldCheck className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-primary">
                      No ownership records yet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Records appear once properties are minted on-chain.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Token</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Owner Wallet</TableHead>
                        <TableHead>Escrow</TableHead>
                        <TableHead>Price (ETH)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Chain</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((record, index) => (
                        <TableRow key={record.id || `${record.propertyId}-${index}`}>
                          <TableCell className="font-mono text-xs">
                            {isOnChainTokenId(record.propertyId) &&
                            CONTRACT_ADDRESS ? (
                              <a
                                href={etherscanTokenUrl(
                                  CONTRACT_ADDRESS,
                                  record.propertyId,
                                )}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-primary hover:underline"
                              >
                                #{record.propertyId}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              record.propertyId
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {record.propertyTitle}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {record.ownerWallet ? (
                              <a
                                href={etherscanAddressUrl(record.ownerWallet)}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline"
                              >
                                {shortenAddress(record.ownerWallet, 5)}
                              </a>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell>
                            {record.inEscrow ? (
                              <Badge variant="warning">
                                {record.escrowAmount} ETH locked
                              </Badge>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell className="text-xs">
                            {record.priceEth ?? "—"}
                          </TableCell>
                          <TableCell>
                            {record.verificationStatus === "verified" ? (
                              <Badge variant="verified">Verified</Badge>
                            ) : (
                              <Badge variant="warning">Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {record.onChain ? (
                              <Badge variant="success">Sepolia</Badge>
                            ) : (
                              <Badge variant="secondary">Off-chain</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}
