"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

export function useMyTransactions() {
  return useQuery({
    queryKey: ["transactions", "mine"],
    queryFn: () => api.getMyTransactions(),
    staleTime: 15_000,
  });
}
