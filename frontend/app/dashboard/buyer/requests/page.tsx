"use client";

import * as React from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { BUYER_NAV } from "@/components/dashboard/nav-configs";
import { InquiryList } from "@/components/dashboard/inquiry-list";
import { useInquiryStore } from "@/store/inquiry-store";
import { useAuthStore } from "@/store/auth-store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Shield, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "all", label: "All" },
  { value: "purchase", label: "Purchases" },
  { value: "rental", label: "Rentals" },
  { value: "question", label: "Questions" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

const EMPTY_LABELS: Record<TabValue, string> = {
  all: "Submit an offer or question from any property listing to track it here.",
  purchase: "No purchase offers yet. Open a listing and send a buy inquiry.",
  rental: "No rental requests yet. Browse rentals and submit an inquiry.",
  question: "No questions yet. Ask a property owner from a listing page.",
};

const ESCROW_STEPS = [
  {
    title: "Send offer",
    description:
      "Submit a buy, rent, or general inquiry linked to the property.",
  },
  {
    title: "Owner review",
    description:
      "The owner reviews your request and approves it to open escrow.",
  },
  {
    title: "Fund escrow",
    description:
      "Lock the agreed amount in the smart contract via your wallet.",
  },
  {
    title: "Transfer complete",
    description:
      "The owner confirms on-chain. The property status updates for both parties.",
  },
] as const;

function RequestsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-border/60 bg-card p-5"
        >
          <div className="flex gap-3">
            <div className="h-[72px] w-[88px] shrink-0 rounded-lg bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 rounded bg-muted" />
              <div className="h-12 w-full rounded-lg bg-muted" />
              <div className="h-3 w-1/3 rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BuyerRequestsPage() {
  const user = useAuthStore((s) => s.user);
  const allInquiries = useInquiryStore((s) => s.inquiries);
  const fetchMine = useInquiryStore((s) => s.fetchMine);
  const isLoading = useInquiryStore((s) => s.isLoading);

  React.useEffect(() => {
    if (user?.id) {
      void fetchMine();
    }
  }, [user?.id, fetchMine]);

  // Show nothing until user is resolved to avoid briefly exposing other users' inquiries
  const myInquiries = user?.id
    ? allInquiries.filter((i) => i.buyerId === user.id)
    : [];

  const [activeTab, setActiveTab] = React.useState<TabValue>("all");

  const counts = React.useMemo(
    () => ({
      all: myInquiries.length,
      purchase: myInquiries.filter((i) => i.type === "purchase").length,
      rental: myInquiries.filter((i) => i.type === "rental").length,
      question: myInquiries.filter((i) => i.type === "question").length,
    }),
    [myInquiries],
  );

  const filteredInquiries = myInquiries.filter((inq) => {
    if (activeTab === "all") return true;
    return inq.type === activeTab;
  });

  const inProgressCount = myInquiries.filter(
    (i) => i.status === "in_progress" || i.status === "new",
  ).length;

  return (
    <DashboardShell title="Offers & Inquiries" roleLabel="Buyer" nav={BUYER_NAV}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              <span className="text-primary">{myInquiries.length}</span>{" "}
              {myInquiries.length === 1 ? "request" : "requests"}
              {inProgressCount > 0 && (
                <span className="text-muted-foreground">
                  {" "}
                  · {inProgressCount} active
                </span>
              )}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Track purchase offers, rentals, and questions in one place
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/buyer/marketplace">Browse listings</Link>
          </Button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
          <div className="min-w-0 space-y-4">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as TabValue)}
            >
              <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-xl border border-border/60 bg-muted/30 p-1">
                {TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm",
                    )}
                  >
                    {tab.label}
                    <span className="ml-1.5 text-[10px] text-muted-foreground data-[state=active]:text-primary/70">
                      ({counts[tab.value]})
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {isLoading && myInquiries.length === 0 ? (
              <RequestsSkeleton />
            ) : (
              <InquiryList
                inquiries={filteredInquiries}
                emptyLabel={EMPTY_LABELS[activeTab]}
                emptyAction={{
                  label: "Browse listings",
                  href: "/dashboard/buyer/marketplace",
                }}
              />
            )}
          </div>

          <aside className="space-y-4">
            <Card className="border-border/60">
              <CardHeader className="border-b border-border/40 pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Shield className="h-4 w-4 text-primary" />
                  Escrow workflow
                </CardTitle>
                <CardDescription className="text-xs">
                  How on-chain settlement works
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ol className="relative space-y-4 border-l border-primary/20 pl-4">
                  {ESCROW_STEPS.map((step, index) => (
                    <li key={step.title} className="relative">
                      <span
                        className={cn(
                          "absolute -left-[21px] top-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full border-2 border-background",
                          index === ESCROW_STEPS.length - 1
                            ? "bg-emerald-500"
                            : "bg-primary",
                        )}
                      />
                      <p className="text-xs font-semibold text-foreground">
                        {index + 1}. {step.title}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-muted/20">
              <CardContent className="flex items-start gap-3 p-4">
                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Need to send a new offer?
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    Open any listing in the marketplace and use the inquiry form
                    on the property page.
                  </p>
                  <Button variant="link" size="sm" className="mt-1 h-auto p-0 text-xs" asChild>
                    <Link href="/dashboard/buyer/marketplace">Go to marketplace</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </DashboardShell>
  );
}
