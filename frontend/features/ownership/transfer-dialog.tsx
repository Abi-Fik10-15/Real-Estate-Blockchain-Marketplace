"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftRight,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  ShieldCheck,
  Wallet,
  Copy,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { contractClient } from "@/lib/contract";
import { api } from "@/services/api";
import { usePropertyStore } from "@/store/property-store";
import { useAgents } from "@/hooks/use-properties";
import { shortenAddress, cn } from "@/lib/utils";
import { transferSchema, type TransferValues } from "@/lib/validations";

type Step = "review" | "confirm" | "success";

const STEP_LABELS: Record<Step, string> = {
  review: "Enter Details",
  confirm: "Confirm Transfer",
  success: "Transfer Complete",
};

const STEPS: Step[] = ["review", "confirm", "success"];

function StepIndicator({ current }: { current: Step }) {
  const idx = STEPS.indexOf(current);
  return (
    <div className="flex items-center gap-2 mb-6">
      {STEPS.map((step, i) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                i < idx
                  ? "bg-primary text-primary-foreground"
                  : i === idx
                  ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {i < idx ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={cn(
                "text-[10px] font-medium whitespace-nowrap",
                i === idx ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {STEP_LABELS[step]}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                "h-0.5 flex-1 mb-4 rounded-full transition-all duration-500",
                i < idx ? "bg-primary" : "bg-border"
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export function TransferOwnershipDialog({
  currentOwner,
  propertyChainId,
  trigger,
}: {
  currentOwner: string;
  propertyChainId: string;
  trigger?: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const updateProperty = usePropertyStore((s) => s.updateProperty);
  const properties = usePropertyStore((s) => s.properties);

  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<Step>("review");
  const [pending, setPending] = React.useState(false);
  const [txResult, setTxResult] = React.useState<{ txHash: string; timestamp: string } | null>(null);
  const [newOwnerPreview, setNewOwnerPreview] = React.useState("");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<TransferValues>({
    resolver: zodResolver(transferSchema),
    mode: "onChange",
  });

  const watchedAddress = watch("newOwner", "");

  const { data: agents = [] } = useAgents();

  const matchedUser = React.useMemo(
    () =>
      agents.find(
        (u) => u.walletAddress.toLowerCase() === watchedAddress?.toLowerCase()
      ),
    [agents, watchedAddress]
  );

  const targetProperty = properties.find((p) => p.chainId === propertyChainId);

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setStep("review");
      setTxResult(null);
      reset();
    }, 300);
  };

  const onReviewSubmit = (values: TransferValues) => {
    setNewOwnerPreview(values.newOwner);
    setStep("confirm");
  };

  const onConfirm = async () => {
    setPending(true);
    try {
      let txHash: string;
      let timestamp: string;

      if (/^\d+$/.test(propertyChainId)) {
        const result = await contractClient.transferOwnership(propertyChainId, newOwnerPreview);
        txHash = result.txHash;
        timestamp = result.timestamp;
      } else {
        timestamp = new Date().toISOString();
        txHash = `local-${Date.now()}`;
      }

      if (targetProperty) {
        await updateProperty(targetProperty.id, {
          ownerWallet: newOwnerPreview,
          ownerId: matchedUser ? matchedUser.id : targetProperty.ownerId,
          agentId: undefined,
          agentWallet: undefined,
          history: [
            {
              id: `evt-${Date.now()}`,
              type: "transfer",
              description: `Ownership transferred from ${shortenAddress(currentOwner, 6)} to ${shortenAddress(newOwnerPreview, 6)}`,
              txHash,
              actor: newOwnerPreview,
              timestamp,
            },
            ...targetProperty.history,
          ],
        });

        queryClient.invalidateQueries({ queryKey: ["property", targetProperty.id] });
        queryClient.invalidateQueries({ queryKey: ["properties"] });
      }

      setTxResult({ txHash, timestamp });
      setStep("success");
      toast.success("Ownership transferred successfully", {
        description: `Tx ${shortenAddress(txHash, 8)}`,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Transfer failed");
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline">
            <ArrowLeftRight className="h-4 w-4" /> Transfer Ownership
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
        {/* Gradient header */}
        <div className="bg-gradient-to-r from-[hsl(var(--brand-1)/0.12)] to-[hsl(var(--brand-3)/0.08)] border-b border-border/50 px-6 pt-6 pb-4">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <ArrowLeftRight className="h-4 w-4" />
              </div>
              <DialogTitle className="text-base font-semibold">Transfer Ownership</DialogTitle>
            </div>
            <p className="text-xs text-muted-foreground ml-12">
              Chain ID: <span className="font-mono text-foreground">{propertyChainId}</span>
            </p>
          </DialogHeader>
        </div>

        <div className="px-6 py-5">
          <StepIndicator current={step} />

          <AnimatePresence mode="wait">
            {/* ── Step 1: Enter Details ─────────────────────────────── */}
            {step === "review" && (
              <motion.form
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: [0.25, 0.4, 0, 1] }}
                onSubmit={handleSubmit(onReviewSubmit)}
                className="space-y-5"
              >
                {/* Current owner display */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Current Owner
                  </Label>
                  <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-2.5">
                    <Wallet className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="font-mono text-xs text-foreground">{shortenAddress(currentOwner, 10)}</span>
                    <Badge variant="success" className="ml-auto text-[10px] py-0 px-1.5">Current</Badge>
                  </div>
                </div>

                {/* Property context */}
                {targetProperty && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Property
                    </Label>
                    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/40 px-3 py-2.5">
                      <div className="h-8 w-10 shrink-0 overflow-hidden rounded border border-border/60">
                        <img src={targetProperty.images[0]} alt={targetProperty.title} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">{targetProperty.title}</p>
                        <p className="text-[10px] text-muted-foreground">{targetProperty.location.city}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* New owner input */}
                <div className="space-y-2">
                  <Label htmlFor="newOwner" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    New Owner Wallet Address
                  </Label>
                  <Input
                    id="newOwner"
                    placeholder="0x..."
                    className="font-mono text-sm"
                    {...register("newOwner")}
                  />
                  {errors.newOwner && (
                    <p className="text-xs text-destructive">{errors.newOwner.message}</p>
                  )}
                  {matchedUser && !errors.newOwner && (
                    <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Matched platform user: <span className="font-semibold">{matchedUser.name}</span>
                    </div>
                  )}
                </div>

                <Button type="submit" variant="hero" className="w-full" disabled={!isValid}>
                  Review Transfer <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.form>
            )}

            {/* ── Step 2: Confirm ───────────────────────────────────── */}
            {step === "confirm" && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: [0.25, 0.4, 0, 1] }}
                className="space-y-4"
              >
                {/* Warning banner */}
                <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/8 px-4 py-3">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                    This action is <strong>irreversible</strong>. The ownership deed will be permanently recorded on-chain. Please verify all details before confirming.
                  </p>
                </div>

                {/* Transfer summary */}
                <div className="rounded-xl border border-border/60 bg-muted/30 divide-y divide-border/40">
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-xs text-muted-foreground">From</span>
                    <span className="font-mono text-xs font-medium">{shortenAddress(currentOwner, 8)}</span>
                  </div>
                  <div className="flex justify-center py-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                      <ArrowRight className="h-3 w-3 text-primary" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-xs text-muted-foreground">To</span>
                    <div className="flex items-center gap-2">
                      {matchedUser && (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{matchedUser.name}</span>
                      )}
                      <span className="font-mono text-xs font-medium">{shortenAddress(newOwnerPreview, 8)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-xs text-muted-foreground">Chain ID</span>
                    <span className="font-mono text-xs">{propertyChainId}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-xs text-muted-foreground">Gas (est.)</span>
                    <span className="font-mono text-xs text-amber-500">~0.0042 ETH</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep("review")}
                    disabled={pending}
                  >
                    <ChevronLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button
                    variant="hero"
                    className="flex-1"
                    onClick={onConfirm}
                    disabled={pending}
                  >
                    {pending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Broadcasting...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" /> Confirm & Sign
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Success ───────────────────────────────────── */}
            {step === "success" && txResult && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: [0.25, 0.4, 0, 1] }}
                className="space-y-5 text-center"
              >
                <div className="flex flex-col items-center gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 20 }}
                    className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10"
                  >
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  </motion.div>
                  <div>
                    <h3 className="text-base font-bold">Transfer Confirmed!</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      The title deed has been recorded on-chain.
                    </p>
                  </div>
                </div>

                {/* Receipt card */}
                <div className="rounded-xl border border-border/60 bg-muted/30 text-left divide-y divide-border/40">
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-xs text-muted-foreground">New Owner</span>
                    <span className="font-mono text-xs font-medium">{shortenAddress(newOwnerPreview, 8)}</span>
                  </div>
                  <div className="flex justify-between items-start px-4 py-3 gap-3">
                    <span className="text-xs text-muted-foreground shrink-0">Tx Hash</span>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-xs truncate">{shortenAddress(txResult.txHash, 10)}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(txResult.txHash);
                          toast.success("Copied to clipboard");
                        }}
                        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-xs text-muted-foreground">Timestamp</span>
                    <span className="text-xs">{new Date(txResult.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-xs text-muted-foreground">Status</span>
                    <Badge variant="success" className="text-[10px]">Confirmed</Badge>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 gap-2 text-xs" asChild>
                    <a href={`/dashboard/sandbox`}>
                      <ExternalLink className="h-3.5 w-3.5" /> View in Sandbox
                    </a>
                  </Button>
                  <Button variant="hero" className="flex-1" onClick={handleClose}>
                    Done
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
