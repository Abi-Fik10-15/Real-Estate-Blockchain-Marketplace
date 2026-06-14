"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MOCK_USERS } from "@/services/mock-data";
import type { User } from "@/types";

interface UserState {
  users: User[];
  toggleStatus: (id: string) => void;
  setVerified: (id: string, verified: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      users: MOCK_USERS,
      toggleStatus: (id) =>
        set((s) => ({
          users: s.users.map((u) =>
            u.id === id
              ? { ...u, status: u.status === "active" ? "suspended" : "active" }
              : u
          ),
        })),
      setVerified: (id, verified) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === id ? { ...u, verified } : u)),
        })),
    }),
    { name: "chainestate-users" }
  )
);
