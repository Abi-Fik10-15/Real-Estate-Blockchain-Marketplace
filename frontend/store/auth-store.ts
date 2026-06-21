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
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  login: (email: string, password: string) => Promise<User>;
  loginAs: (role: UserRole) => Promise<User | null>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
  }) => Promise<{ message: string }>;
  loginAfterVerify: (accessToken: string, user: User) => void;
  updateUser: (patch: Partial<Pick<User, "name" | "email" | "phone" | "avatar" | "walletAddress">>) => Promise<void>;
  setUser: (user: User) => void;
  hydrateProfile: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isHydrating: false,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      login: async (email: string, password: string) => {
        const { accessToken, user } = await api.login(email, password);
        setStoredToken(accessToken);
        set({ user, token: accessToken });
        return user;
      },

      loginAs: async (role: UserRole) => {
        let email = "";
        if (role === "admin") email = "admin@chainestate.io";
        else if (role === "owner") email = "sophia@chainestate.io";
        else if (role === "buyer") email = "elena@chainestate.io";
        else if (role === "agent") email = "marcus@chainestate.io";

        if (email) {
          return get().login(email, "DemoPassword123!");
        }
        return null;
      },

      register: async ({ name, email, password, role, phone }) => {
        const result = await api.register({ name, email, password, role, phone });
        // Do NOT set user/token here — account is not active until email is verified.
        return result;
      },

      loginAfterVerify: (accessToken: string, user: User) => {
        setStoredToken(accessToken);
        set({ user, token: accessToken });
      },

      hydrateProfile: async () => {
        const { token } = get();
        if (!token) return;
        set({ isHydrating: true });
        try {
          setStoredToken(token);
          const user = await api.getProfile();
          set({ user, isHydrating: false });
        } catch (error) {
          const isUnauthorized =
            typeof error === "object" &&
            error !== null &&
            "response" in error &&
            (error as { response?: { status?: number } }).response?.status === 401;

          if (isUnauthorized) {
            setStoredToken(null);
            set({ user: null, token: null, isHydrating: false });
          } else {
            set({ isHydrating: false });
          }
        }
      },

      updateUser: async (patch) => {
        const user = await api.updateProfile(patch);
        set({ user });
      },

      setUser: (user: User) => {
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
        state?.setHasHydrated(true);
        if (state?.token) {
          setStoredToken(state.token);
          void state.hydrateProfile();
        }
      },
    }
  )
);
   
