"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/services/api";
import { setStoredToken } from "@/lib/api";
import type { User, UserRole } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isHydrating: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  loginAs: (role: UserRole) => Promise<User | null>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
  }) => Promise<User>;
  updateUser: (patch: Partial<Pick<User, "name" | "email" | "phone" | "avatar" | "walletAddress">>) => Promise<void>;
  hydrateProfile: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isHydrating: false,

      login: async (email: string, password: string) => {
        try {
          const { accessToken, user } = await api.login(email, password);
          setStoredToken(accessToken);
          set({ user, token: accessToken });
          return user;
        } catch {
          return null;
        }
      },

      loginAs: async (_role: UserRole) => {
        return null;
      },

      register: async ({ name, email, password, role, phone }) => {
        const { accessToken, user } = await api.register({
          name,
          email,
          password,
          role,
          phone,
        });
        setStoredToken(accessToken);
        set({ user, token: accessToken });
        return user;
      },

      hydrateProfile: async () => {
        const { token } = get();
        if (!token) return;
        set({ isHydrating: true });
        try {
          setStoredToken(token);
          const user = await api.getProfile();
          set({ user, isHydrating: false });
        } catch {
          setStoredToken(null);
          set({ user: null, token: null, isHydrating: false });
        }
      },

      updateUser: async (patch) => {
        const user = await api.updateProfile(patch);
        set({ user });
      },

      logout: () => {
        setStoredToken(null);
        set({ user: null, token: null });
      },
    }),
    {
      name: "chainestate-auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setStoredToken(state.token);
          void state.hydrateProfile();
        }
      },
    }
  )
);
