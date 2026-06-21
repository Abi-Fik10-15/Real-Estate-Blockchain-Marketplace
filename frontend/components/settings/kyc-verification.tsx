"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  ShieldCheck,
  Upload,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth-store";
import type { KycIdType, UserRole } from "@/types";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_BYTES = 8 * 1024 * 1024;

type DocField = "idDocument" | "selfie" | "addressProof" | "brokerLicense";

function FileUploadField({
  id,
  label,
  hint,
  required,
  file,
  onChange,
}: {
  id: DocField;
  label: string;
  hint: string;
  required?: boolean;
  file: File | null;
  onChange: (field: DocField, file: File | null) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    e.target.value = "";
    if (!selected) return;

    if (!ALLOWED_TYPES.includes(selected.type)) {
      toast.error(`${label}: use JPG, PNG, WEBP, or PDF`);
      return;
    }
    if (selected.size > MAX_BYTES) {
      toast.error(`${label}: file must be 8 MB or smaller`);
      return;
    }
    onChange(id, selected);
  };

  return (
    <div className="space-y-2 rounded-xl border border-border/60 bg-muted/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Label htmlFor={id} className="text-sm font-semibold">
            {label}
            {required ? " *" : ""}
          </Label>
          <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        </div>
        {file && (
          <Badge variant="secondary" className="shrink-0 text-[10px]">
            Ready
          </Badge>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
          <Upload className="mr-1.5 h-3.5 w-3.5" />
          {file ? "Replace file" : "Choose file"}
        </Button>
        {file && (
          <span className="truncate text-xs text-muted-foreground">{file.name}</span>
        )}
      </div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        className="hidden"
        onChange={handleSelect}
      />
    </div>
  );
}

export function KycVerification({ role }: { role: UserRole }) {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const hydrateProfile = useAuthStore((s) => s.hydrateProfile);

  const { data: submission, isLoading } = useQuery({
    queryKey: ["kyc", "mine"],
    queryFn: () => api.getMyKycSubmission(),
  });

  const [legalName, setLegalName] = React.useState("");
  const [dateOfBirth, setDateOfBirth] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [idType, setIdType] = React.useState<KycIdType>("passport");
  const [files, setFiles] = React.useState<Partial<Record<DocField, File>>>({});
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setLegalName(submission?.legalName ?? user.name);
      setAddress(submission?.address ?? "");
    }
  }, [user, submission]);

  const isVerified = user?.kycStatus === "verified" || submission?.status === "approved";
  const isUnderReview = submission?.status === "submitted";
  const isRejected = user?.kycStatus === "rejected" || submission?.status === "rejected";
  const canSubmit = !isVerified && !isUnderReview;

  const handleFileChange = (field: DocField, file: File | null) => {
    setFiles((prev) => {
      const next = { ...prev };
      if (file) next[field] = file;
      else delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!files.idDocument || !files.selfie || !files.addressProof) {
      toast.error("Upload your ID, selfie, and address proof");
      return;
    }
    if (role === "agent" && !files.brokerLicense) {
      toast.error("Agents must upload a broker license");
      return;
    }

    const formData = new FormData();
    formData.append("legalName", legalName.trim());
    formData.append("dateOfBirth", dateOfBirth);
    formData.append("address", address.trim());
    formData.append("idType", idType);
    formData.append("idDocument", files.idDocument);
    formData.append("selfie", files.selfie);
    formData.append("addressProof", files.addressProof);
    if (files.brokerLicense) {
      formData.append("brokerLicense", files.brokerLicense);
    }

    setSubmitting(true);
    try {
      await api.submitKyc(formData);
      await hydrateProfile();
      await queryClient.invalidateQueries({ queryKey: ["kyc", "mine"] });
      setFiles({});
      toast.success("KYC submitted for admin review");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit KYC");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border/60">
        <CardContent className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading verification status…
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="border-b border-border/40 pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-primary">
              <ShieldCheck className="h-4 w-4" />
              Identity verification (KYC)
            </CardTitle>
            <CardDescription className="mt-1 max-w-2xl text-xs">
              Upload government ID, a selfie, and proof of address. Agents also submit a broker
              license. An administrator reviews submissions within 24–48 hours.
            </CardDescription>
          </div>
          {isVerified ? (
            <Badge variant="verified" className="gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Verified
            </Badge>
          ) : isUnderReview ? (
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3.5 w-3.5" /> Under Review
            </Badge>
          ) : isRejected ? (
            <Badge variant="destructive" className="gap-1">
              <XCircle className="h-3.5 w-3.5" /> Rejected
            </Badge>
          ) : (
            <Badge variant="outline" className="border-amber-500/30 text-amber-600">
              Not Submitted
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {isVerified && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-emerald-700 dark:text-emerald-400">
            Your identity is verified. You have full access to escrow, listings, and transactions.
          </div>
        )}

        {isUnderReview && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
            Your documents were submitted on{" "}
            {submission?.updatedAt
              ? new Date(submission.updatedAt).toLocaleString()
              : "recently"}
            . You will be notified once an admin completes the review.
          </div>
        )}

        {isRejected && submission?.reviewNotes && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <p className="font-semibold text-destructive">Review feedback</p>
            <p className="mt-1 text-muted-foreground">{submission.reviewNotes}</p>
          </div>
        )}

        {canSubmit && (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="kyc-legal-name">Legal name (as on ID)</Label>
                <Input
                  id="kyc-legal-name"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kyc-dob">Date of birth</Label>
                <Input
                  id="kyc-dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="kyc-address">Residential address</Label>
                <Textarea
                  id="kyc-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, city, state/province, postal code, country"
                  required
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>ID document type</Label>
                <Select value={idType} onValueChange={(v) => setIdType(v as KycIdType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="drivers_license">Driver&apos;s license</SelectItem>
                    <SelectItem value="national_id">National ID card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <FileUploadField
                id="idDocument"
                label="Government-issued ID"
                hint="Passport, license, or national ID (front page)"
                required
                file={files.idDocument ?? null}
                onChange={handleFileChange}
              />
              <FileUploadField
                id="selfie"
                label="Selfie verification"
                hint="Clear photo of your face holding your ID"
                required
                file={files.selfie ?? null}
                onChange={handleFileChange}
              />
              <FileUploadField
                id="addressProof"
                label="Proof of address"
                hint="Utility bill or bank statement (last 3 months)"
                required
                file={files.addressProof ?? null}
                onChange={handleFileChange}
              />
              {role === "agent" && (
                <FileUploadField
                  id="brokerLicense"
                  label="Real estate license"
                  hint="Valid broker or agent license document"
                  required
                  file={files.brokerLicense ?? null}
                  onChange={handleFileChange}
                />
              )}
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-border/50 bg-muted/20 p-3 text-xs text-muted-foreground">
              <FileText className="mt-0.5 h-4 w-4 shrink-0" />
              Documents are stored securely and reviewed only by platform administrators for AML/KYC
              compliance.
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="hero" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : isRejected ? (
                  "Resubmit for review"
                ) : (
                  "Submit for verification"
                )}
              </Button>
            </div>
          </form>
        )}

        {submission && (isVerified || isUnderReview) && (
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "ID document", url: submission.idDocumentUrl },
              { label: "Selfie", url: submission.selfieUrl },
              { label: "Address proof", url: submission.addressProofUrl },
              ...(submission.brokerLicenseUrl
                ? [{ label: "Broker license", url: submission.brokerLicenseUrl }]
                : []),
            ].map((doc) => (
              <a
                key={doc.label}
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-xs font-medium text-primary hover:underline"
              >
                View {doc.label}
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
