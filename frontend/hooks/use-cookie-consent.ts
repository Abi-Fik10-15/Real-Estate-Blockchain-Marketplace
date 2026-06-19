"use client";

import * as React from "react";

export interface CookieCategories {
  necessary: true;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface CookieConsent {
  version: number;
  savedAt: string;
  categories: CookieCategories;
}

const STORAGE_KEY = "chainestate-cookie-consent";
const CURRENT_VERSION = 1;

function readConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: CookieConsent = JSON.parse(raw);
    if (parsed.version !== CURRENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeConsent(categories: Omit<CookieCategories, "necessary">): CookieConsent {
  const consent: CookieConsent = {
    version: CURRENT_VERSION,
    savedAt: new Date().toISOString(),
    categories: { necessary: true, ...categories },
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  return consent;
}

interface UseCookieConsentReturn {
  consent: CookieConsent | null;
  /** Banner should be visible — consent not yet given */
  showBanner: boolean;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  saveCustom: (categories: Omit<CookieCategories, "necessary">) => void;
  /** Open the preferences dialog from anywhere (e.g. footer link) */
  openPreferences: () => void;
  preferencesOpen: boolean;
  setPreferencesOpen: (open: boolean) => void;
}

export function useCookieConsent(): UseCookieConsentReturn {
  const [consent, setConsent] = React.useState<CookieConsent | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [preferencesOpen, setPreferencesOpen] = React.useState(false);

  React.useEffect(() => {
    setConsent(readConsent());
    setMounted(true);
  }, []);

  const acceptAll = React.useCallback(() => {
    const c = writeConsent({ functional: true, analytics: true, marketing: true });
    setConsent(c);
  }, []);

  const rejectNonEssential = React.useCallback(() => {
    const c = writeConsent({ functional: false, analytics: false, marketing: false });
    setConsent(c);
  }, []);

  const saveCustom = React.useCallback((categories: Omit<CookieCategories, "necessary">) => {
    const c = writeConsent(categories);
    setConsent(c);
    setPreferencesOpen(false);
  }, []);

  const openPreferences = React.useCallback(() => {
    setPreferencesOpen(true);
  }, []);

  return {
    consent,
    showBanner: mounted && consent === null,
    acceptAll,
    rejectNonEssential,
    saveCustom,
    openPreferences,
    preferencesOpen,
    setPreferencesOpen,
  };
}
