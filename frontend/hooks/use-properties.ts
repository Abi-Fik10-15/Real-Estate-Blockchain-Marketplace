"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import type { PropertyFilters } from "@/types";

export function useProperties(filters?: Partial<PropertyFilters>) {
  return useQuery({
    queryKey: ["properties", filters],
    queryFn: () => api.getProperties(filters),
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ["property", id],
    queryFn: () => api.getProperty(id),
    enabled: !!id,
    placeholderData: undefined,
    select: (data) => data || null,
  });
}

export function useStats() {
  return useQuery({ queryKey: ["stats"], queryFn: () => api.getStats() });
}

export function useAgents() {
  return useQuery({ queryKey: ["agents"], queryFn: () => api.getAgents() });
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => api.getUsers(),
  });
}

export function useInquiries() {
  return useQuery({
    queryKey: ["inquiries"],
    queryFn: () => api.getInquiries(),
  });
}

export function useOwnershipRecords() {
  return useQuery({
    queryKey: ["ownership-records"],
    queryFn: () => api.getOwnershipRecords(),
  });
}
