export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ??
  API_URL.replace("/api", "").replace(/^http/, "ws");

export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "";

export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN_HEX = "0xaa36a7";
export const SEPOLIA_EXPLORER_URL = "https://sepolia.etherscan.io";

/** Default Sepolia test escrow when priceEth is not set on a listing. */
export const DEFAULT_ESCROW_ETH = 0.01;

export const TOKEN_STORAGE_KEY = "chainestate-token";
