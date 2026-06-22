"use client";

import * as React from "react";
import { MessageSquare } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { OWNER_NAV } from "@/components/dashboard/nav-configs";
import { InquiryList } from "@/components/dashboard/inquiry-list";
import { useInquiryStore } from "@/store/inquiry-store";
import { useOwnerProperties } from "@/hooks/use-owner-properties";

export default function OwnerInquiriesPage() {
  const allInquiries = useInquiryStore((s) => s.inquiries);
  const fetchInquiries = useInquiryStore((s) => s.fetchInquiries);
  const isLoading = useInquiryStore((s) => s.isLoading);
  const properties = useOwnerProperties();

  // Only show inquiries for properties this owner actually owns
  const ownedPropertyIds = new Set(properties.map((p) => p.id));
  const inquiries = allInquiries.filter((i) => ownedPropertyIds.has(i.propertyId));

  const unreadCount = inquiries.filter((i) => i.status === "new").length;

  React.useEffect(() => {
    void fetchInquiries();
  }, [fetchInquiries]);

  return (
    <DashboardShell title="Buyer Inquiries" roleLabel="Property Owner" nav={OWNER_NAV}>
      <div className="space-y-5">

        {/* Summary bar */}
        <div className="rounded-xl border border-border/60 bg-card px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-base font-semibold text-foreground">Buyer Inquiries</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Respond to purchase, rental, and general questions about your listings.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/10 px-3 py-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">
                <span className="text-primary">{inquiries.length}</span> total ·{" "}
                {unreadCount > 0 ? (
                  <span className="text-amber-600 dark:text-amber-400">{unreadCount} unread</span>
                ) : (
                  <span className="text-muted-foreground">all read</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {isLoading && inquiries.length === 0 ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl border border-border/60 bg-muted/30" />
            ))}
          </div>
        ) : (
          <InquiryList inquiries={inquiries} manageable />
        )}

      </div>
    </DashboardShell>
  );
}
