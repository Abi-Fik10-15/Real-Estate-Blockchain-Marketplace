"use client";

import { create } from "zustand";
import { api } from "@/services/api";
import type { User } from "@/types";

interface UserState {
  users: User[];
  isLoading: boolean;
  fetchUsers: () => Promise<void>;
  toggleStatus: (id: string) => Promise<void>;
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

  toggleStatus: async (id) => {
    const current = get().users.find((u) => u.id === id);
    if (!current) return;
    const newStatus = current.status === "active" ? "suspended" : "active";
    // Optimistic update
    set((s) => ({
      users: s.users.map((u) => (u.id === id ? { ...u, status: newStatus } : u)),
    }));
    try {
      const updated = await api.setUserStatus(id, newStatus);
      // Confirm with server response
      set((s) => ({
        users: s.users.map((u) => (u.id === id ? updated : u)),
      }));
    } catch {
      // Revert on failure
      set((s) => ({
        users: s.users.map((u) => (u.id === id ? current : u)),
      }));
      throw new Error("Failed to update user status");
    }
  },

  setVerified: (id, verified) =>
    set((s) => ({
      users: s.users.map((u) => (u.id === id ? { ...u, verified } : u)),
    })),
}));
