"use client";

import { useQuery } from "@tanstack/react-query";
import { mockApi } from "@/services/mock-api";
import type { PropertyFilters } from "@/types";

export function useProperties(filters?: Partial<PropertyFilters>) {
  return useQuery({
    queryKey: ["properties", filters],
    queryFn: () => mockApi.getProperties(filters),
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ["property", id],
    queryFn: () => mockApi.getProperty(id),
    enabled: !!id,
  });
}

export function useStats() {
  return useQuery({ queryKey: ["stats"], queryFn: () => mockApi.getStats() });
}

export function useAgents() {
  return useQuery({ queryKey: ["agents"], queryFn: () => mockApi.getAgents() });
}

export function useUsers() {
  return useQuery({ queryKey: ["users"], queryFn: () => mockApi.getUsers() });
}

export function useInquiries() {
  return useQuery({ queryKey: ["inquiries"], queryFn: () => mockApi.getInquiries() });
}

export function useOwnershipRecords() {
  return useQuery({
    queryKey: ["ownership-records"],
    queryFn: () => mockApi.getOwnershipRecords(),
  });
}
