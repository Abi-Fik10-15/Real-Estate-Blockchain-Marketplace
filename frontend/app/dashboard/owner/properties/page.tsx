"use client";

import * as React from "react";
import Link from "next/link";
import { Building2, PlusCircle, Trash2 } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePropertyStore } from "@/store/property-store";
import { formatCurrency } from "@/lib/utils";
import type { ListingStatus } from "@/types";

const OWNER_ID = "u-owner-1";
const STATUSES: ListingStatus[] = ["active", "pending", "sold", "rented", "draft"];

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
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground" />
            <p className="font-medium">No properties yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first on-chain property listing.
            </p>
            <Button variant="hero" asChild>
              <Link href="/dashboard/owner/properties/new">
                <PlusCircle className="h-4 w-4" /> Create Property
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <p className="font-medium">{p.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.location.city} · {p.chainId}
                      </p>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(p.price)}</TableCell>
                    <TableCell>
                      <Select
                        value={p.status}
                        onValueChange={(v) => {
                          setStatus(p.id, v as ListingStatus);
                          toast.success(`Status set to ${v}`);
                        }}
                      >
                        <SelectTrigger className="h-8 w-32 capitalize">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s} className="capitalize">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {p.verification.status === "verified" ? (
                        <Badge variant="verified">Verified</Badge>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/property/${p.id}`}>View</Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setToDelete(p.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
