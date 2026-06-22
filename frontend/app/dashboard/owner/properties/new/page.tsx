"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Info,
  Loader2,
  MapPin,
  PlusCircle,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { OWNER_NAV } from "@/components/dashboard/nav-configs";
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LocationPicker } from "@/components/property/location-picker";
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export default function CreatePropertyPage() {
  const router = useRouter();
  const createProperty = usePropertyStore((s) => s.createProperty);
  const user = useAuthStore((s) => s.user);
  const [pending, setPending] = React.useState(false);
  const [uploads, setUploads] = React.useState<
    Array<{ id: string; name: string; progress: number }>
  >([]);
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
      location: {
        address: "",
        city: "",
        country: "",
      },
    },
  });

  const images = watch("images") || [];
  const imagePublicIds = watch("imagePublicIds") || [];
  const lat = watch("location.lat");
  const lng = watch("location.lng");
  const listingType = watch("listingType");

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
      e.target.value = "";
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    await handleUpload(Array.from(e.dataTransfer.files));
  };

  const removeImage = (index: number) => {
    setValue(
      "images",
      images.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
    setValue(
      "imagePublicIds",
      imagePublicIds.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  };

  const onSubmit = async (values: CreatePropertyValues) => {
    if (!user) {
      toast.error("Please log in to create a property");
      return;
    }
    setPending(true);
    try {
      const wallet =
        user.walletAddress || "0x0000000000000000000000000000000000000000";
      const property = await createProperty(values, {
        id: user.id,
        wallet,
      });

      try {
        const mint = await api.mintPropertyToken(
          wallet,
          `ipfs://chainestate/${property.id}`
        );
        await usePropertyStore.getState().updateProperty(property.id, {
          chainId: mint.tokenId,
        });
        toast.success("Property submitted for review", {
          description: `Minted token ${mint.tokenId}. An admin must approve the listing before it appears on the marketplace.`,
        });
      } catch {
        toast.success("Property submitted for review", {
          description:
            "Listing saved as pending. An admin must approve it before it appears on the marketplace.",
        });
      }

      router.push("/dashboard/owner/properties");
    } catch (error) {
      console.error("Create property failed:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create property. Check the console for details.";
      toast.error(message);
    } finally {
      setPending(false);
    }
  };

  return (
    <DashboardShell title="Create Property" roleLabel="Property Owner" nav={OWNER_NAV}>
      <div className="space-y-5">

        {/* Summary bar */}
        <div className="rounded-xl border border-border/60 bg-card px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                className="-ml-1 h-7 gap-1 text-muted-foreground hover:text-foreground"
                asChild
              >
                <Link href="/dashboard/owner/properties">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </Link>
              </Button>
              <Separator orientation="vertical" className="mt-1 h-4" />
              <div className="min-w-0">
                <h1 className="text-base font-semibold text-primary">Create Property</h1>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  List a new property · saved as{" "}
                  <span className="font-medium text-amber-600 dark:text-amber-400">pending</span>{" "}
                  until admin approval
                </p>
              </div>
            </div>
            {user?.walletAddress && (
              <div className="rounded-lg border border-border/50 bg-muted/10 px-3 py-1.5">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Owner wallet
                </p>
                <p className="font-mono text-xs text-primary">
                  {shortenAddress(user.walletAddress, 6)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Info notice */}
        <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            After saving, we attempt to mint an on-chain property token. Listings stay hidden
            from the marketplace until an admin approves them.
          </p>
        </div>

        <form
          method="post"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit(onSubmit)(e);
          }}
          className="space-y-5"
        >
          {/* ── Basic details ─────────────────────────────────────── */}
          <div className="space-y-3">
            <SectionLabel>Basic Details</SectionLabel>
            <Card className="border-border/60">
              <CardHeader className="border-b border-border/60 pb-3">
                <CardTitle className="text-sm text-primary">Property Info</CardTitle>
                <CardDescription className="text-xs">
                  Title and description shown on the marketplace listing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Property Title</Label>
                  <Input id="title" placeholder="Skyline Penthouse" {...register("title")} />
                  <FieldError message={errors.title?.message} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    placeholder="Describe the property, finishes, and neighborhood..."
                    {...register("description")}
                  />
                  <FieldError message={errors.description?.message} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Pricing & type ────────────────────────────────────── */}
          <div className="space-y-3">
            <SectionLabel>Pricing &amp; Listing</SectionLabel>
            <Card className="border-border/60">
              <CardHeader className="border-b border-border/60 pb-3">
                <CardTitle className="text-sm text-primary">Price &amp; Type</CardTitle>
                <CardDescription className="text-xs">
                  Set USD price, escrow amount, and listing category
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="price">
                      Price (USD)
                      {listingType === "rent" && (
                        <span className="ml-1 text-muted-foreground font-normal">/mo</span>
                      )}
                    </Label>
                    <Input id="price" type="number" placeholder="750000" {...register("price")} />
                    <FieldError message={errors.price?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="priceEth">Escrow (Sepolia ETH)</Label>
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
                    <FieldError message={errors.priceEth?.message} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Property Type</Label>
                    <Select
                      value={watch("type")}
                      onValueChange={(v) =>
                        setValue("type", v as PropertyType, { shouldValidate: true })
                      }
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
                    <FieldError message={errors.type?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Listing Type</Label>
                    <Select
                      value={listingType}
                      onValueChange={(v) =>
                        setValue("listingType", v as "sale" | "rent", { shouldValidate: true })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sale">For Sale</SelectItem>
                        <SelectItem value="rent">For Rent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError message={errors.listingType?.message} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Specs ─────────────────────────────────────────────── */}
          <div className="space-y-3">
            <SectionLabel>Specifications</SectionLabel>
            <Card className="border-border/60">
              <CardHeader className="border-b border-border/60 pb-3">
                <CardTitle className="text-sm text-primary">Property Specs</CardTitle>
                <CardDescription className="text-xs">Bedrooms, bathrooms, and floor area</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input id="bedrooms" type="number" {...register("bedrooms")} />
                    <FieldError message={errors.bedrooms?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input id="bathrooms" type="number" {...register("bathrooms")} />
                    <FieldError message={errors.bathrooms?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="area">Area (sq ft)</Label>
                    <Input id="area" type="number" placeholder="1800" {...register("area")} />
                    <FieldError message={errors.area?.message} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Location ──────────────────────────────────────────── */}
          <div className="space-y-3">
            <SectionLabel>Location</SectionLabel>
            <Card className="border-border/60">
              <CardHeader className="border-b border-border/60 pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-primary">
                  <MapPin className="h-4 w-4" />
                  Address &amp; Map
                </CardTitle>
                <CardDescription className="text-xs">
                  Click the map to set coordinates or enter them manually
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="location.address" className="text-xs text-muted-foreground">
                      Street address
                    </Label>
                    <Input
                      id="location.address"
                      placeholder="123 Main St"
                      {...register("location.address")}
                    />
                    <FieldError message={errors.location?.address?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="location.city" className="text-xs text-muted-foreground">
                      City
                    </Label>
                    <Input id="location.city" placeholder="Miami" {...register("location.city")} />
                    <FieldError message={errors.location?.city?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="location.country" className="text-xs text-muted-foreground">
                      Country
                    </Label>
                    <Input id="location.country" placeholder="USA" {...register("location.country")} />
                    <FieldError message={errors.location?.country?.message} />
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-border/60">
                  <LocationPicker
                    lat={lat}
                    lng={lng}
                    onChange={(newLat, newLng) => {
                      setValue("location.lat", newLat, { shouldValidate: true });
                      setValue("location.lng", newLng, { shouldValidate: true });
                    }}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Latitude</Label>
                    <Input
                      type="number"
                      step="0.000001"
                      value={lat ?? ""}
                      onChange={(e) =>
                        setValue("location.lat", parseFloat(e.target.value), {
                          shouldValidate: true,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Longitude</Label>
                    <Input
                      type="number"
                      step="0.000001"
                      value={lng ?? ""}
                      onChange={(e) =>
                        setValue("location.lng", parseFloat(e.target.value), {
                          shouldValidate: true,
                        })
                      }
                    />
                  </div>
                </div>
                {(errors.location?.lat || errors.location?.lng) && (
                  <p className="text-xs text-destructive">
                    Click the map or enter coordinates manually.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Images ────────────────────────────────────────────── */}
          <div className="space-y-3">
            <SectionLabel>Media</SectionLabel>
            <Card className="border-border/60">
              <CardHeader className="border-b border-border/60 pb-3">
                <CardTitle className="text-sm text-primary">Property Images</CardTitle>
                <CardDescription className="text-xs">
                  Upload up to 10 images · JPG, PNG, or WEBP
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/50 bg-muted/10 p-6 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                  />
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/60 bg-background">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">
                    Drag &amp; drop images here, or{" "}
                    <span className="text-primary hover:underline">browse</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {images.length}/10 uploaded
                  </p>
                </div>
                <FieldError message={errors.images?.message} />

                {images.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                    {images.map((url, i) => (
                      <div
                        key={url}
                        className="group relative aspect-video overflow-hidden rounded-lg border border-border/60 bg-muted"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Property image ${i + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(i);
                          }}
                          className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition hover:bg-black/80 group-hover:opacity-100"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {uploads.length > 0 && (
                  <div className="space-y-2">
                    {uploads.map((upload) => (
                      <div
                        key={upload.id}
                        className="rounded-lg border border-border/50 bg-muted/10 p-2.5 text-xs"
                      >
                        <div className="flex justify-between font-medium">
                          <span className="max-w-[80%] truncate">{upload.name}</span>
                          <span className="tabular-nums text-primary">{upload.progress}%</span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-primary transition-all duration-150"
                            style={{ width: `${upload.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Actions ───────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-end gap-2 rounded-xl border border-border/60 bg-card px-5 py-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/owner/properties")}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={pending} className="gap-1.5">
              {pending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <PlusCircle className="h-3.5 w-3.5" />
                  Create Property
                </>
              )}
            </Button>
          </div>
        </form>

      </div>
    </DashboardShell>
  );
}
