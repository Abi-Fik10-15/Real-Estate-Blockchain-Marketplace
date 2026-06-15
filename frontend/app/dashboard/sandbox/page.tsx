"use client";

import * as React from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
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
import { Input } from "@/components/ui/input";
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
import { useSandboxStore, SandboxTransaction, SandboxBlock } from "@/store/sandbox-store";
import { shortenAddress, formatDateTime } from "@/lib/utils";
import {
  Activity,
  Layers,
  Database,
  Coins,
  Cpu,
  RefreshCw,
  Code,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Flame,
} from "lucide-react";
import { toast } from "sonner";

export default function Web3SandboxPage() {
  const user = useAuthStore((s) => s.user);
  const properties = usePropertyStore((s) => s.properties);
  const { wallet, connect, switchNetwork } = useWalletStore();
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

  const [selectedTx, setSelectedTx] = React.useState<SandboxTransaction | null>(null);
  const [selectedBlock, setSelectedBlock] = React.useState<SandboxBlock | null>(null);
  const [activeTab, setActiveTab] = React.useState<"blocks" | "txs" | "abi">("blocks");
  const [abiMethod, setAbiMethod] = React.useState<string | null>(null);

  // Auto-mine empty blocks every 15 seconds to simulate node consensus
  React.useEffect(() => {
    const timer = setInterval(() => {
      mineBlock();
    }, 15000);
    return () => clearInterval(timer);
  }, [mineBlock]);

  // Aggregate transactions from real store-based property histories + custom developer actions
  const transactions: SandboxTransaction[] = React.useMemo(() => {
    const propertyTxs: SandboxTransaction[] = [];
    properties.forEach((p) => {
      p.history.forEach((h) => {
        propertyTxs.push({
          hash: h.txHash,
          blockNumber: 194582190 + Math.floor(Math.random() * 5),
          from: h.actor === p.ownerWallet ? p.ownerWallet : "0xDeedRegistryOracleMiner",
          to: h.actor,
          value: p.price.toString() + " USD equivalent",
          type: h.type.toUpperCase(),
          timestamp: h.timestamp,
          status: "success",
        });
      });
    });

    const combined = [...customTransactions, ...propertyTxs];
    // Sort by timestamp desc
    return combined.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
  }, [properties, customTransactions]);

  // Handle faucet request
  const handleFaucetRequest = () => {
    if (!wallet) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (parseFloat(faucetBalance) <= 0) {
      toast.error("Faucet pool is dry! Refill the faucet pool.");
      return;
    }

    const txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    addCustomTransaction({
      hash: txHash,
      from: "0xFaucetDispenserContractAddress",
      to: wallet.address,
      value: "5.0 ETH",
      type: "FAUCET_DISPENSE",
    });

    // Directly increase state balance of wallet to show immediate reaction
    if (wallet) {
      const currentBalance = parseFloat(wallet.balance);
      wallet.balance = (currentBalance + 5).toFixed(4);
    }

    toast.success("Faucet dispensed 5.0 mock ETH!");
  };

  // Switch layouts dynamically based on user role
  let nav = BUYER_NAV;
  let roleLabel = "Buyer / Renter";
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

  // ABI inspection documentation helper
  const ABI_DOCS: Record<string, { desc: string; inputs: string[]; outputs: string[] }> = {
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
      inputs: ["uint256 tokenId", "uint256 startDate", "uint256 endDate", "uint256 monthlyRent"],
      outputs: ["bool registered"],
    },
  };

  return (
    <DashboardShell title="Web3 Developer Sandbox" roleLabel={roleLabel} nav={nav}>
      <PageHeader
        title="Web3 Developer Sandbox"
        description="Inspect simulated block generation, gas limits, and review the on-chain smart contract details."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: sandbox control panel */}
        <div className="space-y-6">
          {/* Network & Provider Status Card */}
          <Card className="border border-border/80 bg-card/40 backdrop-blur-md shadow-md">
            <CardHeader className="pb-3 border-b border-border/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />
                Network Node Controller
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-border/10">
                  <span className="text-muted-foreground font-medium">Blockchain Node Status</span>
                  <Badge variant="success" className="h-5 px-2 font-bold uppercase tracking-wider text-[9px] animate-pulse">
                    Online
                  </Badge>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border/10">
                  <span className="text-muted-foreground font-medium">RPC Node URL</span>
                  <span className="font-mono text-foreground font-semibold">https://sandbox.chainestate.io/v1</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border/10">
                  <span className="text-muted-foreground font-medium">Active Chain ID</span>
                  <span className="font-mono text-foreground font-bold">
                    {wallet?.chainId ?? "80002"} ({wallet?.network ?? "Polygon Amoy"})
                  </span>
                </div>
              </div>

              {/* Chain Switcher Options */}
              <div className="space-y-2 pt-1">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Simulate Network Switch</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant={wallet?.chainId === 11155111 ? "hero" : "outline"}
                    className="h-8 text-xs rounded-xl"
                    onClick={() => switchNetwork(11155111)}
                  >
                    Sepolia Testnet
                  </Button>
                  <Button
                    size="sm"
                    variant={wallet?.chainId === 80002 ? "hero" : "outline"}
                    className="h-8 text-xs rounded-xl"
                    onClick={() => switchNetwork(80002)}
                  >
                    Polygon Amoy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gas & Fee Controller */}
          <Card className="border border-border/80 bg-card/40 backdrop-blur-md shadow-md">
            <CardHeader className="pb-3 border-b border-border/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-500" />
                Gas Fee Optimizer
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-medium">Gas Price</span>
                  <span className="font-mono font-bold text-foreground">{gasPrice} Gwei</span>
                </div>
                <Slider
                  min={1}
                  max={200}
                  step={1}
                  value={[gasPrice]}
                  onValueChange={(val) => setGasPrice(val[0])}
                  className="py-2"
                />
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Adjusting the gas price here dynamically updates estimated network costs on transactional dialogs across the portal.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Faucet Developer Tools */}
          <Card className="border border-border/80 bg-card/40 backdrop-blur-md shadow-md">
            <CardHeader className="pb-3 border-b border-border/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Coins className="h-4 w-4 text-emerald-500" />
                Web3 Mock Faucet
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Faucet Reserve Pool</span>
                <span className="font-mono font-bold text-foreground">{faucetBalance} ETH</span>
              </div>

              <div className="flex gap-2 pt-1">
                <Button size="sm" className="flex-1 rounded-xl text-xs" onClick={handleFaucetRequest}>
                  Request 5.0 ETH
                </Button>
                <Button size="sm" variant="outline" className="rounded-xl px-3" onClick={refillFaucet} title="Refill Faucet">
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sandbox Reset Options */}
          <Button variant="outline" size="sm" className="w-full text-xs text-destructive border-destructive/20 bg-destructive/5 hover:bg-destructive/10 hover:border-destructive rounded-xl" onClick={resetSandbox}>
            <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />
            Reset Sandbox State
          </Button>
        </div>

        {/* Right column: ledger visualizer and tabs */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-border/80 bg-card/30 backdrop-blur-md shadow-md min-h-[580px] flex flex-col">
            <CardHeader className="pb-2 border-b border-border/25 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-extrabold text-primary-600">On-Chain Registry Explorer</CardTitle>
                <CardDescription className="text-xs">Real-time ledger auditor and contract schema tool</CardDescription>
              </div>

              {/* Tab Toggles */}
              <div className="flex gap-1.5 bg-muted/60 p-1 rounded-lg border border-border/30 text-xs">
                <button
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    activeTab === "blocks" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setActiveTab("blocks")}
                >
                  Blocks ({blocks.length})
                </button>
                <button
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    activeTab === "txs" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setActiveTab("txs")}
                >
                  Transactions ({transactions.length})
                </button>
                <button
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    activeTab === "abi" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setActiveTab("abi")}
                >
                  ABI Schema
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-0 flex-1 flex flex-col justify-start">
              {/* Blocks Tab content */}
              {activeTab === "blocks" && (
                <div className="divide-y divide-border/20 text-xs">
                  {blocks.map((b) => (
                    <div
                      key={b.hash}
                      className="group flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 hover:bg-muted/10 transition-all cursor-pointer"
                      onClick={() => setSelectedBlock(b)}
                    >
                      <div className="flex gap-3 items-center">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                          <Layers className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                            Block #{b.number.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Timestamp: {formatDateTime(b.timestamp)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col items-center md:items-end gap-2 md:gap-1 text-right">
                        <Badge variant="outline" className="font-mono text-[9px] py-0">
                          {shortenAddress(b.hash, 8)}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          {b.transactions.length} Tx{b.transactions.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Transactions Tab content */}
              {activeTab === "txs" && (
                <div className="overflow-x-auto w-full">
                  <Table className="text-xs">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tx Hash</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>From / To</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow
                          key={tx.hash}
                          className="hover:bg-muted/10 cursor-pointer"
                          onClick={() => setSelectedTx(tx)}
                        >
                          <TableCell className="font-mono text-primary font-bold">
                            {shortenAddress(tx.hash, 6)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-[9px] py-0 uppercase">
                              {tx.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-[10px] text-muted-foreground max-w-[150px] truncate">
                            {shortenAddress(tx.from, 4)} → {shortenAddress(tx.to, 4)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-foreground">
                            {tx.value}
                          </TableCell>
                        </TableRow>
                      ))}
                      {transactions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                            No ledger transactions recorded in this sandbox state yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* ABI tab content */}
              {activeTab === "abi" && (
                <div className="p-4 grid gap-4 sm:grid-cols-2">
                  {Object.keys(ABI_DOCS).map((method) => (
                    <Card
                      key={method}
                      className="border border-border/50 bg-background/50 hover:bg-background/80 transition-all cursor-pointer p-4"
                      onClick={() => setAbiMethod(method)}
                    >
                      <div className="flex justify-between items-center border-b border-border/20 pb-2 mb-2">
                        <span className="font-bold text-sm text-primary flex items-center gap-1">
                          <Code className="h-4 w-4" />
                          {method}()
                        </span>
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-[9px] py-0 font-bold uppercase">
                          External
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {ABI_DOCS[method].desc}
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transaction Details Modal */}
      <Dialog open={!!selectedTx} onOpenChange={() => setSelectedTx(null)}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-md border border-border/80 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-1.5">
              <Database className="h-5 w-5 text-primary" />
              Simulated Transaction Receipt
            </DialogTitle>
            <DialogDescription className="text-xs">
              Cryptographic evidence of on-chain state confirmation
            </DialogDescription>
          </DialogHeader>

          {selectedTx && (
            <div className="space-y-4 py-2 text-xs">
              <div className="rounded-lg bg-background/50 border border-border/60 p-4 space-y-3 leading-relaxed">
                <div className="flex justify-between border-b border-border/20 pb-1.5">
                  <span className="text-muted-foreground font-medium">Tx Hash</span>
                  <span className="font-mono text-primary font-bold select-all">{selectedTx.hash}</span>
                </div>
                <div className="flex justify-between border-b border-border/20 pb-1.5">
                  <span className="text-muted-foreground font-medium">Simulated Block</span>
                  <span className="font-bold text-foreground">#{selectedTx.blockNumber.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-border/20 pb-1.5">
                  <span className="text-muted-foreground font-medium">Method</span>
                  <Badge variant="secondary" className="text-[9px] py-0 uppercase">{selectedTx.type}</Badge>
                </div>
                <div className="flex justify-between border-b border-border/20 pb-1.5">
                  <span className="text-muted-foreground font-medium">Sender (From)</span>
                  <span className="font-mono text-foreground select-all">{selectedTx.from}</span>
                </div>
                <div className="flex justify-between border-b border-border/20 pb-1.5">
                  <span className="text-muted-foreground font-medium">Receiver (To)</span>
                  <span className="font-mono text-foreground select-all">{selectedTx.to}</span>
                </div>
                <div className="flex justify-between border-b border-border/20 pb-1.5">
                  <span className="text-muted-foreground font-medium">Value Settled</span>
                  <span className="font-bold text-foreground">{selectedTx.value}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Timestamp</span>
                  <span className="text-foreground">{formatDateTime(selectedTx.timestamp)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Block Details Modal */}
      <Dialog open={!!selectedBlock} onOpenChange={() => setSelectedBlock(null)}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-md border border-border/80 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-1.5">
              <Layers className="h-5 w-5 text-primary" />
              Simulated Block Details
            </DialogTitle>
          </DialogHeader>

          {selectedBlock && (
            <div className="space-y-4 py-2 text-xs">
              <div className="rounded-lg bg-background/50 border border-border/60 p-4 space-y-3 leading-relaxed">
                <div className="flex justify-between border-b border-border/20 pb-1.5">
                  <span className="text-muted-foreground font-medium">Block Height</span>
                  <span className="font-bold text-foreground">#{selectedBlock.number.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-border/20 pb-1.5">
                  <span className="text-muted-foreground font-medium">Block Hash</span>
                  <span className="font-mono text-foreground truncate select-all">{selectedBlock.hash}</span>
                </div>
                <div className="flex justify-between border-b border-border/20 pb-1.5">
                  <span className="text-muted-foreground font-medium">Parent Hash</span>
                  <span className="font-mono text-foreground truncate select-all">{selectedBlock.parentHash}</span>
                </div>
                <div className="flex justify-between border-b border-border/20 pb-1.5">
                  <span className="text-muted-foreground font-medium">Validated Miner</span>
                  <span className="font-mono text-foreground select-all">{selectedBlock.miner}</span>
                </div>
                <div className="flex justify-between border-b border-border/20 pb-1.5">
                  <span className="text-muted-foreground font-medium">Gas Units Mined</span>
                  <span className="font-mono text-foreground font-semibold">{selectedBlock.gasUsed} gas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Transactions Count</span>
                  <span className="font-semibold text-foreground">{selectedBlock.transactions.length} receipts</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ABI Details Modal */}
      <Dialog open={!!abiMethod} onOpenChange={() => setAbiMethod(null)}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-md border border-border/80 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-1.5">
              <Code className="h-5 w-5 text-primary" />
              Smart Contract ABI Method
            </DialogTitle>
          </DialogHeader>

          {abiMethod && ABI_DOCS[abiMethod] && (
            <div className="space-y-4 py-2 text-xs leading-relaxed">
              <div className="rounded-lg bg-background/50 border border-border/60 p-4 space-y-4">
                <div>
                  <h4 className="font-bold text-foreground">Signature</h4>
                  <p className="font-mono text-primary bg-primary/5 rounded px-2.5 py-1.5 mt-1 border border-primary/15">
                    {abiMethod}({ABI_DOCS[abiMethod].inputs.join(", ")})
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Description</h4>
                  <p className="text-muted-foreground mt-1">{ABI_DOCS[abiMethod].desc}</p>
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Input Arguments</h4>
                  <ul className="list-disc list-inside space-y-0.5 mt-1 font-mono text-muted-foreground">
                    {ABI_DOCS[abiMethod].inputs.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Return Outputs</h4>
                  <ul className="list-disc list-inside space-y-0.5 mt-1 font-mono text-muted-foreground">
                    {ABI_DOCS[abiMethod].outputs.map((o) => (
                      <li key={o}>{o}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
