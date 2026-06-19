"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { AGENT_NAV } from "@/components/dashboard/nav-configs";
import { InquiryList } from "@/components/dashboard/inquiry-list";
import { useInquiryStore } from "@/store/inquiry-store";

export default function AgentRequestsPage() {
  const inquiries = useInquiryStore((s) => s.inquiries);

  return (
    <DashboardShell title="Buyer Requests" roleLabel="Property Agent" nav={AGENT_NAV}>
      <PageHeader
        title="Buyer Requests"
        description="Manage purchase, rental, and viewing requests across your assigned listings."
      />
      <InquiryList inquiries={inquiries} manageable />
    </DashboardShell>
  );
}
