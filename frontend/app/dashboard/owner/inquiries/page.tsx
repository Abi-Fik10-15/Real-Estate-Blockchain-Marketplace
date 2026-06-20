"use client";

import * as React from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { OWNER_NAV } from "@/components/dashboard/nav-configs";
import { InquiryList } from "@/components/dashboard/inquiry-list";
import { useInquiryStore } from "@/store/inquiry-store";

export default function OwnerInquiriesPage() {
  const inquiries = useInquiryStore((s) => s.inquiries);
  const fetchInquiries = useInquiryStore((s) => s.fetchInquiries);
  const isLoading = useInquiryStore((s) => s.isLoading);

  React.useEffect(() => {
    void fetchInquiries();
  }, [fetchInquiries]);

  return (
    <DashboardShell title="Buyer Inquiries" roleLabel="Property Owner" nav={OWNER_NAV}>
      <PageHeader
        title="Buyer Inquiries"
        description="Respond to purchase, rental, and general questions about your listings."
      />
      {isLoading && inquiries.length === 0 ? (
        <p className="text-sm text-muted-foreground">Loading inquiries…</p>
      ) : (
        <InquiryList inquiries={inquiries} manageable />
      )}
    </DashboardShell>
  );
}
