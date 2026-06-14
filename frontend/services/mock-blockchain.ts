import { ethers } from "ethers";
import { sleep } from "@/lib/utils";
import type { Wallet, VerificationEvent } from "@/types";

/**
 * Mock blockchain service.
 *
 * Simulates wallet connection, network info, ownership verification and
 * ownership transfers WITHOUT touching a real chain. Ethers.js is used only
 * to generate realistic addresses / tx hashes so the demo feels authentic.
 */

const NETWORKS: Record<number, string> = {
  137: "Polygon Mainnet",
  80002: "Polygon Amoy",
  1: "Ethereum Mainnet",
  11155111: "Ethereum Sepolia",
};

const DEFAULT_CHAIN_ID = 80002;

function randomTxHash() {
  return ethers.hexlify(ethers.randomBytes(32));
}

function randomAddress() {
  return ethers.getAddress(ethers.hexlify(ethers.randomBytes(20)));
}

export const mockBlockchain = {
  async connectWallet(): Promise<Wallet> {
    await sleep(900);
    // Deterministic-ish demo wallet so the same session feels stable.
    const address = ethers.getAddress(
      "0x" + ethers.keccak256(ethers.toUtf8Bytes("chainestate-demo-wallet")).slice(26)
    );
    return {
      address,
      network: NETWORKS[DEFAULT_CHAIN_ID],
      chainId: DEFAULT_CHAIN_ID,
      balance: (Math.random() * 12 + 1).toFixed(4),
      status: "connected",
    };
  },

  async disconnectWallet(): Promise<void> {
    await sleep(300);
  },

  async switchNetwork(chainId: number): Promise<Pick<Wallet, "chainId" | "network">> {
    await sleep(600);
    return { chainId, network: NETWORKS[chainId] ?? "Unknown Network" };
  },

  /** Simulate an on-chain ownership verification call. */
  async verifyOwnership(propertyChainId: string): Promise<VerificationEvent> {
    await sleep(1400);
    return {
      id: `ev-${Date.now()}`,
      type: "verification",
      description: `Ownership re-verified for ${propertyChainId} against the title registry oracle`,
      txHash: randomTxHash(),
      actor: randomAddress(),
      timestamp: new Date().toISOString(),
    };
  },

  /** Simulate authorizing an agent on-chain. */
  async authorizeAgent(agentWallet: string): Promise<VerificationEvent> {
    await sleep(1200);
    return {
      id: `ev-${Date.now()}`,
      type: "agent_assigned",
      description: `Agent ${agentWallet} authorized to manage this property`,
      txHash: randomTxHash(),
      actor: agentWallet,
      timestamp: new Date().toISOString(),
    };
  },

  /** Simulate revoking an agent on-chain. */
  async revokeAgent(agentWallet: string): Promise<VerificationEvent> {
    await sleep(1000);
    return {
      id: `ev-${Date.now()}`,
      type: "agent_removed",
      description: `Authorization revoked for agent ${agentWallet}`,
      txHash: randomTxHash(),
      actor: agentWallet,
      timestamp: new Date().toISOString(),
    };
  },

  /** Simulate an ownership transfer transaction. */
  async transferOwnership(
    from: string,
    to: string,
    propertyChainId: string
  ): Promise<VerificationEvent> {
    await sleep(1800);
    if (!ethers.isAddress(to)) {
      throw new Error("Invalid destination wallet address");
    }
    return {
      id: `ev-${Date.now()}`,
      type: "transfer",
      description: `Ownership of ${propertyChainId} transferred from ${from} to ${to}`,
      txHash: randomTxHash(),
      actor: to,
      timestamp: new Date().toISOString(),
    };
  },

  isValidAddress(address: string) {
    return ethers.isAddress(address);
  },

  networkName(chainId: number) {
    return NETWORKS[chainId] ?? "Unknown Network";
  },
};
