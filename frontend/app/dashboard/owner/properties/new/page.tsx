"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { OWNER_NAV } from "@/components/dashboard/nav-configs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePropertyStore } from "@/store/property-store";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/services/api";
import { shortenAddress } from "@/lib/utils";
import {
  createPropertySchema,
  type CreatePropertyValues,
} from "@/lib/validations";
import type { PropertyType } from "@/types";

const TYPES: PropertyType[] = [
  "Apartment",
  "House",
  "Villa",
  "Condo",
  "Townhouse",
  "Land",
  "Commercial",
];

export default function CreatePropertyPage() {
  const router = useRouter();
  const createProperty = usePropertyStore((s) => s.createProperty);
  const user = useAuthStore((s) => s.user);
  const [pending, setPending] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreatePropertyValues>({
    resolver: zodResolver(createPropertySchema),
    defaultValues: { type: "House", bedrooms: 3, bathrooms: 2 },
  });

  const onSubmit = async (values: CreatePropertyValues) => {
    if (!user) {
      toast.error("Please log in to create a property");
      return;
    }
    setPending(true);
    try {
      const wallet = user.walletAddress || "0x0000000000000000000000000000000000000000";
      const property = await createProperty(values, {
        id: user.id,
        wallet,
      });

      try {
        const mint = await api.mintPropertyToken(wallet, `ipfs://chainestate/${property.id}`);
        await usePropertyStore.getState().updateProperty(property.id, {
          chainId: mint.tokenId,
        });
        toast.success("Property minted on-chain", {
          description: `Token ${mint.tokenId} · Tx ${shortenAddress(mint.txHash, 8)}`,
        });
      } catch {
        toast.success("Property created", {
          description: "Blockchain mint skipped — configure contract to enable on-chain deeds.",
        });
      }

      router.push("/dashboard/owner/properties");
    } catch {
      toast.error("Failed to create property");
    } finally {
      setPending(false);
    }
  };

  return (
    <DashboardShell title="Create Property" roleLabel="Property Owner" nav={OWNER_NAV}>
      <PageHeader
        title="Create Property"
        description="List a new property and register its ownership on-chain."
      />
      <Card className="max-w-3xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Property Title</Label>
              <Input id="title" placeholder="Skyline Penthouse" {...register("title")} />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Describe the property, finishes, and on-chain history..."
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD)</Label>
                <Input id="price" type="number" placeholder="750000" {...register("price")} />
                {errors.price && (
                  <p className="text-xs text-destructive">{errors.price.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Property Type</Label>
                <Select
                  value={watch("type")}
                  onValueChange={(v) => setValue("type", v as PropertyType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input id="bedrooms" type="number" {...register("bedrooms")} />
                {errors.bedrooms && (
                  <p className="text-xs text-destructive">{errors.bedrooms.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input id="bathrooms" type="number" {...register("bathrooms")} />
                {errors.bathrooms && (
                  <p className="text-xs text-destructive">{errors.bathrooms.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Area (sq ft)</Label>
                <Input id="area" type="number" placeholder="1800" {...register("area")} />
                {errors.area && (
                  <p className="text-xs text-destructive">{errors.area.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="Miami, USA" {...register("location")} />
              {errors.location && (
                <p className="text-xs text-destructive">{errors.location.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/dashboard/owner/properties")}
              >
                Cancel
              </Button>
              <Button type="submit" variant="hero" disabled={pending}>
                {pending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Minting on-chain...
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4" /> Create Property
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
