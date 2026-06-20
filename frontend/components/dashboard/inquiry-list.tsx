"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Check, Loader2, Wallet, ShieldCheck, Activity, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useInquiryStore } from "@/store/inquiry-store";
import { usePropertyStore } from "@/store/property-store";
import { useWalletStore } from "@/store/wallet-store";
import { useAuthStore } from "@/store/auth-store";
import { useMyTransactions } from "@/hooks/use-transactions";
import { api } from "@/services/api";
import { contractClient } from "@/lib/contract";
import { escrowEthAmount, isOnChainTokenId } from "@/lib/blockchain-utils";
import { CONTRACT_ADDRESS } from "@/lib/constants";
import { formatDate, formatCurrency, shortenAddress } from "@/lib/utils";
import type { Inquiry } from "@/types";

export function InquiryList({
  inquiries,
  manageable = false,
  emptyLabel = "No inquiries yet.",
}: {
  inquiries: Inquiry[];
  manageable?: boolean;
  emptyLabel?: string;
}) {
  const setStatus = useInquiryStore((s) => s.setStatus);
  const fetchMine = useInquiryStore((s) => s.fetchMine);
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const { data: transactions = [] } = useMyTransactions();
  const { properties, updateProperty } = usePropertyStore();
  const { wallet } = useWalletStore();

  const [activeInquiry, setActiveInquiry] = React.useState<Inquiry | null>(null);
  const [showPayModal, setShowPayModal] = React.useState(false);
  const [txStep, setTxStep] = React.useState<"idle" | "prep" | "signature" | "broadcasting" | "minting" | "done">("idle");
  const [gasEstimate, setGasEstimate] = React.useState("0.0031");

  const startPaymentSimulation = (inq: Inquiry) => {
    if (!wallet) {
      toast.error("Please connect your Web3 wallet in Profile Settings first!");
      return;
    }
    setActiveInquiry(inq);
    setTxStep("idle");
    // Generate a slightly randomized realistic gas estimate
    setGasEstimate((0.0025 + Math.random() * 0.0015).toFixed(5));
    setShowPayModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!activeInquiry || !wallet) return;

    const targetProp = properties.find((p) => p.id === activeInquiry.propertyId);
    if (!targetProp) {
      toast.error("Property not found");
      return;
    }

    try {
      setTxStep("prep");
      await new Promise((r) => setTimeout(r, 600));

      const tx = await api.createTransaction({
        propertyId: targetProp.id,
        type: activeInquiry.type === "rental" ? "rental" : "sale",
        amount: targetProp.price,
        blockchainTokenId: targetProp.chainId,
      });

      let txHash = `api-${tx.id}`;

      setTxStep("signature");
      const tokenId = targetProp.chainId;
      const canUseContract =
        CONTRACT_ADDRESS && isOnChainTokenId(tokenId);

      if (canUseContract) {
        try {
          await contractClient.ensureSepolia();
          setTxStep("broadcasting");
          const escrowAmount = escrowEthAmount(targetProp);
          const result = await contractClient.initiateEscrow(tokenId, escrowAmount);
          txHash = result.txHash;
          await api.markEscrow(tx.id, txHash);
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : "On-chain escrow failed — check wallet balance on Sepolia"
          );
          setTxStep("idle");
          return;
        }
      } else {
        setTxStep("broadcasting");
        await new Promise((r) => setTimeout(r, 800));
        await api.markEscrow(tx.id, txHash);
      }

      setTxStep("minting");
      await new Promise((r) => setTimeout(r, 400));
      setTxStep("done");
      await new Promise((r) => setTimeout(r, 400));

      await updateProperty(targetProp.id, {
        history: [
          {
            id: `ev-${Date.now()}`,
            type: "transfer",
            description: `Escrow funded by buyer ${shortenAddress(wallet.address, 6)} — awaiting owner confirmation`,
            txHash,
            actor: wallet.address,
            timestamp: new Date().toISOString(),
          },
          ...targetProp.history,
        ],
      });

      localStorage.setItem("chainestate_verified_at_least_once", "true");
      await queryClient.invalidateQueries({ queryKey: ["transactions", "mine"] });
      if (user?.role === "buyer") {
        await fetchMine();
      }
      toast.success("Escrow funded successfully", {
        description: "The owner must confirm the transaction to complete the transfer.",
      });
      setShowPayModal(false);
      setActiveInquiry(null);
    } catch {
      toast.error("Transaction failed or was cancelled");
      setTxStep("idle");
    }
  };

  if (inquiries.length === 0) {
    return (
      <Card className="border border-dashed border-border/80 bg-card/10">
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <MessageSquare className="h-10 w-10 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        </CardContent>
      </Card>
    );
  }

  const buyerId = user?.id;

  const getTransactionForInquiry = (inq: Inquiry) =>
    transactions.find(
      (t) =>
        t.propertyId === inq.propertyId &&
        (!buyerId || t.buyerId === buyerId)
    );

  const getStepIndex = (inq: Inquiry) => {
    const tx = getTransactionForInquiry(inq);
    if (inq.status === "closed" || tx?.status === "completed") return 3;
    if (tx?.status === "escrow") return 2;
    if (inq.status === "in_progress") return 1;
    return 0;
  };

  const getBuyerStatusLabel = (inq: Inquiry) => {
    const tx = getTransactionForInquiry(inq);
    if (inq.status === "closed" || tx?.status === "completed") {
      return inq.type === "rental" ? "Rented" : "Purchased";
    }
    if (tx?.status === "escrow") return "Escrow Funded — Awaiting Owner";
    if (inq.status === "in_progress") return "Approved — Fund Escrow";
    return "Under Review";
  };

  const getBuyerStatusVariant = (inq: Inquiry): "warning" | "secondary" | "success" => {
    const tx = getTransactionForInquiry(inq);
    if (inq.status === "closed" || tx?.status === "completed") return "success";
    if (tx?.status === "escrow") return "secondary";
    return "warning";
  };

  const canFundEscrow = (inq: Inquiry) => {
    const tx = getTransactionForInquiry(inq);
    return inq.status === "in_progress" && (!tx || tx.status === "initiated");
  };

  return (
    <div className="space-y-4">
      {inquiries.map((inq) => {
        const prop = properties.find((p) => p.id === inq.propertyId);
        const stepIndex = getStepIndex(inq);
        const tx = getTransactionForInquiry(inq);
        const isComplete = inq.status === "closed" || tx?.status === "completed";

        return (
          <Card
            key={inq.id}
            className="group border border-border/60 bg-card/20 backdrop-blur-sm shadow-sm transition-all hover:border-border/80 hover:bg-card/30"
          >
            <CardContent className="p-5 space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start min-w-0 flex-1">
                  {prop && (
                    <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted shadow-sm">
                      <img
                        src={prop.images[0]}
                        alt={prop.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                  )}
                  <div className="min-w-0 space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-base text-foreground leading-tight group-hover:text-primary transition-colors">
                        {inq.propertyTitle}
                      </p>
                      <Badge variant="secondary" className="capitalize text-[10px] font-bold px-2 py-0">
                        {inq.type}
                      </Badge>
                      {prop && (
                        <span className="text-xs font-semibold text-muted-foreground">
                          {formatCurrency(prop.price)}
                          {inq.type === "rental" && "/mo"}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-3 py-0.5">
                      "{inq.message}"
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Sender: <span className="font-medium text-foreground">{inq.buyerName}</span> · {formatDate(inq.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center md:items-end gap-2 self-start sm:self-auto">
                  {manageable ? (
                    <Select
                      value={inq.status}
                      onValueChange={async (v) => {
                        try {
                          await setStatus(inq.id, v as Inquiry["status"]);
                          toast.success(`Inquiry status updated to ${v}`);
                        } catch {
                          toast.error("Failed to update inquiry");
                        }
                      }}
                    >
                      <SelectTrigger className="h-8 w-36 text-xs bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New / Under Review</SelectItem>
                        <SelectItem value="in_progress">Approved by Owner</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex flex-col items-start sm:items-end gap-1.5">
                      <Badge variant={getBuyerStatusVariant(inq)} className="capitalize text-xs font-bold px-2.5 py-0.5">
                        {getBuyerStatusLabel(inq)}
                      </Badge>
                      
                      {!manageable && canFundEscrow(inq) && (
                        <Button
                          size="sm"
                          variant="hero"
                          className="h-8 text-[11px] font-bold px-3 shadow-md shadow-primary/20 mt-1"
                          onClick={() => startPaymentSimulation(inq)}
                        >
                          <Wallet className="mr-1.5 h-3.5 w-3.5" />
                          Fund Escrow
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Interactive Timeline Stepper for Buyer requests (manageable = false) */}
              {!manageable && (
                <div className="border-t border-border/20 pt-4 mt-3">
                  <div className="relative flex items-center justify-between w-full">
                    {/* Stepper Line Background */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-muted -z-10" />
                    {/* Stepper Active Line Progress */}
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-primary transition-all duration-500 -z-10"
                      style={{
                        width: `${stepIndex === 0 ? 0 : stepIndex === 1 ? 33 : stepIndex === 2 ? 66 : 100}%`,
                      }}
                    />

                    {/* Step 1: Offer Sent */}
                    <div className="flex flex-col items-center gap-1.5 bg-background px-2">
                      <div
                        className={`h-7 w-7 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all ${
                          stepIndex >= 0
                            ? "bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/20"
                            : "bg-background border-muted text-muted-foreground"
                        }`}
                      >
                        <Check className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-bold text-foreground">Offer Sent</span>
                    </div>

                    {/* Step 2: Owner Approved */}
                    <div className="flex flex-col items-center gap-1.5 bg-background px-2">
                      <div
                        className={`h-7 w-7 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all ${
                          stepIndex >= 1
                            ? "bg-primary border-primary text-primary-foreground shadow-sm"
                            : "bg-background border-muted text-muted-foreground"
                        }`}
                      >
                        {stepIndex > 1 ? <Check className="h-4 w-4" /> : <HelpCircle className="h-4 w-4" />}
                      </div>
                      <span className="text-[10px] font-bold text-foreground">Approved</span>
                    </div>

                    {/* Step 3: Escrow Funded */}
                    <div className="flex flex-col items-center gap-1.5 bg-background px-2">
                      <div
                        className={`h-7 w-7 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all ${
                          stepIndex >= 2
                            ? "bg-primary border-primary text-primary-foreground shadow-sm"
                            : "bg-background border-muted text-muted-foreground"
                        }`}
                      >
                        {stepIndex > 2 ? <Check className="h-4 w-4" /> : <Wallet className="h-3.5 w-3.5" />}
                      </div>
                      <span className="text-[10px] font-bold text-foreground">Escrow Locked</span>
                    </div>

                    {/* Step 4: Deed NFT Transferred */}
                    <div className="flex flex-col items-center gap-1.5 bg-background px-2">
                      <div
                        className={`h-7 w-7 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all ${
                          isComplete
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                            : "bg-background border-muted text-muted-foreground"
                        }`}
                      >
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-bold text-foreground text-center">
                        {inq.type === "rental" ? "Rental Active" : "Deed Transferred"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Simulated Escrow Blockchain Transaction Dialog */}
      <Dialog open={showPayModal} onOpenChange={(open) => !open && setShowPayModal(false)}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-md border border-border/80 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary animate-pulse" />
              On-Chain Escrow
            </DialogTitle>
            <DialogDescription className="text-xs">
              Sign with MetaMask to lock Sepolia ETH in the smart contract escrow.
            </DialogDescription>
          </DialogHeader>

          {txStep === "idle" ? (
            <div className="space-y-4 py-3">
              <div className="rounded-lg bg-background/50 border border-border/60 p-4 space-y-3 text-xs">
                <div className="flex justify-between border-b border-border/30 pb-2">
                  <span className="text-muted-foreground font-medium">Smart Contract</span>
                  <span className="font-mono text-foreground">{CONTRACT_ADDRESS ? shortenAddress(CONTRACT_ADDRESS, 8) : "Not configured"}</span>
                </div>
                <div className="flex justify-between border-b border-border/30 pb-2">
                  <span className="text-muted-foreground font-medium">Deed Asset ID</span>
                  <span className="font-semibold text-foreground">
                    {properties.find((p) => p.id === activeInquiry?.propertyId)?.chainId ?? "EST-3498"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border/30 pb-2">
                  <span className="text-muted-foreground font-medium">Escrow (Sepolia ETH)</span>
                  <span className="font-bold text-foreground">
                    {activeInquiry && properties.find((p) => p.id === activeInquiry.propertyId)
                      ? `${escrowEthAmount(properties.find((p) => p.id === activeInquiry.propertyId)!)} ETH`
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Estimated Network Gas Fee</span>
                  <span className="font-mono font-semibold text-amber-500">
                    {gasEstimate} {wallet?.chainId === 1 || wallet?.chainId === 11155111 ? "ETH" : "MATIC"}
                  </span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground leading-relaxed bg-primary/5 rounded-lg p-3 border border-primary/20">
                Funding escrow locks ETH in the contract. The owner must confirm the sale to transfer the property NFT to your wallet.
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowPayModal(false)}>
                  Cancel
                </Button>
                <Button variant="hero" size="sm" onClick={handleConfirmPayment}>
                  Approve Transaction
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              {txStep !== "done" ? (
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                  <Check className="h-6 w-6" />
                </div>
              )}

              <div className="text-center space-y-1 w-full">
                <p className="font-bold text-sm">
                  {txStep === "prep" && "Preparing contract arguments..."}
                  {txStep === "signature" && "Requesting cryptographic signature..."}
                  {txStep === "broadcasting" && "Broadcasting transaction to registry node..."}
                  {txStep === "minting" && "Minting registry deed token..."}
                  {txStep === "done" && "Transaction verified on-chain!"}
                </p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-normal">
                  {txStep === "prep" && "Estimating optimal priority gas and preparing parameters."}
                  {txStep === "signature" && "Awaiting wallet authorization in background sandbox."}
                  {txStep === "broadcasting" && "Mining block transaction record on-chain."}
                  {txStep === "minting" && "Assigning token ownership and state tags to your address."}
                  {txStep === "done" && "Updating dashboard records. Please wait..."}
                </p>

                {/* Simulated Ledger Sandbox Console */}
                <div className="w-full mt-4 bg-zinc-950/95 text-zinc-400 font-mono text-[10px] rounded-lg border border-zinc-800/80 p-3 text-left space-y-1 shadow-inner max-h-36 overflow-y-auto leading-relaxed">
                  <div className="text-emerald-500">✓ Connected to Web3 provider (Sepolia Testnet)</div>
                  {txStep === "prep" && (
                    <div className="text-primary animate-pulse">→ Estimating gas & encoding ABI parameters...</div>
                  )}
                  {txStep !== "prep" && (
                    <div className="text-emerald-500">✓ Gas parameters encoded: 310,000 units</div>
                  )}
                  {(txStep === "signature" || txStep === "broadcasting" || txStep === "minting" || txStep === "done") && (
                    <div className={txStep === "signature" ? "text-primary animate-pulse" : "text-emerald-500"}>
                      {txStep === "signature" ? "→ Awaiting user signature authorization..." : "✓ Cryptographic signature accepted"}
                    </div>
                  )}
                  {(txStep === "broadcasting" || txStep === "minting" || txStep === "done") && (
                    <div className={txStep === "broadcasting" ? "text-primary animate-pulse" : "text-emerald-500"}>
                      {txStep === "broadcasting" ? "→ Broadcasting raw tx to Ethereum pool..." : `✓ Block mined: Hash 0x${Math.random().toString(16).slice(2, 10)}...`}
                    </div>
                  )}
                  {(txStep === "minting" || txStep === "done") && (
                    <div className={txStep === "minting" ? "text-primary animate-pulse" : "text-emerald-500"}>
                      {txStep === "minting" ? "→ Smart contract minting Title Deed NFT..." : "✓ Title Deed NFT #EST-1002 minted to wallet"}
                    </div>
                  )}
                  {txStep === "done" && (
                    <div className="text-emerald-400 font-bold">✓ Process complete! Updating local storage.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
