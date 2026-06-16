"use client";

import * as React from "react";
import Link from "next/link";
import { Building2, PlusCircle, Trash2, ExternalLink, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { OWNER_NAV } from "@/components/dashboard/nav-configs";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePropertyStore } from "@/store/property-store";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ListingStatus } from "@/types";

const OWNER_ID = "u-owner-1";
const STATUSES: ListingStatus[] = ["active", "pending", "sold", "rented", "draft"];

const STATUS_COLOR: Record<ListingStatus, string> = {
  active: "text-emerald-600 dark:text-emerald-400",
  pending: "text-amber-600 dark:text-amber-400",
  sold: "text-primary",
  rented: "text-accent",
  draft: "text-muted-foreground",
};

export default function OwnerPropertiesPage() {
  const properties = usePropertyStore((s) => s.properties).filter(
    (p) => p.ownerId === OWNER_ID
  );
  const setStatus = usePropertyStore((s) => s.setStatus);
  const deleteProperty = usePropertyStore((s) => s.deleteProperty);
  const [toDelete, setToDelete] = React.useState<string | null>(null);

  const confirmDelete = () => {
    if (toDelete) {
      deleteProperty(toDelete);
      toast.success("Property removed from your portfolio");
      setToDelete(null);
    }
  };

  return (
    <DashboardShell title="My Properties" roleLabel="Property Owner" nav={OWNER_NAV}>
      <PageHeader
        title="Manage Properties"
        description="Update listing status, transfer ownership, or remove properties."
        actions={
          <Button variant="hero" asChild>
            <Link href="/dashboard/owner/properties/new">
              <PlusCircle className="h-4 w-4" /> Create Property
            </Link>
          </Button>
        }
      />

      {properties.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl border border-border/60 bg-muted/30">
              <Building2 className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <div>
              <p className="font-semibold">No properties yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first on-chain property listing.
              </p>
            </div>
            <Button variant="hero" asChild>
              <Link href="/dashboard/owner/properties/new">
                <PlusCircle className="h-4 w-4" /> Create Property
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60">
          <CardContent className="p-0">
            <div className="divide-y divide-border/40">
              {properties.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-muted/20 sm:flex-row sm:items-center sm:justify-between"
                >
                  {/* Image + info */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-border/60">
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{p.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {p.chainId}
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">
                          {p.location.city}
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-xs font-semibold">
                          {formatCurrency(p.price)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {/* Status selector */}
                    <Select
                      value={p.status}
                      onValueChange={(v) => {
                        setStatus(p.id, v as ListingStatus);
                        toast.success(`Status set to "${v}"`);
                      }}
                    >
                      <SelectTrigger
                        className={cn(
                          "h-8 w-32 text-xs font-semibold capitalize",
                          STATUS_COLOR[p.status]
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem
                            key={s}
                            value={s}
                            className={cn("text-xs capitalize font-medium", STATUS_COLOR[s])}
                          >
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Verification badge */}
                    {p.verification.status === "verified" ? (
                      <Badge variant="verified" className="gap-1 text-[10px]">
                        <ShieldCheck className="h-3 w-3" /> Verified
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="text-[10px]">Pending</Badge>
                    )}

                    {/* Actions */}
                    <Button size="sm" variant="ghost" className="h-8 px-3 text-xs" asChild>
                      <Link href={`/property/${p.id}`}>
                        View <ExternalLink className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setToDelete(p.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete property?</DialogTitle>
            <DialogDescription>
              This removes the listing from your portfolio. This action cannot be undone in
              this demo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
