"use client";

import { create } from "zustand";
import { api } from "@/services/api";
import type { CreatePropertyValues } from "@/lib/validations";
import type { ListingStatus, Property } from "@/types";

const PROPERTIES_TTL_MS = 60_000; // 1 minute

interface PropertyState {
  properties: Property[];
  isLoading: boolean;
  lastFetchedAt: number | null;
  fetchProperties: (force?: boolean) => Promise<void>;
  fetchByOwner: (ownerId: string) => Promise<Property[]>;
  createProperty: (
    values: CreatePropertyValues,
    owner: { id: string; wallet: string }
  ) => Promise<Property>;
  updateProperty: (id: string, patch: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => void;
  setStatus: (id: string, status: ListingStatus) => Promise<void>;
  assignAgent: (id: string, agent: { id: string; wallet: string } | null) => Promise<void>;
  approveProperty: (id: string) => Promise<void>;
  byOwner: (ownerId: string) => Property[];
  byAgent: (agentId: string) => Property[];
  setProperties: (properties: Property[]) => void;
}

export const usePropertyStore = create<PropertyState>()((set, get) => ({
  properties: [],
  isLoading: false,
  lastFetchedAt: null,

  setProperties: (properties) => set({ properties }),

  fetchProperties: async (force = false) => {
    const { isLoading, lastFetchedAt, properties } = get();
    // Skip if already loading, or data is fresh and not forced
    if (isLoading) return;
    if (!force && lastFetchedAt && Date.now() - lastFetchedAt < PROPERTIES_TTL_MS && properties.length > 0) return;

    set({ isLoading: true });
    try {
      const properties = await api.getProperties();
      set({ properties, isLoading: false, lastFetchedAt: Date.now() });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchByOwner: async (ownerId) => {
    const properties = await api.getPropertiesByOwner(ownerId);
    set((s) => {
      const others = s.properties.filter((p) => p.ownerId !== ownerId);
      return { properties: [...properties, ...others] };
    });
    return properties;
  },

  createProperty: async (values, owner) => {
    const property = await api.createProperty({
      ...values,
      ownerWallet: owner.wallet,
    });
    set((s) => ({ properties: [property, ...s.properties] }));
    return property;
  },

  updateProperty: async (id, patch) => {
    const updated = await api.updateProperty(id, {
      title: patch.title,
      description: patch.description,
      price: patch.price,
      status: patch.status,
      agentId: patch.agentId,
      agentWallet: patch.agentWallet,
      blockchainTokenId: patch.chainId,
      ownerWallet: patch.ownerWallet,
      priceEth: patch.priceEth,
    });
    set((s) => ({
      properties: s.properties.map((p) => (p.id === id ? { ...p, ...updated, ...patch } : p)),
    }));
  },

  deleteProperty: (id) =>
    set((s) => ({ properties: s.properties.filter((p) => p.id !== id) })),

  setStatus: async (id, status) => {
    await api.updateProperty(id, { status });
    set((s) => ({
      properties: s.properties.map((p) => (p.id === id ? { ...p, status } : p)),
    }));
  },

  assignAgent: async (id, agent) => {
    const updated = await api.updateProperty(id, {
      // FIXED: Used optional chaining (?.) so that a null agent resolves 
      // to 'undefined' rather than 'null' to satisfy strict TypeScript types.
      agentId: agent?.id,
      agentWallet: agent?.wallet ?? "",
    });
    set((s) => ({
      properties: s.properties.map((p) => (p.id === id ? updated : p)),
    }));
  },

  approveProperty: async (id) => {
    const updated = await api.approveProperty(id);
    set((s) => ({
      properties: s.properties.map((p) => (p.id === id ? updated : p)),
    }));
  },

  byOwner: (ownerId) => get().properties.filter((p) => p.ownerId === ownerId),
  byAgent: (agentId) => get().properties.filter((p) => p.agentId === agentId),
}));
