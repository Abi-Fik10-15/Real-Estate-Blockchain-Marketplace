"use client";

import * as React from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  OWNER_NAV,
  AGENT_NAV,
  ADMIN_NAV,
  BUYER_NAV,
} from "@/components/dashboard/nav-configs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { usePropertyStore } from "@/store/property-store";
import { useWalletStore } from "@/store/wallet-store";
import { useAuthStore } from "@/store/auth-store";
import {
  useSandboxStore,
  SandboxTransaction,
  SandboxBlock,
} from "@/store/sandbox-store";
import { cn, shortenAddress, formatDateTime } from "@/lib/utils";
import {
  Activity,
  Layers,
  Database,
  Coins,
  Cpu,
  RefreshCw,
  Code,
  ShieldAlert,
  Flame,
} from "lucide-react";
import { toast } from "sonner";

const ABI_DOCS: Record<
  string,
  { desc: string; inputs: string[]; outputs: string[] }
> = {
  listProperty: {
    desc: "Mints an ERC-721 property token linked to a specified metadata URI.",
    inputs: ["string tokenURI (cryptographic link to coordinates and photos)"],
    outputs: ["uint256 tokenId (generated on-chain block index)"],
  },
  initiateEscrow: {
    desc: "Locks buying amount in the contract's secure escrow storage.",
    inputs: ["uint256 tokenId (registry token to buy)"],
    outputs: ["bool success (confirms funds are safely escrowed)"],
  },
  confirmSale: {
    desc: "Releases escrowed ETH to the seller wallet and transfers the tokenized title deed to the buyer address.",
    inputs: ["uint256 tokenId (property deed to trade)"],
    outputs: ["bool status (confirms successful ownership transfer)"],
  },
  createRental: {
    desc: "Registers rental contract boundaries, monthly cost, and rental period limits.",
    inputs: [
      "uint256 tokenId",
      "uint256 startDate",
      "uint256 endDate",
      "uint256 monthlyRent",
    ],
    outputs: ["bool registered"],
  },
};

const EXPLORER_TABS = [
  { value: "blocks", label: "Blocks" },
  { value: "txs", label: "Transactions" },
  { value: "abi", label: "ABI Schema" },
] as const;

