import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mockBlockchain } from "@/services/mock-blockchain";
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
          const wallet = await mockBlockchain.connectWallet();
          set({ wallet, isConnecting: false });
        } catch {
          set({ isConnecting: false });
        }
      },
      disconnect: async () => {
        await mockBlockchain.disconnectWallet();
        set({ wallet: null });
      },
      switchNetwork: async (chainId: number) => {
        const current = get().wallet;
        if (!current) return;
        const next = await mockBlockchain.switchNetwork(chainId);
        set({ wallet: { ...current, ...next } });
      },
    }),
    { name: "chainestate-wallet" }
  )
);
