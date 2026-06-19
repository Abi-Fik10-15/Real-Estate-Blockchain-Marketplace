"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusCircle, Upload, X } from "lucide-react";
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
  const [uploads, setUploads] = React.useState<Array<{ id: string; name: string; progress: number }>>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreatePropertyValues>({
    resolver: zodResolver(createPropertySchema),
    defaultValues: {
      type: "House",
      listingType: "sale",
      bedrooms: 3,
      bathrooms: 2,
      priceEth: 0.01,
      images: [],
      imagePublicIds: [],
    },
  });

  const images = watch("images") || [];
  const imagePublicIds = watch("imagePublicIds") || [];

  const handleUpload = async (files: File[]) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const filesToUpload = files.filter((f) => validTypes.includes(f.type));

    if (filesToUpload.length === 0) {
      toast.error("Please upload valid JPG, PNG, or WEBP images.");
      return;
    }

    if (images.length + filesToUpload.length > 10) {
      toast.error("You can upload a maximum of 10 images.");
      return;
    }

    const updatedImages = [...images];
    const updatedPublicIds = [...imagePublicIds];

    for (const file of filesToUpload) {
      const uploadId = Math.random().toString(36).substring(2, 9);
      setUploads((prev) => [...prev, { id: uploadId, name: file.name, progress: 0 }]);

      try {
        const result = await api.uploadPropertyImage(file, (progress) => {
          setUploads((prev) =>
            prev.map((u) => (u.id === uploadId ? { ...u, progress } : u))
          );
        });

        updatedImages.push(result.url);
        updatedPublicIds.push(result.publicId);

        setValue("images", updatedImages, { shouldValidate: true });
        setValue("imagePublicIds", updatedPublicIds, { shouldValidate: true });
      } catch (err) {
        console.error("Upload error:", err);
        toast.error(`Failed to upload ${file.name}`);
      } finally {
        setUploads((prev) => prev.filter((u) => u.id !== uploadId));
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await handleUpload(Array.from(e.target.files));
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    await handleUpload(files);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPublicIds = imagePublicIds.filter((_, i) => i !== index);

    setValue("images", newImages, { shouldValidate: true });
    setValue("imagePublicIds", newPublicIds, { shouldValidate: true });
  };

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
      <div className="flex items-center justify-center">
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
                <Label htmlFor="priceEth">Escrow price (Sepolia ETH)</Label>
                <Input
                  id="priceEth"
                  type="number"
                  step="0.001"
                  placeholder="0.01"
                  {...register("priceEth")}
                />
                <p className="text-[11px] text-muted-foreground">
                  Amount buyers send on-chain when funding escrow.
                </p>
                {errors.priceEth && (
                  <p className="text-xs text-destructive">{errors.priceEth.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Property Type</Label>
                <Select
                  value={watch("type")}
                  onValueChange={(v) => setValue("type", v as PropertyType, { shouldValidate: true })}
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
                {errors.type && (
                  <p className="text-xs text-destructive">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Listing Type</Label>
                <Select
                  value={watch("listingType")}
                  onValueChange={(v) => setValue("listingType", v as "sale" | "rent", { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">For Sale</SelectItem>
                    <SelectItem value="rent">For Rent</SelectItem>
                  </SelectContent>
                </Select>
                {errors.listingType && (
                  <p className="text-xs text-destructive">{errors.listingType.message}</p>
                )}
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

            <div className="space-y-3">
              <Label>Property Images</Label>
              <div
                onDragOver={onDragOver}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center cursor-pointer hover:border-hero transition flex flex-col items-center justify-center gap-2 bg-muted/10 min-h-[140px]"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                />
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-sm font-medium">
                  Drag & drop images here, or <span className="text-hero hover:underline">browse</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Supports JPG, PNG, WEBP. Max 10 images.
                </div>
              </div>
              {errors.images && (
                <p className="text-xs text-destructive">{errors.images.message}</p>
              )}

              {/* Image Preview Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                  {images.map((url, i) => (
                    <div
                      key={url}
                      className="relative aspect-video rounded-md overflow-hidden border border-muted bg-muted group"
                    >
                      <img src={url} alt={`Property image ${i + 1}`} className="object-cover w-full h-full" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(i);
                        }}
                        className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Uploading Files Progress */}
              {uploads.length > 0 && (
                <div className="space-y-2 pt-2">
                  {uploads.map((upload) => (
                    <div key={upload.id} className="text-xs space-y-1 bg-muted/40 p-2.5 rounded border">
                      <div className="flex justify-between font-medium">
                        <span className="truncate max-w-[80%]">{upload.name}</span>
                        <span>{upload.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-hero transition-all duration-150"
                          style={{ width: `${upload.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
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
      </div>
    </DashboardShell>
  );
}
