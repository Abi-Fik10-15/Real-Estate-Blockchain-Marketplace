"use client";

import { create } from "zustand";
import { api } from "@/services/api";
import type { Inquiry } from "@/types";

interface InquiryState {
  inquiries: Inquiry[];
  isLoading: boolean;
  fetchInquiries: () => Promise<void>;
  fetchMine: () => Promise<void>;
  setStatus: (id: string, status: Inquiry["status"]) => Promise<void>;
  add: (inquiry: {
    propertyId: string;
    type: Inquiry["type"];
    message: string;
  }) => Promise<Inquiry>;
  setInquiries: (inquiries: Inquiry[]) => void;
}

export const useInquiryStore = create<InquiryState>()((set, get) => ({
  inquiries: [],
  isLoading: false,

  setInquiries: (inquiries) => set({ inquiries }),

  fetchInquiries: async () => {
    set({ isLoading: true });
    try {
      const inquiries = await api.getInquiries();
      set({ inquiries, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchMine: async () => {
    set({ isLoading: true });
    try {
      const inquiries = await api.getMyInquiries();
      set((s) => {
        const others = s.inquiries.filter(
          (i) => !inquiries.some((n) => n.id === i.id)
        );
        return { inquiries: [...inquiries, ...others], isLoading: false };
      });
    } catch {
      set({ isLoading: false });
    }
  },

  setStatus: async (id, status) => {
    const updated = await api.updateInquiry(id, status);
    set((s) => ({
      inquiries: s.inquiries.map((i) => (i.id === id ? updated : i)),
    }));
  },

  add: async (inquiry) => {
    const created = await api.createInquiry(inquiry);
    set((s) => ({ inquiries: [created, ...s.inquiries] }));
    return created;
  },
}));
