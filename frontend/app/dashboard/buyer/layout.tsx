"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { BUYER_MARKETPLACE_PATH } from "@/lib/routes";

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isHydrating = useAuthStore((s) => s.isHydrating);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  React.useEffect(() => {
    if (!hasHydrated || isHydrating || !token || !user) return;
    if (user.role !== "buyer") {
      router.replace(`/dashboard/${user.role}`);
    }
  }, [user, token, isHydrating, hasHydrated, router]);

  if (!hasHydrated || isHydrating || !token || (user && user.role !== "buyer")) {
    return null;
  }

  return <>{children}</>;
}
