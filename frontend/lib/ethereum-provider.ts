import { BrowserProvider, ethers } from "ethers";

type EthereumProvider = ethers.Eip1193Provider & {
  providers?: EthereumProvider[];
  isMetaMask?: boolean;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export function getEthereumProvider(): EthereumProvider {
  if (typeof window === "undefined") {
    throw new Error("Wallet connection is only available in the browser.");
  }

  const { ethereum } = window;
  if (!ethereum) {
    throw new Error(
      "No Web3 wallet found. Install MetaMask (or another EVM wallet) to connect.",
    );
  }

  if (Array.isArray(ethereum.providers) && ethereum.providers.length > 0) {
    const metaMask = ethereum.providers.find((p) => p.isMetaMask);
    return metaMask ?? ethereum.providers[0]!;
  }

  return ethereum;
}

export function getEthereumProviderOptional(): EthereumProvider | null {
  try {
    return getEthereumProvider();
  } catch {
    return null;
  }
}

export function getBrowserProvider(provider?: EthereumProvider) {
  return new BrowserProvider(provider ?? getEthereumProvider());
}

export function parseWalletError(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message;
    if (/user rejected|denied|cancel/i.test(msg)) {
      return "Connection cancelled in your wallet.";
    }
    return msg;
  }

  const e = error as { code?: number; message?: string };
  if (e.code === 4001) {
    return "Connection cancelled in your wallet.";
  }
  if (e.code === 4902) {
    return "Sepolia network is not configured in your wallet.";
  }
  if (e.code === -32002) {
    return "A wallet request is already open. Check MetaMask.";
  }

  return e.message ?? "Failed to connect wallet.";
}
