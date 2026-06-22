export type UserRole = "owner" | "agent" | "buyer" | "admin";

export type PropertyType =
  | "Apartment"
  | "House"
  | "Villa"
  | "Condo"
  | "Townhouse"
  | "Land"
  | "Commercial";

export type ListingStatus = "active" | "pending" | "sold" | "rented" | "draft";

export type VerificationStatus = "verified" | "pending" | "unverified";

export interface Wallet {
  address: string;
  network: string;
  chainId: number;
  balance: string; // ETH/MATIC string
  status: "connected" | "disconnected" | "connecting";
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  walletAddress: string;
  avatar: string;
  status: "active" | "suspended";
  joinedAt: string;
  verified: boolean;
  kycStatus?: "pending" | "verified" | "rejected";
}

export type KycIdType = "passport" | "drivers_license" | "national_id";
export type KycSubmissionStatus = "submitted" | "approved" | "rejected";

export interface KycSubmission {
  id: string;
  userId: string;
  status: KycSubmissionStatus;
  legalName: string;
  dateOfBirth: string;
  address: string;
  idType: KycIdType;
  idDocumentUrl: string;
  selfieUrl: string;
  addressProofUrl: string;
  brokerLicenseUrl?: string;
  reviewNotes?: string;
  reviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  userName?: string;
  userEmail?: string;
  userRole?: UserRole;
  userKycStatus?: string;
}
export type AuthUser = User & {
  password: string;
};
export interface GeoLocation {
  lat: number;
  lng: number;
  address: string;
  city: string;
  country: string;
}

export interface VerificationEvent {
  id: string;
  type: "verification" | "transfer" | "agent_assigned" | "agent_removed";
  description: string;
  txHash: string;
  actor: string; // wallet address
  timestamp: string;
}

export interface Property {
  id: string;
  chainId: string; // on-chain property token id
  title: string;
  description: string;
  price: number;
  currency: string;
  listingType: "sale" | "rent";
  status: ListingStatus;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  area: number; // sq ft
  priceEth?: number;
  location: GeoLocation;
  images: string[];
  ownerId: string;
  ownerWallet: string;
  agentId?: string;
  agentWallet?: string;
  verification: {
    status: VerificationStatus;
    verifiedAt?: string;
    txHash?: string;
  };
  history: VerificationEvent[];
  featured: boolean;
  createdAt: string;
  views: number;
  saves: number;
}

export interface Inquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  buyerId: string;
  buyerName: string;
  type: "purchase" | "rental" | "question";
  message: string;
  status: "new" | "in_progress" | "closed";
  createdAt: string;
}

export interface OwnershipRecord {
  propertyId: string;
  propertyTitle: string;
  ownerWallet: string;
  agentWallet?: string;
  verificationStatus: VerificationStatus;
  transfers: VerificationEvent[];
}

export interface PropertyFilters {
  search: string;
  type: PropertyType | "all";
  minPrice: number;
  maxPrice: number;
  bedrooms: number; // 0 = any
  bathrooms: number; // 0 = any
  location: string;
  status: ListingStatus | "all";
  listingType: "all" | "sale" | "rent";
  sort: "newest" | "price_asc" | "price_desc" | "area_desc";
  agentId?: string;
  ownerId?: string;
}
