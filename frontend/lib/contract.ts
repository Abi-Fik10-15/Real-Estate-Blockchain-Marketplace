import { BrowserProvider, Contract, ethers } from "ethers";
import {
  CONTRACT_ADDRESS,
  SEPOLIA_CHAIN_HEX,
  SEPOLIA_CHAIN_ID,
} from "@/lib/constants";
import {
  getBrowserProvider,
  getEthereumProvider,
  getEthereumProviderOptional,
  parseWalletError,
} from "@/lib/ethereum-provider";
import RealEstateMarketplaceAbi from "@/lib/abi/real-estate-marketplace.abi.json";
import type { Wallet } from "@/types";

const NETWORKS: Record<number, string> = {
  1: "Ethereum Mainnet",
  11155111: "Ethereum Sepolia",
  137: "Polygon Mainnet",
  80002: "Polygon Amoy",
};

async function getProvider() {
  return getBrowserProvider();
}

async function getSigner() {
  const provider = await getProvider();
  return provider.getSigner();
}

export async function getConnectedWallet(
  provider?: BrowserProvider,
): Promise<Wallet> {
  const p = provider ?? (await getProvider());
  const network = await p.getNetwork();
  const signer = await p.getSigner();
  const address = await signer.getAddress();
  const balance = await p.getBalance(address);
  const chainId = Number(network.chainId);

  return {
    address,
    network: NETWORKS[chainId] ?? `Chain ${chainId}`,
    chainId,
    balance: ethers.formatEther(balance),
    status: "connected",
  };
}

export async function ensureSepolia(provider?: BrowserProvider): Promise<BrowserProvider> {
  const ethereum = getEthereumProvider();
  let p = provider ?? (await getProvider());
  const chainId = Number((await p.getNetwork()).chainId);

  if (chainId === SEPOLIA_CHAIN_ID) {
    return p;
  }

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_HEX }],
    });
  } catch (err: unknown) {
    const error = err as { code?: number };
    if (error.code === 4001) {
      throw new Error("Please approve switching to Sepolia testnet in MetaMask.");
    }
    if (error.code === 4902) {
      await ethereum.request({
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
      throw new Error(parseWalletError(err));
    }
  }

  p = await getProvider();
  const afterSwitch = Number((await p.getNetwork()).chainId);
  if (afterSwitch !== SEPOLIA_CHAIN_ID) {
    throw new Error("Please switch to Sepolia testnet in MetaMask to use ChainEstate.");
  }

  return p;
}

export const contractClient = {
  isValidAddress(address: string) {
    return ethers.isAddress(address);
  },

  networkName(chainId: number) {
    return NETWORKS[chainId] ?? "Unknown Network";
  },

  async connectWallet(): Promise<Wallet> {
    try {
      const ethereum = getEthereumProvider();
      await ethereum.request({ method: "eth_requestAccounts" });
      let provider = await getProvider();
      provider = await ensureSepolia(provider);
      return getConnectedWallet(provider);
    } catch (error) {
      throw new Error(parseWalletError(error));
    }
  },

  async refreshWallet(): Promise<Wallet | null> {
    try {
      const ethereum = getEthereumProviderOptional();
      if (!ethereum) return null;

      const accounts = (await ethereum.request({
        method: "eth_accounts",
      })) as string[];

      if (!accounts?.length) return null;

      let provider = await getProvider();
      provider = await ensureSepolia(provider);
      return getConnectedWallet(provider);
    } catch {
      return null;
    }
  },

  async disconnectWallet(): Promise<void> {
    // MetaMask has no programmatic disconnect; clear local state in the store.
  },

  async switchNetwork(chainId: number): Promise<Pick<Wallet, "chainId" | "network">> {
    if (chainId !== SEPOLIA_CHAIN_ID) {
      throw new Error("ChainEstate only supports Sepolia testnet for on-chain actions.");
    }
    const ethereum = getEthereumProvider();
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_HEX }],
    });
    return { chainId, network: NETWORKS[chainId] ?? "Unknown Network" };
  },

  async ensureSepolia(provider?: BrowserProvider) {
    return ensureSepolia(provider);
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
    await ensureSepolia();
    const contract = await this.getContract();
    const tx = await contract.initiateEscrow(tokenId, {
      value: ethers.parseEther(priceEth),
    });
    const receipt = await tx.wait();
    return { txHash: receipt.hash as string };
  },

  async confirmSale(tokenId: string) {
    await ensureSepolia();
    const contract = await this.getContract();
    const tx = await contract.confirmSale(tokenId);
    const receipt = await tx.wait();
    return { txHash: receipt.hash as string };
  },

  async cancelEscrow(tokenId: string) {
    await ensureSepolia();
    const contract = await this.getContract();
    const tx = await contract.cancelEscrow(tokenId);
    const receipt = await tx.wait();
    return { txHash: receipt.hash as string };
  },

  async createRental(
    tokenId: string,
    startDate: number,
    endDate: number,
    monthlyRentWei: bigint,
  ) {
    await ensureSepolia();
    const contract = await this.getContract();
    const tx = await contract.createRental(tokenId, startDate, endDate, monthlyRentWei);
    const receipt = await tx.wait();
    return { txHash: receipt.hash as string };
  },

  async getOnChainProperty(tokenId: string) {
    if (!CONTRACT_ADDRESS || !/^\d+$/.test(tokenId)) return null;
    try {
      const contract = await this.getContract();
      const [owner, tokenURI, inEscrow, escrowBuyer, escrowAmount] =
        await contract.getProperty(tokenId);
      return {
        owner: owner as string,
        tokenURI: tokenURI as string,
        inEscrow: inEscrow as boolean,
        escrowBuyer: escrowBuyer as string,
        escrowAmount: ethers.formatEther(escrowAmount),
      };
    } catch {
      return null;
    }
  },

  async transferOwnership(tokenId: string, newOwner: string) {
    if (!ethers.isAddress(newOwner)) {
      throw new Error("Invalid destination wallet address");
    }
    await ensureSepolia();
    const contract = await this.getContract();
    const tx = await contract.transferPropertyOwnership(tokenId, newOwner);
    const receipt = await tx.wait();
    return {
      txHash: receipt.hash as string,
      timestamp: new Date().toISOString(),
    };
  },
};
