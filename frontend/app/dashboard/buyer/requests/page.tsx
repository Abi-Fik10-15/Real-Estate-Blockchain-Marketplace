"use client";

import * as React from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { BUYER_NAV } from "@/components/dashboard/nav-configs";
import { InquiryList } from "@/components/dashboard/inquiry-list";
import { useInquiryStore } from "@/store/inquiry-store";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, Shield, Sparkles, HelpCircle } from "lucide-react";

export default function BuyerRequestsPage() {
  const user = useAuthStore((s) => s.user);
  const buyerId = user?.id ?? "u-buyer-1";

  const allInquiries = useInquiryStore((s) => s.inquiries).filter(
    (i) => i.buyerId === buyerId
  );

  const [activeTab, setActiveTab] = React.useState<"all" | "purchase" | "rental" | "question">("all");

  const filteredInquiries = allInquiries.filter((inq) => {
    if (activeTab === "all") return true;
    return inq.type === activeTab;
  });

  return (
    <DashboardShell title="Purchase Requests" roleLabel="Buyer / Renter" nav={BUYER_NAV}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        
        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
         

          {/* Interactive Filter Tabs */}
          <Tabs defaultValue="all" className="w-full" onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="bg-muted/40 border border-border/40 p-1 rounded-xl">
              <TabsTrigger value="all" className="rounded-lg text-xs font-bold px-4">
                All ({allInquiries.length})
              </TabsTrigger>
              <TabsTrigger value="purchase" className="rounded-lg text-xs font-bold px-4">
                Purchases ({allInquiries.filter((i) => i.type === "purchase").length})
              </TabsTrigger>
              <TabsTrigger value="rental" className="rounded-lg text-xs font-bold px-4">
                Rentals ({allInquiries.filter((i) => i.type === "rental").length})
              </TabsTrigger>
              <TabsTrigger value="question" className="rounded-lg text-xs font-bold px-4">
                Questions ({allInquiries.filter((i) => i.type === "question").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4 border-0 p-0 focus-visible:outline-none focus-visible:ring-0">
              <InquiryList
                inquiries={filteredInquiries}
                emptyLabel={`You haven't submitted any ${activeTab === "all" ? "" : activeTab + " "}requests yet.`}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar Web3 Escrow Guidelines */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          <Card className="border border-border/80 bg-card/30 backdrop-blur-md shadow-lg">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Shield className="h-4.5 w-4.5 text-primary" />
                Decentralized Escrow Workflow
              </CardTitle>
              <CardDescription className="text-[11px]">
                Understand the on-chain settlement protocol steps
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="relative border-l-2 border-primary/20 pl-4 space-y-4">
                
                {/* Step 1 */}
                <div className="relative">
                  <div className="absolute -left-[21px] top-0.5 h-2 w-2 rounded-full bg-primary" />
                  <p className="text-xs font-bold text-foreground">1. Send Offer</p>
                  <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">
                    Submit a buy/rent inquiry. This records a pending intent entry linked to the property ID.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="absolute -left-[21px] top-0.5 h-2 w-2 rounded-full bg-primary" />
                  <p className="text-xs font-bold text-foreground">2. Landlord Review</p>
                  <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">
                    The deed owner reviews your request and flags it as "Approved" to trigger the escrow locking phase.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <div className="absolute -left-[21px] top-0.5 h-2 w-2 rounded-full bg-primary" />
                  <p className="text-xs font-bold text-foreground">3. Lock Escrow Funds</p>
                  <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">
                    Pay the purchase or deposit price directly into the smart contract. Gas fee estimations are applied.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="relative">
                  <div className="absolute -left-[21px] top-0.5 h-2 w-2 rounded-full bg-emerald-500" />
                  <p className="text-xs font-bold text-foreground flex items-center gap-1">
                    4. Deed NFT Release
                    <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">
                    Upon validation, the smart contract mints and transfers the title deed token immutably to your wallet.
                  </p>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </DashboardShell>
  );
}
