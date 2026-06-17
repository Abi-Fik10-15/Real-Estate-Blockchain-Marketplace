import { SEPOLIA_EXPLORER_URL, DEFAULT_ESCROW_ETH } from "@/lib/constants";
import type { Property } from "@/types";

/** Sepolia ETH amount used for on-chain escrow (property.priceEth or default). */
export function escrowEthAmount(property: Pick<Property, "priceEth" | "price">): string {
  const eth = property.priceEth ?? DEFAULT_ESCROW_ETH;
  return eth.toFixed(4).replace(/\.?0+$/, "") || String(DEFAULT_ESCROW_ETH);
}

export function isOnChainTokenId(tokenId: string): boolean {
  return /^\d+$/.test(tokenId);
}

export function etherscanTxUrl(txHash: string): string {
  if (!txHash || txHash.startsWith("local-") || txHash === "verified") {
    return "";
  }
  return `${SEPOLIA_EXPLORER_URL}/tx/${txHash}`;
}

export function etherscanAddressUrl(address: string): string {
  if (!address || !address.startsWith("0x")) return "";
  return `${SEPOLIA_EXPLORER_URL}/address/${address}`;
}

export function etherscanTokenUrl(contractAddress: string, tokenId: string): string {
  if (!contractAddress || !isOnChainTokenId(tokenId)) return "";
  return `${SEPOLIA_EXPLORER_URL}/token/${contractAddress}?a=${tokenId}`;
}
