"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MOCK_INQUIRIES } from "@/services/mock-data";
import type { Inquiry } from "@/types";

interface InquiryState {
  inquiries: Inquiry[];
  setStatus: (id: string, status: Inquiry["status"]) => void;
  add: (inquiry: Omit<Inquiry, "id" | "createdAt" | "status">) => void;
}

export const useInquiryStore = create<InquiryState>()(
  persist(
    (set) => ({
      inquiries: MOCK_INQUIRIES,
      setStatus: (id, status) =>
        set((s) => ({
          inquiries: s.inquiries.map((i) => (i.id === id ? { ...i, status } : i)),
        })),
      add: (inquiry) =>
        set((s) => ({
          inquiries: [
            {
              ...inquiry,
              id: `inq-${Date.now()}`,
              status: "new",
              createdAt: new Date().toISOString(),
            },
            ...s.inquiries,
          ],
        })),
    }),
    { name: "chainestate-inquiries" }
  )
);
