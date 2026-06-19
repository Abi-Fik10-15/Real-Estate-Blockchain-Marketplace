"use client";

import * as React from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCookieConsent } from "@/hooks/use-cookie-consent";
import { CookiePreferencesDialog } from "./cookie-preferences-dialog";

export function CookieBanner() {
  const {
    consent,
    showBanner,
    acceptAll,
    rejectNonEssential,
    saveCustom,
    preferencesOpen,
    setPreferencesOpen,
  } = useCookieConsent();

  React.useEffect(() => {
    const handler = () => setPreferencesOpen(true);
    window.addEventListener("chainestate:open-cookie-preferences", handler);
    return () => window.removeEventListener("chainestate:open-cookie-preferences", handler);
  }, [setPreferencesOpen]);

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            role="region"
            aria-label="Cookie consent"
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "110%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 sm:bottom-4 sm:px-6"
          >
            <div className="mx-auto max-w-3xl rounded-2xl border border-border/70 bg-background/95 p-4 shadow-lg backdrop-blur-sm sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                {/* Icon + text */}
                <div className="flex items-start gap-3 sm:flex-1">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 text-primary">
                    <Cookie className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      We use cookies
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      ChainEstate uses cookies to improve your experience, analyse traffic and
                      show relevant content.{" "}
                      <Link
                        href="/cookie-policy"
                        className="underline underline-offset-2 hover:text-primary"
                      >
                        Learn more
                      </Link>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={rejectNonEssential}
                  >
                    Reject non-essential
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreferencesOpen(true)}
                  >
                    Customize
                  </Button>
                  <Button size="sm" onClick={acceptAll}>
                    Accept all
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CookiePreferencesDialog
        open={preferencesOpen}
        onOpenChange={setPreferencesOpen}
        existingConsent={consent}
        onSave={saveCustom}
        onAcceptAll={acceptAll}
      />
    </>
  );
}
