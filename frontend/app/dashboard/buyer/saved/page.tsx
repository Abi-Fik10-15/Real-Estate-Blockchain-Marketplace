"use client";

import Link from "next/link";
import { Heart, MapPin, ArrowRight, Bookmark } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { BUYER_NAV } from "@/components/dashboard/nav-configs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePropertyStore } from "@/store/property-store";
import { useSavedStore } from "@/store/saved-store";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function BuyerSavedPage() {
  const properties = usePropertyStore((s) => s.properties);
  const savedIds = useSavedStore((s) => s.savedIds);
  const toggleSaved = useSavedStore((s) => s.toggleSaved);

  const saved = properties.filter((p) => savedIds.includes(p.id));

  return (
    <DashboardShell title="Saved Properties" roleLabel="Buyer / Renter" nav={BUYER_NAV}>
      
      
      <AnimatePresence mode="popLayout">
        {saved.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            key="empty-state"
          >
            <Card className="border border-dashed border-border/80 bg-card/10 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                <Bookmark className="h-12 w-12 text-muted-foreground/30" />
                <p className="font-bold text-xl text-foreground">No bookmarked listings</p>
                <p className="text-sm text-muted-foreground max-w-sm leading-normal">
                  Explore available properties in the catalog and save favorites to track their contract status here.
                </p>
                <Button variant="default" className="mt-2 text-md py-2 px-8" asChild>
                  <Link href="/dashboard/buyer/marketplace">Browse Listings</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            key="grid-container"
          >
            <AnimatePresence mode="popLayout">
              {saved.map((p) => (
                <motion.div
                  layout
                  key={p.id}
                  initial={{ opacity: 1, scale: 1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                >
                  <Card className="overflow-hidden border border-border/40 bg-card/15 hover:bg-card/25 transition-all duration-300 flex flex-col h-full group shadow-none hover:border-primary/20">
                    <div className="relative h-44 overflow-hidden shrink-0 bg-muted">
                      <div
                        className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.03]"
                        style={{ backgroundImage: `url(${p.images[0]})` }}
                      />
                      
                      {/* Floating Minimalist Heart Badge */}
                      <button
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-background/70 hover:bg-background/90 text-primary shadow-sm backdrop-blur-md transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleSaved(p.id);
                          toast.success(`Removed ${p.title} from saved`);
                        }}
                      >
                        <Heart className="h-4 w-4 fill-primary text-primary" />
                      </button>
                    </div>

                    <CardContent className="p-4 flex flex-col justify-between flex-1 space-y-3">
                      <div className="space-y-1">
                        {/* Tags list */}
                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                            For {p.listingType === "sale" ? "Sale" : "Rent"}
                          </span>
                          <span className="text-[9px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {p.type}
                          </span>
                          {p.verification.status === "verified" && (
                            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              Verified ✓
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <p className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                          {p.title}
                        </p>
                        
                        {/* Location */}
                        <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                          {p.location.city}, {p.location.country}
                        </p>
                      </div>

                      {/* Clean Inline Specs Row */}
                      <p className="text-xs text-muted-foreground/85 font-medium border-t border-border/20 pt-2.5">
                        {p.bedrooms} beds • {p.bathrooms} baths • {p.area.toLocaleString()} sq ft
                      </p>

                      {/* Price & Actions Row */}
                      <div className="flex items-center justify-between border-t border-border/20 pt-3 mt-1.5">
                        <div>
                          <p className="text-sm font-bold text-foreground leading-none">
                            {formatCurrency(p.price)}
                            {p.listingType === "rent" && <span className="text-[10px] font-normal text-muted-foreground">/mo</span>}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="h-7 px-2.5 text-[10px] font-semibold" asChild>
                            <Link href={`/dashboard/buyer/marketplace/property/${p.id}`}>
                              View
                            </Link>
                          </Button>
                          <Button size="sm" variant="hero" className="h-7 px-2.5 text-[10px] font-bold" asChild>
                            <Link href={`/dashboard/buyer/verification?id=${p.chainId}`}>
                              Verify Registry
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}