type ExplorerTab = (typeof EXPLORER_TABS)[number]["value"];

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/40 py-2 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "max-w-[60%] truncate text-right text-xs font-semibold text-foreground",
          mono && "font-mono",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export default function Web3SandboxPage() {
  const user = useAuthStore((s) => s.user);
  const properties = usePropertyStore((s) => s.properties);
  const { wallet, switchNetwork } = useWalletStore();
  const {
    blocks,
    customTransactions,
    gasPrice,
    faucetBalance,
    mineBlock,
    addCustomTransaction,
    setGasPrice,
    refillFaucet,
    resetSandbox,
  } = useSandboxStore();

  const [selectedTx, setSelectedTx] = React.useState<SandboxTransaction | null>(
    null,
  );
  const [selectedBlock, setSelectedBlock] = React.useState<SandboxBlock | null>(
    null,
  );
  const [activeTab, setActiveTab] = React.useState<ExplorerTab>("blocks");
  const [abiMethod, setAbiMethod] = React.useState<string | null>(null);

  React.useEffect(() => {
    const timer = setInterval(() => {
      mineBlock();
    }, 15000);
    return () => clearInterval(timer);
  }, [mineBlock]);

  const transactions: SandboxTransaction[] = React.useMemo(() => {
    const propertyTxs: SandboxTransaction[] = [];
    properties.forEach((p) => {
      p.history.forEach((h) => {
        propertyTxs.push({
          hash: h.txHash,
          blockNumber: 194582190 + Math.floor(Math.random() * 5),
          from:
            h.actor === p.ownerWallet
              ? p.ownerWallet
              : "0xDeedRegistryOracleMiner",
          to: h.actor,
          value: p.price.toString() + " USD equivalent",
          type: h.type.toUpperCase(),
          timestamp: h.timestamp,
          status: "success",
        });
      });
    });

    const combined = [...customTransactions, ...propertyTxs];
    return combined.sort(
      (a, b) => +new Date(b.timestamp) - +new Date(a.timestamp),
    );
  }, [properties, customTransactions]);

  const handleFaucetRequest = () => {
    if (!wallet) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (parseFloat(faucetBalance) <= 0) {
      toast.error("Faucet pool is dry! Refill the faucet pool.");
      return;
    }

    const txHash =
      "0x" +
      Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16),
      ).join("");
    addCustomTransaction({
      hash: txHash,
      from: "0xFaucetDispenserContractAddress",
      to: wallet.address,
      value: "5.0 ETH",
      type: "FAUCET_DISPENSE",
    });

    if (wallet) {
      const currentBalance = parseFloat(wallet.balance);
      wallet.balance = (currentBalance + 5).toFixed(4);
    }

    toast.success("Faucet dispensed 5.0 mock ETH!");
  };

  let nav = BUYER_NAV;
  let roleLabel = "Buyer";
  if (user?.role === "owner") {
    nav = OWNER_NAV;
    roleLabel = "Property Owner";
  } else if (user?.role === "agent") {
    nav = AGENT_NAV;
    roleLabel = "Property Agent";
  } else if (user?.role === "admin") {
    nav = ADMIN_NAV;
    roleLabel = "Administrator";
  }

  const tabCounts: Record<ExplorerTab, number> = {
    blocks: blocks.length,
    txs: transactions.length,
    abi: Object.keys(ABI_DOCS).length,
  };

  return (
    <DashboardShell title="Web3 Developer Sandbox" roleLabel={roleLabel} nav={nav}>
      <div className="space-y-5">
        {/* Summary bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              <span className="text-primary">{blocks.length}</span> blocks ·{" "}
              <span className="text-primary">{transactions.length}</span>{" "}
              transactions
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Simulated ledger explorer — chain{" "}
              {wallet?.chainId ?? "80002"} ({wallet?.network ?? "Polygon Amoy"})
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="success" className="text-[10px]">
              Node online
            </Badge>
            {wallet ? (
              <Badge variant="outline" className="font-mono text-[10px]">
                {shortenAddress(wallet.address, 6)}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                No wallet
              </Badge>
            )}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(280px,320px)_1fr]">
          {/* Left sidebar — controls */}
          <div className="space-y-4">
            <Card className="border-border/60">
              <CardHeader className="border-b border-border/40 pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Cpu className="h-4 w-4" />
                  Network controller
                </CardTitle>
                <CardDescription className="text-xs">
                  Switch testnet and inspect node status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 text-xs">
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <DetailRow label="Node status" value="Online" />
                  <DetailRow
                    label="RPC URL"
                    value="sandbox.chainestate.io/v1"
                    mono
                  />
                  <DetailRow
                    label="Chain ID"
                    value={`${wallet?.chainId ?? "80002"} (${wallet?.network ?? "Polygon Amoy"})`}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Simulate network switch
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant={
                        wallet?.chainId === 11155111 ? "default" : "outline"
                      }
                      className="h-8 text-xs"
                      onClick={() => switchNetwork(11155111)}
                    >
                      Sepolia
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        wallet?.chainId === 80002 ? "default" : "outline"
                      }
                      className="h-8 text-xs"
                      onClick={() => switchNetwork(80002)}
                    >
                      Polygon Amoy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="border-b border-border/40 pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Flame className="h-4 w-4" />
                  Gas fee optimizer
                </CardTitle>
                <CardDescription className="text-xs">
                  Adjust simulated gas price for the portal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Gas price</span>
                  <span className="font-mono font-bold">{gasPrice} Gwei</span>
                </div>
                <Slider
                  min={1}
                  max={200}
                  step={1}
                  value={[gasPrice]}
                  onValueChange={(val) => setGasPrice(val[0])}
                />
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Updates estimated network costs on transactional dialogs
                  across the portal.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="border-b border-border/40 pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Coins className="h-4 w-4" />
                  Mock faucet
                </CardTitle>
                <CardDescription className="text-xs">
                  Dispense test ETH to your connected wallet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-4 text-xs">
                <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
                  <span className="text-muted-foreground">Reserve pool</span>
                  <span className="font-mono font-bold">{faucetBalance} ETH</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={handleFaucetRequest}
                  >
                    Request 5.0 ETH
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="px-3"
                    onClick={refillFaucet}
                    title="Refill faucet"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Button
              variant="outline"
              size="sm"
              className="w-full border-destructive/20 text-xs text-destructive hover:bg-destructive/5"
              onClick={resetSandbox}
            >
              <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />
              Reset sandbox state
            </Button>
          </div>

          {/* Main explorer */}
          <div className="min-w-0 space-y-4">
            <Card className="flex min-h-[520px] flex-col border-border/60">
              <CardHeader className="border-b border-border/40 pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold text-primary">
                      On-chain registry explorer
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Real-time ledger auditor and contract schema tool
                    </CardDescription>
                  </div>

                  <div className="flex flex-wrap gap-1 rounded-xl border border-border/60 bg-muted/30 p-1">
                    {EXPLORER_TABS.map((tab) => (
                      <button
                        key={tab.value}
                        type="button"
                        className={cn(
                          "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                          activeTab === tab.value
                            ? "bg-background text-primary shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                        onClick={() => setActiveTab(tab.value)}
                      >
                        {tab.label}
                        <span className="ml-1 text-[10px] text-muted-foreground">
                          ({tabCounts[tab.value]})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col p-0">
                {/* Blocks tab */}
                {activeTab === "blocks" && (
                  <>
                    {blocks.length === 0 ? (
                      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                          <Layers className="h-7 w-7 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-base font-semibold text-primary">
                          No blocks yet
                        </h3>
                        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                          Blocks are auto-mined every 15 seconds. Wait a moment
                          or trigger a transaction.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border/40">
                        {blocks.map((b) => (
                          <div
                            key={b.hash}
                            className="group flex cursor-pointer flex-col gap-3 p-4 transition-colors hover:bg-muted/20 sm:flex-row sm:items-center sm:justify-between"
                            onClick={() => setSelectedBlock(b)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Layers className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold transition-colors group-hover:text-primary">
                                  Block #{b.number.toLocaleString()}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {formatDateTime(b.timestamp)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                              <Badge
                                variant="outline"
                                className="font-mono text-[10px]"
                              >
                                {shortenAddress(b.hash, 8)}
                              </Badge>
                              <span className="text-[11px] text-muted-foreground">
                                {b.transactions.length} tx
                                {b.transactions.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Transactions tab */}
                {activeTab === "txs" && (
                  <div className="overflow-x-auto">
                    {transactions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                          <Activity className="h-7 w-7 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-base font-semibold text-primary">
                          No transactions yet
                        </h3>
                        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                          Use the faucet or interact with properties to generate
                          ledger entries.
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Tx hash</TableHead>
                            <TableHead className="text-xs">Method</TableHead>
                            <TableHead className="text-xs">From / To</TableHead>
                            <TableHead className="text-right text-xs">
                              Value
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactions.map((tx) => (
                            <TableRow
                              key={tx.hash}
                              className="cursor-pointer hover:bg-muted/20"
                              onClick={() => setSelectedTx(tx)}
                            >
                              <TableCell className="font-mono text-xs font-semibold text-primary">
                                {shortenAddress(tx.hash, 6)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] uppercase"
                                >
                                  {tx.type}
                                </Badge>
                              </TableCell>
                              <TableCell className="max-w-[150px] truncate font-mono text-[11px] text-muted-foreground">
                                {shortenAddress(tx.from, 4)} →{" "}
                                {shortenAddress(tx.to, 4)}
                              </TableCell>
                              <TableCell className="text-right text-xs font-semibold">
                                {tx.value}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                )}

                {/* ABI tab */}
                {activeTab === "abi" && (
                  <div className="grid gap-3 p-4 sm:grid-cols-2">
                    {Object.keys(ABI_DOCS).map((method) => (
                      <button
                        key={method}
                        type="button"
                        className="rounded-xl border border-border/60 bg-muted/20 p-4 text-left transition-colors hover:border-primary/30 hover:bg-muted/40"
                        onClick={() => setAbiMethod(method)}
                      >
                        <div className="mb-2 flex items-center justify-between gap-2 border-b border-border/40 pb-2">
                          <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                            <Code className="h-4 w-4" />
                            {method}()
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            external
                          </Badge>
                        </div>
                        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {ABI_DOCS[method].desc}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Transaction dialog */}
      <Dialog open={!!selectedTx} onOpenChange={() => setSelectedTx(null)}>
        <DialogContent className="max-w-md border-border/60">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Database className="h-4 w-4" />
              Transaction receipt
            </DialogTitle>
            <DialogDescription className="text-xs">
              Simulated on-chain state confirmation
            </DialogDescription>
          </DialogHeader>

          {selectedTx && (
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-xs">
              <DetailRow
                label="Tx hash"
                value={shortenAddress(selectedTx.hash, 12)}
                mono
              />
              <DetailRow
                label="Block"
                value={`#${selectedTx.blockNumber.toLocaleString()}`}
              />
              <DetailRow label="Method" value={selectedTx.type} />
              <DetailRow
                label="From"
                value={shortenAddress(selectedTx.from, 10)}
                mono
              />
              <DetailRow
                label="To"
                value={shortenAddress(selectedTx.to, 10)}
                mono
              />
              <DetailRow label="Value" value={selectedTx.value} />
              <DetailRow
                label="Timestamp"
                value={formatDateTime(selectedTx.timestamp)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Block dialog */}
      <Dialog open={!!selectedBlock} onOpenChange={() => setSelectedBlock(null)}>
        <DialogContent className="max-w-md border-border/60">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Layers className="h-4 w-4" />
              Block details
            </DialogTitle>
          </DialogHeader>

          {selectedBlock && (
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-xs">
              <DetailRow
                label="Block height"
                value={`#${selectedBlock.number.toLocaleString()}`}
              />
              <DetailRow
                label="Block hash"
                value={shortenAddress(selectedBlock.hash, 12)}
                mono
              />
              <DetailRow
                label="Parent hash"
                value={shortenAddress(selectedBlock.parentHash, 12)}
                mono
              />
              <DetailRow
                label="Miner"
                value={shortenAddress(selectedBlock.miner, 10)}
                mono
              />
              <DetailRow
                label="Gas used"
                value={`${selectedBlock.gasUsed} gas`}
              />
              <DetailRow
                label="Transactions"
                value={`${selectedBlock.transactions.length} receipts`}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ABI dialog */}
      <Dialog open={!!abiMethod} onOpenChange={() => setAbiMethod(null)}>
        <DialogContent className="max-w-md border-border/60">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Code className="h-4 w-4" />
              {abiMethod}()
            </DialogTitle>
            <DialogDescription className="text-xs">
              Smart contract method schema
            </DialogDescription>
          </DialogHeader>

          {abiMethod && ABI_DOCS[abiMethod] && (
            <div className="space-y-4 text-xs">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                <p className="font-medium text-muted-foreground">Signature</p>
                <p className="mt-1 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1.5 font-mono text-primary">
                  {abiMethod}({ABI_DOCS[abiMethod].inputs.join(", ")})
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground">Description</p>
                <p className="mt-1 text-muted-foreground">
                  {ABI_DOCS[abiMethod].desc}
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground">Inputs</p>
                <ul className="mt-1 list-inside list-disc space-y-0.5 font-mono text-muted-foreground">
                  {ABI_DOCS[abiMethod].inputs.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground">Outputs</p>
                <ul className="mt-1 list-inside list-disc space-y-0.5 font-mono text-muted-foreground">
                  {ABI_DOCS[abiMethod].outputs.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
