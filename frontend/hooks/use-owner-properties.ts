"use client";

import { useAuthStore } from "@/store/auth-store";
import { usePropertyStore } from "@/store/property-store";

/** Properties owned by the currently logged-in user. */
export function useOwnerProperties() {
  const user = useAuthStore((s) => s.user);
  const properties = usePropertyStore((s) => s.properties);
  if (!user) return [];
  return properties.filter((p) => p.ownerId === user.id);
}
