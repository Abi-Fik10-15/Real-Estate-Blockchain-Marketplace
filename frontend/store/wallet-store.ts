import { create } from "zustand";
import { persist } from "zustand/middleware";
import { contractClient } from "@/lib/contract";
import type { Wallet } from "@/types";

interface WalletState {
  wallet: Wallet | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      wallet: null,
      isConnecting: false,

      connect: async () => {
        set({ isConnecting: true });
        try {
          const wallet = await contractClient.connectWallet();
          set({ wallet, isConnecting: false });
        } catch (error) {
          set({ isConnecting: false });
          throw error;
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
      },
    }),
    { name: "chainestate-wallet" }
  )
);
