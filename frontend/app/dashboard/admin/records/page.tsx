"use client";

import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
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
import { PageHeader } from "@/components/dashboard/page-header";
import { ADMIN_NAV } from "@/components/dashboard/nav-configs";
import { AdminKycPanel } from "@/components/dashboard/admin/admin-kyc-panel";
import { api } from "@/services/api";
import { CONTRACT_ADDRESS } from "@/lib/constants";
import { etherscanAddressUrl, etherscanTokenUrl, isOnChainTokenId } from "@/lib/blockchain-utils";
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

  return (
    <DashboardShell title="KYC & Verification" roleLabel="Administrator" nav={ADMIN_NAV}>
      <PageHeader
        title="KYC & Verification"
        description={
          chainStatus?.enabled
            ? `Review identity documents and on-chain ownership via Sepolia ${shortenAddress(chainStatus.contractAddress, 8)}`
            : "Review KYC submissions and property ownership records."
        }
      />

      <Tabs defaultValue="kyc" className="space-y-4">
        <TabsList>
          <TabsTrigger value="kyc">
            KYC Review{kycStats?.pending ? ` (${kycStats.pending})` : ""}
          </TabsTrigger>
          <TabsTrigger value="ownership">Ownership Records</TabsTrigger>
        </TabsList>

        <TabsContent value="kyc">
          <AdminKycPanel />
        </TabsContent>

        <TabsContent value="ownership">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <p className="p-6 text-sm text-muted-foreground">Loading records…</p>
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
                          {isOnChainTokenId(record.propertyId) && CONTRACT_ADDRESS ? (
                            <a
                              href={etherscanTokenUrl(CONTRACT_ADDRESS, record.propertyId)}
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
                        <TableCell className="font-medium">{record.propertyTitle}</TableCell>
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
                        <TableCell className="text-xs">{record.priceEth ?? "—"}</TableCell>
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
    </DashboardShell>
  );
}
