"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { type CookieCategories, type CookieConsent } from "@/hooks/use-cookie-consent";

interface Category {
  key: keyof Omit<CookieCategories, "necessary">;
  label: string;
  description: string;
  required?: boolean;
}

const CATEGORIES: Category[] = [
  {
    key: "functional",
    label: "Functional",
    description:
      "Enable enhanced features such as theme preferences and saved searches. Disabling these may reduce your experience.",
  },
  {
    key: "analytics",
    label: "Analytics",
    description:
      "Help us understand how visitors interact with ChainEstate so we can improve performance and content. Data is aggregated and anonymised.",
  },
  {
    key: "marketing",
    label: "Marketing",
    description:
      "Allow us to show personalised property recommendations and relevant advertising based on your activity.",
  },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingConsent: CookieConsent | null;
  onSave: (categories: Omit<CookieCategories, "necessary">) => void;
  onAcceptAll: () => void;
}

export function CookiePreferencesDialog({
  open,
  onOpenChange,
  existingConsent,
  onSave,
  onAcceptAll,
}: Props) {
  const [prefs, setPrefs] = React.useState({
    functional: existingConsent?.categories.functional ?? true,
    analytics: existingConsent?.categories.analytics ?? false,
    marketing: existingConsent?.categories.marketing ?? false,
  });

  React.useEffect(() => {
    if (open) {
      setPrefs({
        functional: existingConsent?.categories.functional ?? true,
        analytics: existingConsent?.categories.analytics ?? false,
        marketing: existingConsent?.categories.marketing ?? false,
      });
    }
  }, [open, existingConsent]);

  const toggle = (key: keyof typeof prefs) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border/60 px-6 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 text-primary">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <DialogTitle className="text-base font-semibold leading-tight">
              Cookie Preferences
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
              Manage which cookies ChainEstate may use.
            </DialogDescription>
          </div>
        </div>

        {/* Categories */}
        <div className="divide-y divide-border/50 px-6">
          {/* Necessary — always on */}
          <div className="flex items-start justify-between gap-4 py-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">Necessary</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                Required for the platform to function — authentication, security, and session
                management. These cannot be disabled.
              </p>
            </div>
            <Switch checked disabled className="mt-0.5 shrink-0" aria-label="Necessary cookies — always on" />
          </div>

          {CATEGORIES.map(({ key, label, description }) => (
            <div key={key} className="flex items-start justify-between gap-4 py-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
              <Switch
                checked={prefs[key]}
                onCheckedChange={() => toggle(key)}
                className="mt-0.5 shrink-0"
                aria-label={`Toggle ${label} cookies`}
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-border/60 bg-muted/20 px-6 py-4">
          <Link
            href="/cookie-policy"
            className="text-xs text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
            onClick={() => onOpenChange(false)}
          >
            Cookie Policy
          </Link>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSave(prefs)}
            >
              Save preferences
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onAcceptAll();
                onOpenChange(false);
              }}
            >
              Accept all
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
