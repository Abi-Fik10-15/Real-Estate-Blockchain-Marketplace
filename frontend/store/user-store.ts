"use client";

import { create } from "zustand";
import { api } from "@/services/api";
import type { User } from "@/types";

interface UserState {
  users: User[];
  isLoading: boolean;
  fetchUsers: () => Promise<void>;
  toggleStatus: (id: string) => void;
  setVerified: (id: string, verified: boolean) => void;
}

export const useUserStore = create<UserState>()((set, get) => ({
  users: [],
  isLoading: false,

  fetchUsers: async () => {
    set({ isLoading: true });
    try {
      const users = await api.getUsers();
      set({ users, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

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
}));
