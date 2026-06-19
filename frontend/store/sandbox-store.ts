"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SandboxTransaction {
  hash: string;
  blockNumber: number;
  from: string;
  to: string;
  value: string;
  type: string;
  timestamp: string;
  status: "success" | "pending" | "failed";
}

export interface SandboxBlock {
  number: number;
  hash: string;
  parentHash: string;
  timestamp: string;
  transactions: string[]; // transaction hashes
  miner: string;
  gasUsed: string;
}

interface SandboxState {
  blocks: SandboxBlock[];
  customTransactions: SandboxTransaction[];
  gasPrice: number; // in Gwei
  faucetBalance: string; // in ETH
  addCustomTransaction: (tx: Omit<SandboxTransaction, "blockNumber" | "timestamp" | "status">) => void;
  mineBlock: () => void;
  setGasPrice: (price: number) => void;
  refillFaucet: () => void;
  resetSandbox: () => void;
}

const INITIAL_BLOCKS: SandboxBlock[] = [
  {
    number: 194582190,
    hash: "0x8fa3f80c6c9a92a188f6158e0a2b4c6d8e0f112233445566778899aabbccdde0",
    parentHash: "0x3da82b0c34ef9a12c8b0c2d4e6f8a0a2b4c6d8e0f112233445566778899aabb",
    timestamp: new Date(Date.now() - 30000).toISOString(),
    transactions: ["0x7a892b0c34ef9a12c8b0c2d4e6f8a0a2b4c6d8e0f1122334455"],
    miner: "0xDeedRegistryOracleMiner",
    gasUsed: "125,431",
  },
  {
    number: 194582191,
    hash: "0x9ab3e80c6c9a92a188f6158e0a2b4c6d8e0f112233445566778899aabbccdde1",
    parentHash: "0x8fa3f80c6c9a92a188f6158e0a2b4c6d8e0f112233445566778899aabbccdde0",
    timestamp: new Date(Date.now() - 15000).toISOString(),
    transactions: [],
    miner: "0xDeedRegistryOracleMiner",
    gasUsed: "0",
  }
];

export const useSandboxStore = create<SandboxState>()(
  persist(
    (set, get) => ({
      blocks: INITIAL_BLOCKS,
      customTransactions: [],
      gasPrice: 25,
      faucetBalance: "100.00",

      addCustomTransaction: (tx) => {
        const nextBlockNum = get().blocks[0]?.number ? get().blocks[0].number + 1 : 194582192;
        const newTx: SandboxTransaction = {
          ...tx,
          blockNumber: nextBlockNum,
          timestamp: new Date().toISOString(),
          status: "success",
        };
        set((s) => ({
          customTransactions: [newTx, ...s.customTransactions],
        }));

        // Mine a block automatically when a transaction occurs to simulate instant execution
        get().mineBlock();
      },

      mineBlock: () => {
        const currentBlocks = get().blocks;
        const latestBlock = currentBlocks[0];
        const nextNumber = latestBlock ? latestBlock.number + 1 : 194582190;
        
        // Find pending/recent transactions that aren't in any block
        const allTxHashes = currentBlocks.flatMap((b) => b.transactions);
        const newTxs = get().customTransactions.filter((tx) => !allTxHashes.includes(tx.hash));
        const newTxHashes = newTxs.map((tx) => tx.hash);

        const parentHash = latestBlock ? latestBlock.hash : "0x0000000000000000000000000000000000000000000000000000000000000000";
        const hash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        
        const newBlock: SandboxBlock = {
          number: nextNumber,
          hash,
          parentHash,
          timestamp: new Date().toISOString(),
          transactions: newTxHashes,
          miner: "0xDeedRegistryOracleMiner",
          gasUsed: newTxs.length > 0 ? (newTxs.length * 85000 + Math.floor(Math.random() * 15000)).toLocaleString() : "0",
        };

        set((s) => ({
          blocks: [newBlock, ...s.blocks].slice(0, 15), // Keep last 15 blocks
        }));
      },

      setGasPrice: (gasPrice) => set({ gasPrice }),
      
      refillFaucet: () => set({ faucetBalance: "100.00" }),

      resetSandbox: () => set({
        blocks: INITIAL_BLOCKS,
        customTransactions: [],
        gasPrice: 25,
        faucetBalance: "100.00"
      }),
    }),
    { name: "chainestate-sandbox" }
  )
);
