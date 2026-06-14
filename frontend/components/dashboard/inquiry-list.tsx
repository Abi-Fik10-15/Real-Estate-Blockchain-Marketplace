"use client";

import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInquiryStore } from "@/store/inquiry-store";
import { formatDate } from "@/lib/utils";
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

  if (inquiries.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <MessageSquare className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {inquiries.map((inq) => (
        <Card key={inq.id}>
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{inq.propertyTitle}</p>
                <Badge variant="outline" className="capitalize">
                  {inq.type}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{inq.message}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {inq.buyerName} · {formatDate(inq.createdAt)}
              </p>
            </div>
            <div className="shrink-0">
              {manageable ? (
                <Select
                  value={inq.status}
                  onValueChange={(v) => {
                    setStatus(inq.id, v as Inquiry["status"]);
                    toast.success("Inquiry updated");
                  }}
                >
                  <SelectTrigger className="h-8 w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In progress</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant={STATUS_VARIANT[inq.status]} className="capitalize">
                  {inq.status.replace("_", " ")}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
