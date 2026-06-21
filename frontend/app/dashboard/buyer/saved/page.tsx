"use client";

import Link from "next/link";
import { Bookmark, Heart } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { BUYER_NAV } from "@/components/dashboard/nav-configs";
import { PropertyCard } from "@/components/property/property-card";
import { Button } from "@/components/ui/button";
import { useProperties } from "@/hooks/use-properties";
import { useSavedStore } from "@/store/saved-store";

export default function BuyerSavedPage() {
  const { data: properties = [] } = useProperties();
  const savedIds = useSavedStore((s) => s.savedIds);

  const saved = properties.filter((p) => savedIds.includes(p.id));

  return (
    <DashboardShell title="Saved Properties" roleLabel="Buyer" nav={BUYER_NAV}>
      <div className="space-y-5">
        {saved.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                <span className="text-primary">{saved.length}</span>{" "}
                saved {saved.length === 1 ? "property" : "properties"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Tap the heart to remove from your list
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/buyer/marketplace">Browse listings</Link>
            </Button>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {saved.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 py-20 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                  <Bookmark className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-base font-semibold">
                  No saved properties yet
                </h3>
                <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                  Browse the marketplace and tap{" "}
                  <Heart className="inline h-3.5 w-3.5 text-rose-500" /> on
                  listings you want to track here.
                </p>
                <Button size="sm" className="mt-5" asChild>
                  <Link href="/dashboard/buyer/marketplace">
                    Browse listings
                  </Link>
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              layout
              className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {saved.map((p, i) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{
                      opacity: 0,
                      scale: 0.96,
                      transition: { duration: 0.2 },
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    <PropertyCard
                      property={p}
                      priority={i < 3}
                      showVerifyLink
                      onSaveToggle={(nextSaved) => {
                        if (!nextSaved) {
                          toast.success(`Removed ${p.title} from saved`);
                        }
                      }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardShell>
  );
}
