"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

/**
 * Dispatches a custom event that CookieBanner listens to, opening the preferences dialog
 * from any page — without needing shared context or props.
 */
export function CookiePreferencesButton() {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("chainestate:open-cookie-preferences"));
  };

  return (
    <Button variant="outline" size="sm" onClick={handleClick}>
      Update preferences
    </Button>
  );
}
