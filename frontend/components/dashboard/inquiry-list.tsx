"use client";

import * as React from "react";
import { MessageSquare, Check, Loader2, Wallet, ShieldCheck, ArrowRight, Activity, HelpCircle } from "lucide-react";
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
import { formatDate, formatCurrency, shortenAddress } from "@/lib/utils";
import type { Inquiry } from "@/types";

const STATUS_VARIANT: Record<Inquiry["status"], "warning" | "secondary" | "success"> = {
  new: "warning",
  in_progress: "secondary",
  closed: "success",
};

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

    try {
      setTxStep("prep");
      await new Promise((r) => setTimeout(r, 1000));

      setTxStep("signature");
      await new Promise((r) => setTimeout(r, 1500));

      setTxStep("broadcasting");
      await new Promise((r) => setTimeout(r, 1200));

      setTxStep("minting");
      await new Promise((r) => setTimeout(r, 1200));

      setTxStep("done");
      await new Promise((r) => setTimeout(r, 1000));

      // 1. Update Inquiry Status to Closed
      setStatus(activeInquiry.id, "closed");

      // 2. Perform On-Chain Ownership Transfer updates in Property Store
      const targetProp = properties.find((p) => p.id === activeInquiry.propertyId);
      if (targetProp) {
        const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
        const newEvent = {
          id: `ev-${Date.now()}`,
          type: "transfer" as const,
          description: `Title deed NFT minted and ownership transferred to buyer address: ${wallet.address}`,
          txHash,
          actor: wallet.address,
          timestamp: new Date().toISOString(),
        };

        updateProperty(targetProp.id, {
          ownerWallet: wallet.address,
          status: activeInquiry.type === "purchase" ? "sold" : "rented",
          history: [newEvent, ...targetProp.history],
        });
      }

      // Mark checklist item complete for visual confirmation
      localStorage.setItem("chainestate_verified_at_least_once", "true");

      toast.success("Transaction verified on-chain! Title deed NFT transferred.");
      setShowPayModal(false);
      setActiveInquiry(null);
    } catch (err) {
      toast.error("Mock transaction signature cancelled.");
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

  // Helper to map status to stepper steps progress
  const getStepIndex = (status: Inquiry["status"]) => {
    if (status === "new") return 0; // Offer Sent
    if (status === "in_progress") return 1; // Approved (ready to fund)
    return 3; // Closed / Complete
  };

  return (
    <div className="space-y-4">
      {inquiries.map((inq) => {
        const prop = properties.find((p) => p.id === inq.propertyId);
        const stepIndex = getStepIndex(inq.status);

        return (
          <Card
            key={inq.id}
            className="border border-border/60 bg-card/20 backdrop-blur-sm shadow-sm transition-all hover:border-border/80"
          >
            <CardContent className="p-5 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-base text-foreground leading-tight">{inq.propertyTitle}</p>
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

                <div className="shrink-0 flex items-center gap-2">
                  {manageable ? (
                    <Select
                      value={inq.status}
                      onValueChange={(v) => {
                        setStatus(inq.id, v as Inquiry["status"]);
                        toast.success(`Inquiry status updated to ${v}`);
                      }}
                    >
                      <SelectTrigger className="h-8 w-36 text-xs bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New / Under Review</SelectItem>
                        <SelectItem value="in_progress">Approved by Owner</SelectItem>
                        <SelectItem value="closed">Closed / Funded</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex flex-col items-end gap-1.5">
                      <Badge variant={STATUS_VARIANT[inq.status]} className="capitalize text-xs font-bold px-2.5 py-0.5">
                        {inq.status === "new"
                          ? "Under Review"
                          : inq.status === "in_progress"
                          ? "Approved (Unfunded)"
                          : "Closed (Title Minted)"}
                      </Badge>
                      
                      {!manageable && inq.status === "in_progress" && (
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
                        width: `${stepIndex === 0 ? 0 : stepIndex === 1 ? 50 : 100}%`,
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
                          stepIndex >= 3
                            ? "bg-primary border-primary text-primary-foreground shadow-sm"
                            : "bg-background border-muted text-muted-foreground"
                        }`}
                      >
                        {stepIndex >= 3 ? <Check className="h-4 w-4" /> : <Wallet className="h-3.5 w-3.5" />}
                      </div>
                      <span className="text-[10px] font-bold text-foreground">Escrow Locked</span>
                    </div>

                    {/* Step 4: Deed NFT Transferred */}
                    <div className="flex flex-col items-center gap-1.5 bg-background px-2">
                      <div
                        className={`h-7 w-7 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all ${
                          stepIndex >= 3
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                            : "bg-background border-muted text-muted-foreground"
                        }`}
                      >
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-bold text-foreground text-center">NFT Transferred</span>
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
              On-Chain Escrow Sandbox
            </DialogTitle>
            <DialogDescription className="text-xs">
              Review and sign the decentralized smart contract details below.
            </DialogDescription>
          </DialogHeader>

          {txStep === "idle" ? (
            <div className="space-y-4 py-3">
              <div className="rounded-lg bg-background/50 border border-border/60 p-4 space-y-3 text-xs">
                <div className="flex justify-between border-b border-border/30 pb-2">
                  <span className="text-muted-foreground font-medium">Smart Contract Target</span>
                  <span className="font-mono text-foreground">{shortenAddress("0x7e3498b8A4B7C2D9E1F3A5B7C9D1E3F5A7B9C1D3", 8)}</span>
                </div>
                <div className="flex justify-between border-b border-border/30 pb-2">
                  <span className="text-muted-foreground font-medium">Deed Asset ID</span>
                  <span className="font-semibold text-foreground">
                    {properties.find((p) => p.id === activeInquiry?.propertyId)?.chainId ?? "EST-3498"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border/30 pb-2">
                  <span className="text-muted-foreground font-medium">Escrow Lock Amount</span>
                  <span className="font-bold text-foreground">
                    {activeInquiry && properties.find((p) => p.id === activeInquiry.propertyId)
                      ? formatCurrency(properties.find((p) => p.id === activeInquiry.propertyId)!.price)
                      : "$350,000"}
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
                ⚡ **Deed NFT Minting:** Funding this escrow locks the assets into the multi-signature contract. Once verified, the deed token will be automatically minted directly to your connected address.
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
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              {txStep !== "done" ? (
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                  <Check className="h-6 w-6" />
                </div>
              )}

              <div className="text-center space-y-1">
                <p className="font-bold text-sm">
                  {txStep === "prep" && "Preparing contract arguments..."}
                  {txStep === "signature" && "Requesting cryptographic signature..."}
                  {txStep === "broadcasting" && "Broadcasting transaction to registry node..."}
                  {txStep === "minting" && "Minting registry deed token..."}
                  {txStep === "done" && "Transaction verified on-chain!"}
                </p>
                <p className="text-xs text-muted-foreground max-w-xs leading-normal">
                  {txStep === "prep" && "Estimating optimal priority gas and preparing parameters."}
                  {txStep === "signature" && "Awaiting wallet authorization in background sandbox."}
                  {txStep === "broadcasting" && "Mining block transaction record on-chain."}
                  {txStep === "minting" && "Assigning token ownership and state tags to your address."}
                  {txStep === "done" && "Updating dashboard records. Please wait..."}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
