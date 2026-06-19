"use client";

import { useAuthStore } from "@/store/auth-store";
import { usePropertyStore } from "@/store/property-store";
import { useMyTransactions } from "@/hooks/use-transactions";
import type { Property } from "@/types";

/** Properties purchased or rented by the currently logged-in buyer. */
export function useBuyerProperties(): Property[] {
  const user = useAuthStore((s) => s.user);
  const properties = usePropertyStore((s) => s.properties);
  const { data: transactions = [] } = useMyTransactions();

  if (!user) return [];

  const completedAsBuyer = new Set(
    transactions
      .filter((t) => t.buyerId === user.id && t.status === "completed")
      .map((t) => t.propertyId)
  );

  return properties.filter(
    (p) => p.ownerId === user.id || completedAsBuyer.has(p.id)
  );
}
