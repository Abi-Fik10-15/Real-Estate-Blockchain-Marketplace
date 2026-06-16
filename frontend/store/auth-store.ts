"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/services/api";
import { setStoredToken } from "@/lib/api";
import type { User, UserRole } from "@/types";

interface AuthState {
  user: User | null;
 login: (email: string, password: string) => User | null;
  loginAs: (role: UserRole) => void;
  register: (data: { name: string; email: string; role: UserRole; phone?: string }) => void;
  updateUser: (patch: Partial<Pick<User, "name" | "email" | "phone" | "avatar">>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
     login: (email: string, password: string) => {
  const found = MOCK_USERS.find(
    (u) =>
      u.email.toLowerCase() === email.toLowerCase() &&
      u.password === password
  );

  if (!found) return null;

  const { password: _password, ...safeUser } = found;

  set({ user: safeUser });

  return safeUser;
},
      loginAs: (role: UserRole) => {
        const found = MOCK_USERS.find((u) => u.role === role) ?? MOCK_USERS[0];
        set({ user: found });
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
