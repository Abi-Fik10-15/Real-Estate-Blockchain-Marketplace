"use client";

import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
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

  return (
    <DashboardShell title="Ownership Records" roleLabel="Administrator" nav={ADMIN_NAV}>
      <PageHeader
        title="Ownership Records"
        description={
          chainStatus?.enabled
            ? `On-chain registry via Sepolia contract ${shortenAddress(chainStatus.contractAddress, 8)}`
            : "Database records — configure Sepolia contract for live on-chain data (see BLOCKCHAIN.md)."
        }
      />
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
                {records.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">
                      {isOnChainTokenId(p.propertyId) && CONTRACT_ADDRESS ? (
                        <a
                          href={etherscanTokenUrl(CONTRACT_ADDRESS, p.propertyId)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          #{p.propertyId}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        p.propertyId
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{p.propertyTitle}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {p.ownerWallet ? (
                        <a
                          href={etherscanAddressUrl(p.ownerWallet)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline"
                        >
                          {shortenAddress(p.ownerWallet, 5)}
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {p.inEscrow ? (
                        <Badge variant="warning">
                          {p.escrowAmount} ETH locked
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-xs">{p.priceEth ?? "—"}</TableCell>
                    <TableCell>
                      {p.verificationStatus === "verified" ? (
                        <Badge variant="verified">Verified</Badge>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {p.onChain ? (
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
    </DashboardShell>
  );
}
