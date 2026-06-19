import { create } from "zustand";
import { persist } from "zustand/middleware";
import { contractClient } from "@/lib/contract";
import { getEthereumProviderOptional } from "@/lib/ethereum-provider";
import type { Wallet } from "@/types";

interface WalletState {
  wallet: Wallet | null;
  isConnecting: boolean;
  hasHydrated: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refresh: () => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
  setHasHydrated: (value: boolean) => void;
  bindListeners: () => void;
}

async function syncWalletToProfile(address: string) {
  try {
    const { useAuthStore } = await import("@/store/auth-store");
    const { user, token, updateUser } = useAuthStore.getState();
    if (!token || !user) return;
    if (user.walletAddress?.toLowerCase() !== address.toLowerCase()) {
      await updateUser({ walletAddress: address });
    }
  } catch {
    // profile sync is best-effort — do not block wallet connect
  }
}

let listenersBound = false;

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      wallet: null,
      isConnecting: false,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      bindListeners: () => {
        if (listenersBound || typeof window === "undefined") return;
        const ethereum = getEthereumProviderOptional();
        if (!ethereum?.on) return;

        listenersBound = true;

        ethereum.on("accountsChanged", () => {
          void get().refresh();
        });

        ethereum.on("chainChanged", () => {
          void get().refresh();
        });
      },

      connect: async () => {
        set({ isConnecting: true });
        try {
          const wallet = await contractClient.connectWallet();
          set({ wallet, isConnecting: false });
          await syncWalletToProfile(wallet.address);
        } catch (error) {
          set({ isConnecting: false });
          throw error;
        }
      },

      refresh: async () => {
        const wallet = await contractClient.refreshWallet();
        set({ wallet });
        if (wallet) {
          await syncWalletToProfile(wallet.address);
        }
      },

      disconnect: async () => {
        await contractClient.disconnectWallet();
        set({ wallet: null });
      },

      switchNetwork: async (chainId: number) => {
        const current = get().wallet;
        if (!current) return;
        const next = await contractClient.switchNetwork(chainId);
        set({ wallet: { ...current, ...next } });
        await get().refresh();
      },
    }),
    {
      name: "chainestate-wallet",
      partialize: (state) => ({ wallet: state.wallet }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        queueMicrotask(() => {
          void useWalletStore.getState().refresh();
          useWalletStore.getState().bindListeners();
        });
      },
    },
  ),
);
