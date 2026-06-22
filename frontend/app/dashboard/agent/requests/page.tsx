"use client";

import * as React from "react";
import { MessageSquare } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AGENT_NAV } from "@/components/dashboard/nav-configs";
import { InquiryList } from "@/components/dashboard/inquiry-list";
import { useInquiryStore } from "@/store/inquiry-store";
import { usePropertyStore } from "@/store/property-store";
import { useAuthStore } from "@/store/auth-store";

export default function AgentRequestsPage() {
  const userId = useAuthStore((s) => s.user?.id);
  const allInquiries = useInquiryStore((s) => s.inquiries);
  const fetchInquiries = useInquiryStore((s) => s.fetchInquiries);
  const isLoading = useInquiryStore((s) => s.isLoading);

  // Only show inquiries for properties this agent is assigned to
  const assignedPropertyIds = new Set(
    usePropertyStore((s) => s.properties)
      .filter((p) => p.agentId === userId)
      .map((p) => p.id)
  );
  const inquiries = allInquiries.filter((i) => assignedPropertyIds.has(i.propertyId));

  const unreadCount = inquiries.filter((i) => i.status === "new").length;

  React.useEffect(() => {
    void fetchInquiries();
  }, [fetchInquiries]);

  return (
    <DashboardShell title="Buyer Requests" roleLabel="Property Agent" nav={AGENT_NAV}>
      <div className="space-y-5">

        {/* Summary bar */}
        <div className="rounded-xl border border-border/60 bg-card px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-base font-semibold text-foreground">Buyer Requests</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Manage purchase, rental, and viewing requests across your assigned listings.
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
