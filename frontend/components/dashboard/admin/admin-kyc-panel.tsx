"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/services/api";
import { formatDate } from "@/lib/utils";
import type { KycSubmission } from "@/types";

export function AdminKycPanel() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = React.useState<string>("submitted");
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = React.useState<Record<string, string>>({});

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["kyc", "admin", statusFilter],
    queryFn: () => api.getKycSubmissions(statusFilter),
  });

  const handleReview = async (submission: KycSubmission, decision: "approved" | "rejected") => {
    setPendingId(submission.id);
    try {
      await api.reviewKycSubmission(submission.id, {
        decision,
        reviewNotes: reviewNotes[submission.id]?.trim() || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ["kyc"] });
      toast.success(decision === "approved" ? "KYC approved" : "KYC rejected");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Review failed");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Review uploaded identity documents and approve or reject user KYC applications.
        </p>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="submitted">Pending review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="all">All submissions</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading KYC submissions…
            </p>
          ) : submissions.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              No KYC submissions in this queue.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Legal name</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <p className="font-medium">{submission.userName ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{submission.userEmail}</p>
                      <Badge variant="outline" className="mt-1 capitalize text-[10px]">
                        {submission.userRole}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{submission.legalName}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {submission.idType.replace("_", " ")}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {[
                          { label: "ID", url: submission.idDocumentUrl },
                          { label: "Selfie", url: submission.selfieUrl },
                          { label: "Address", url: submission.addressProofUrl },
                          ...(submission.brokerLicenseUrl
                            ? [{ label: "License", url: submission.brokerLicenseUrl }]
                            : []),
                        ].map((doc) => (
                          <a
                            key={doc.label}
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            {doc.label}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {submission.updatedAt ? formatDate(submission.updatedAt) : "—"}
                    </TableCell>
                    <TableCell>
                      {submission.status === "approved" ? (
                        <Badge variant="verified">Approved</Badge>
                      ) : submission.status === "rejected" ? (
                        <Badge variant="destructive">Rejected</Badge>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {submission.status === "submitted" ? (
                        <div className="flex flex-col items-end gap-2">
                          <Textarea
                            placeholder="Review notes (required if rejecting)"
                            className="min-h-[60px] w-48 text-xs"
                            value={reviewNotes[submission.id] ?? ""}
                            onChange={(e) =>
                              setReviewNotes((prev) => ({
                                ...prev,
                                [submission.id]: e.target.value,
                              }))
                            }
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="hero"
                              disabled={pendingId === submission.id}
                              onClick={() => handleReview(submission, "approved")}
                            >
                              {pendingId === submission.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                                  Approve
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive"
                              disabled={pendingId === submission.id}
                              onClick={() => {
                                if (!reviewNotes[submission.id]?.trim()) {
                                  toast.error("Add review notes when rejecting");
                                  return;
                                }
                                void handleReview(submission, "rejected");
                              }}
                            >
                              <XCircle className="mr-1 h-3.5 w-3.5" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ) : submission.reviewNotes ? (
                        <p className="max-w-[180px] text-right text-xs text-muted-foreground">
                          {submission.reviewNotes}
                        </p>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
