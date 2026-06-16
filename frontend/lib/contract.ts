import { BrowserProvider, Contract, ethers } from "ethers";
import {
  CONTRACT_ADDRESS,
  SEPOLIA_CHAIN_HEX,
  SEPOLIA_CHAIN_ID,
} from "@/lib/constants";
import RealEstateMarketplaceAbi from "@/lib/abi/real-estate-marketplace.abi.json";
import type { Wallet } from "@/types";

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}

const NETWORKS: Record<number, string> = {
  1: "Ethereum Mainnet",
  11155111: "Ethereum Sepolia",
  137: "Polygon Mainnet",
  80002: "Polygon Amoy",
};

function requireEthereum() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed. Please install MetaMask to connect your wallet.");
  }
  return window.ethereum;
}

async function getProvider() {
  return new BrowserProvider(requireEthereum());
}

async function getSigner() {
  const provider = await getProvider();
  return provider.getSigner();
}

async function getConnectedWallet(provider: BrowserProvider): Promise<Wallet> {
  const network = await provider.getNetwork();
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const balance = await provider.getBalance(address);
  const chainId = Number(network.chainId);

  return {
    address,
    network: NETWORKS[chainId] ?? `Chain ${chainId}`,
    chainId,
    balance: ethers.formatEther(balance),
    status: "connected",
  };
}

export const contractClient = {
  isValidAddress(address: string) {
    return ethers.isAddress(address);
  },

  networkName(chainId: number) {
    return NETWORKS[chainId] ?? "Unknown Network";
  },

  async connectWallet(): Promise<Wallet> {
    const ethereum = requireEthereum();
    await ethereum.request({ method: "eth_requestAccounts" });
    const provider = await getProvider();
    await this.ensureSepolia(provider);
    return getConnectedWallet(provider);
  },

  async disconnectWallet(): Promise<void> {
    // MetaMask has no programmatic disconnect; clear local state in the store.
  },

  async switchNetwork(chainId: number): Promise<Pick<Wallet, "chainId" | "network">> {
    const ethereum = requireEthereum();
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
    return { chainId, network: NETWORKS[chainId] ?? "Unknown Network" };
  },

  async ensureSepolia(provider?: BrowserProvider) {
    const p = provider ?? (await getProvider());
    const network = await p.getNetwork();
    if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
      try {
        await requireEthereum().request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: SEPOLIA_CHAIN_HEX }],
        });
      } catch (err: unknown) {
        const error = err as { code?: number };
        if (error.code === 4902) {
          await requireEthereum().request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: SEPOLIA_CHAIN_HEX,
                chainName: "Sepolia",
                nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
                rpcUrls: ["https://rpc.sepolia.org"],
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });
        } else {
          throw new Error("Please switch to Sepolia testnet in MetaMask.");
        }
      }
    }
  },

  async getContract(signer?: ethers.Signer) {
    if (!CONTRACT_ADDRESS) {
      throw new Error("Smart contract address is not configured (NEXT_PUBLIC_CONTRACT_ADDRESS).");
    }
    const s = signer ?? (await getSigner());
    return new Contract(CONTRACT_ADDRESS, RealEstateMarketplaceAbi, s);
  },

  async verifyOwnership(tokenId: string, walletAddress: string): Promise<boolean> {
    if (!CONTRACT_ADDRESS || !tokenId || !/^\d+$/.test(tokenId)) {
      return false;
    }
    try {
      const contract = await this.getContract();
      const owner = await contract.ownerOf(tokenId);
      return owner.toLowerCase() === walletAddress.toLowerCase();
    } catch {
      return false;
    }
  },

  async initiateEscrow(tokenId: string, priceEth: string) {
    await this.ensureSepolia();
    const contract = await this.getContract();
    const tx = await contract.initiateEscrow(tokenId, {
      value: ethers.parseEther(priceEth),
    });
    const receipt = await tx.wait();
    return { txHash: receipt.hash as string };
  },

  async confirmSale(tokenId: string) {
    await this.ensureSepolia();
    const contract = await this.getContract();
    const tx = await contract.confirmSale(tokenId);
    const receipt = await tx.wait();
    return { txHash: receipt.hash as string };
  },

  async transferOwnership(tokenId: string, newOwner: string) {
    if (!ethers.isAddress(newOwner)) {
      throw new Error("Invalid destination wallet address");
    }
    await this.ensureSepolia();
    const contract = await this.getContract();
    const tx = await contract.transferOwnership(tokenId, newOwner);
    const receipt = await tx.wait();
    return {
      txHash: receipt.hash as string,
      timestamp: new Date().toISOString(),
    };
  },
};
