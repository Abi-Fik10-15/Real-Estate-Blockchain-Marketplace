"use client";

import { usePropertyStore } from "./property-store";
import { useInquiryStore } from "./inquiry-store";
import { useUserStore } from "./user-store";

/** Reset user-scoped Zustand slices after logout (kept out of auth-store to avoid circular imports). */
export function clearSessionData() {
  usePropertyStore.setState({ properties: [], lastFetchedAt: null });
  useInquiryStore.setState({ inquiries: [] });
  useUserStore.setState({ users: [] });
}
