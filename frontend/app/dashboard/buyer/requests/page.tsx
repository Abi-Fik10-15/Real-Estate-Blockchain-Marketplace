"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { BUYER_NAV } from "@/components/dashboard/nav-configs";
import { InquiryList } from "@/components/dashboard/inquiry-list";
import { useInquiryStore } from "@/store/inquiry-store";

const BUYER_ID = "u-buyer-1";

export default function BuyerRequestsPage() {
  const inquiries = useInquiryStore((s) => s.inquiries).filter(
    (i) => i.buyerId === BUYER_ID
  );

  return (
    <DashboardShell title="Purchase Requests" roleLabel="Buyer / Renter" nav={BUYER_NAV}>
      <PageHeader
        title="My Requests"
        description="Track the status of your purchase, rental, and viewing requests."
      />
      <InquiryList
        inquiries={inquiries}
        emptyLabel="You haven't submitted any requests yet."
      />
    </DashboardShell>
  );
}
