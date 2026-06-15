"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MOCK_PROPERTIES } from "@/services/mock-data";
import type { CreatePropertyValues } from "@/lib/validations";
import type { ListingStatus, Property } from "@/types";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
];

interface PropertyState {
  properties: Property[];
  createProperty: (
    values: CreatePropertyValues,
    owner: { id: string; wallet: string }
  ) => Property;
  updateProperty: (id: string, patch: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  setStatus: (id: string, status: ListingStatus) => void;
  assignAgent: (id: string, agent: { id: string; wallet: string } | null) => void;
  byOwner: (ownerId: string) => Property[];
  byAgent: (agentId: string) => Property[];
  reset: () => void;
}

export const usePropertyStore = create<PropertyState>()(
  persist(
    (set, get) => ({
      properties: MOCK_PROPERTIES,

      createProperty: (values, owner) => {
        const property: Property = {
          id: `prop-${Date.now()}`,
          chainId: `EST-${Math.floor(2000 + Math.random() * 7000)}`,
          title: values.title,
          description: values.description,
          price: values.price,
          currency: "USD",
          listingType: "sale",
          status: "active",
          type: values.type,
          bedrooms: values.bedrooms,
          bathrooms: values.bathrooms,
          area: values.area,
          location: {
            lat: 0,
            lng: 0,
            city: values.location,
            country: "",
            address: values.location,
          },
          images: FALLBACK_IMAGES,
          ownerId: owner.id,
          ownerWallet: owner.wallet,
          verification: { status: "pending" },
          history: [],
          featured: false,
          createdAt: new Date().toISOString(),
          views: 0,
          saves: 0,
        };
        set((s) => ({ properties: [property, ...s.properties] }));
        return property;
      },

      updateProperty: (id, patch) =>
        set((s) => ({
          properties: s.properties.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),

      deleteProperty: (id) =>
        set((s) => ({ properties: s.properties.filter((p) => p.id !== id) })),

      setStatus: (id, status) =>
        set((s) => ({
          properties: s.properties.map((p) => (p.id === id ? { ...p, status } : p)),
        })),

      assignAgent: (id, agent) =>
        set((s) => ({
          properties: s.properties.map((p) =>
            p.id === id
              ? { ...p, agentId: agent?.id, agentWallet: agent?.wallet }
              : p
          ),
        })),

      byOwner: (ownerId) => get().properties.filter((p) => p.ownerId === ownerId),
      byAgent: (agentId) => get().properties.filter((p) => p.agentId === agentId),

      reset: () => set({ properties: MOCK_PROPERTIES }),
    }),
    { name: "chainestate-properties" }
  )
);
