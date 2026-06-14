"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { mockBlockchain } from "@/services/mock-blockchain";
import { shortenAddress } from "@/lib/utils";
import { transferSchema, type TransferValues } from "@/lib/validations";

export function TransferOwnershipDialog({
  currentOwner,
  propertyChainId,
  trigger,
}: {
  currentOwner: string;
  propertyChainId: string;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransferValues>({ resolver: zodResolver(transferSchema) });

  const onSubmit = async (values: TransferValues) => {
    setPending(true);
    try {
      const ev = await mockBlockchain.transferOwnership(currentOwner, values.newOwner, propertyChainId);
      toast.success("Ownership transferred", {
        description: `Tx ${shortenAddress(ev.txHash, 8)}`,
      });
      setOpen(false);
      reset();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Transfer failed");
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline">
            <ArrowLeftRight className="h-4 w-4" /> Transfer Ownership
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Ownership</DialogTitle>
          <DialogDescription>
            This will record an immutable on-chain transfer for {propertyChainId}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Current Owner</Label>
            <div className="rounded-md bg-muted px-3 py-2 font-mono text-xs">
              {shortenAddress(currentOwner, 8)}
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="newOwner">New Owner Wallet Address</Label>
            <Input id="newOwner" placeholder="0x..." {...register("newOwner")} />
            {errors.newOwner && (
              <p className="text-xs text-destructive">{errors.newOwner.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Transferring...
                </>
              ) : (
                "Confirm Transfer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
