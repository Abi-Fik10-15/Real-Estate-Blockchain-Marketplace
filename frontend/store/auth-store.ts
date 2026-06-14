import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MOCK_USERS } from "@/services/mock-data";
import type { User, UserRole } from "@/types";

interface AuthState {
  user: User | null;
  login: (email: string) => User | null;
  loginAs: (role: UserRole) => void;
  register: (data: { name: string; email: string; role: UserRole; phone?: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (email: string) => {
        const found =
          MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? MOCK_USERS[0];
        set({ user: found });
        return found;
      },
      loginAs: (role: UserRole) => {
        const found = MOCK_USERS.find((u) => u.role === role) ?? MOCK_USERS[0];
        set({ user: found });
      },
      register: ({ name, email, role, phone }) => {
        const user: User = {
          id: `u-${Date.now()}`,
          name,
          email,
          phone,
          role,
          walletAddress: "0x0000000000000000000000000000000000000000",
          avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(email)}`,
          status: "active",
          joinedAt: new Date().toISOString(),
          verified: false,
        };
        set({ user });
      },
      logout: () => set({ user: null }),
    }),
    { name: "chainestate-auth" }
  )
);
