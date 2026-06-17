"use client";

import * as React from "react";
import { useAuthStore } from "@/store/auth-store";
import { usePropertyStore } from "@/store/property-store";
import { useInquiryStore } from "@/store/inquiry-store";
import { useUserStore } from "@/store/user-store";
import { useSavedStore } from "@/store/saved-store";
import { useNotifications } from "@/hooks/use-notifications";

/** Syncs authenticated session data from the NestJS API into Zustand stores. */
export function AppBootstrap() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const fetchProperties = usePropertyStore((s) => s.fetchProperties);
  const fetchInquiries = useInquiryStore((s) => s.fetchInquiries);
  const fetchMine = useInquiryStore((s) => s.fetchMine);
  const fetchUsers = useUserStore((s) => s.fetchUsers);
  const syncSaved = useSavedStore((s) => s.syncWithServer);

  useNotifications();

  React.useEffect(() => {
    void fetchProperties();
  }, [fetchProperties]);

  React.useEffect(() => {
    if (!token || !user) return;

    if (user.role === "buyer") {
      void fetchMine();
      void syncSaved();
    } else if (["owner", "agent", "admin"].includes(user.role)) {
      void fetchInquiries();
    }
    if (user.role === "admin") {
      void fetchUsers();
    }
  }, [token, user, fetchInquiries, fetchMine, fetchUsers, syncSaved]);

  React.useEffect(() => {
    const onExpired = () => useAuthStore.getState().logout();
    window.addEventListener("chainestate:auth-expired", onExpired);
    return () => window.removeEventListener("chainestate:auth-expired", onExpired);
  }, []);

  return null;
}
