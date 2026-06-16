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
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
  }) => Promise<User>;
  hydrateProfile: () => Promise<void>;
  updateUser: (patch: Partial<Pick<User, "name" | "email" | "phone" | "avatar">>) => Promise<void>;
  setSession: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isHydrating: false,

      setSession: (token, user) => {
        setStoredToken(token);
        set({ token, user });
      },

      login: async (email, password) => {
        const { accessToken, user } = await api.login(email, password);
        get().setSession(accessToken, user);
        return user;
      },

      register: async ({ name, email, password, role, phone }) => {
        const { accessToken, user } = await api.register({
          name,
          email,
          password,
          role,
          phone,
        });
        get().setSession(accessToken, user);
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
          get().logout();
          set({ isHydrating: false });
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
