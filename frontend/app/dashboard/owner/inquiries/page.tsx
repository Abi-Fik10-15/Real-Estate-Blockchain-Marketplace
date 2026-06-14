"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { OWNER_NAV } from "@/components/dashboard/nav-configs";
import { InquiryList } from "@/components/dashboard/inquiry-list";
import { useInquiryStore } from "@/store/inquiry-store";

export default function OwnerInquiriesPage() {
  const inquiries = useInquiryStore((s) => s.inquiries);

  return (
    <DashboardShell title="Buyer Inquiries" roleLabel="Property Owner" nav={OWNER_NAV}>
      <PageHeader
        title="Buyer Inquiries"
        description="Respond to purchase, rental, and general questions about your listings."
      />
      <InquiryList inquiries={inquiries} manageable />
    </DashboardShell>
  );
}
