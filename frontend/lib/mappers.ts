import type {
  Inquiry,
  KycSubmission,
  ListingStatus,
  Property,
  User,
  VerificationStatus,
} from "@/types";

export interface ApiUser {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  role: User["role"];
  walletAddress: string;
  avatar: string;
  status: "active" | "suspended";
  kycStatus?: "pending" | "verified" | "rejected";
  createdAt?: string;
}

export interface ApiProperty {
  id?: string;
  _id?: string;
  ownerId: string;
  agentId?: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  status: ListingStatus;
  type: string;
  listingType: "sale" | "rent";
  location: Property["location"];
  bedrooms: number;
  bathrooms: number;
  area: number;
  priceEth?: number;
  blockchainTokenId?: string;
  ownerWallet?: string;
  agentWallet?: string;
  images: string[];
  documents?: string[];
  featured?: boolean;
  views?: number;
  saves?: number;
  createdAt?: string;
}

export interface ApiInquiry {
  id?: string;
  _id?: string;
  propertyId: string;
  propertyTitle: string;
  buyerId: string;
  buyerName: string;
  type: Inquiry["type"];
  message: string;
  status: Inquiry["status"];
  createdAt?: string;
}

export function mapUser(api: ApiUser): User {
  const id = String(api.id ?? api._id ?? "");
  return {
    id,
    name: api.name,
    email: api.email,
    phone: api.phone,
    role: api.role,
    walletAddress: api.walletAddress ?? "",
    avatar: api.avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(api.email)}`,
    status: api.status,
    joinedAt: api.createdAt ?? new Date().toISOString(),
    verified: api.kycStatus === "verified",
    kycStatus: api.kycStatus ?? "pending",
  };
}

function mapVerificationStatus(status: ListingStatus): VerificationStatus {
  if (status === "active" || status === "sold" || status === "rented") return "verified";
  if (status === "pending") return "pending";
  return "unverified";
}

export function mapProperty(api: ApiProperty): Property {
  const id = String(api.id ?? api._id ?? "");
  const chainId = api.blockchainTokenId || (id ? `EST-${id.slice(-6).toUpperCase()}` : "EST-000000");
  return {
    id,
    chainId,
    title: api.title,
    description: api.description,
    price: api.price,
    currency: api.currency,
    listingType: api.listingType,
    status: api.status,
    type: api.type as Property["type"],
    bedrooms: api.bedrooms,
    bathrooms: api.bathrooms,
    area: api.area,
    priceEth: api.priceEth ?? 0.01,
    location: api.location,
    images: api.images?.length
      ? api.images
      : ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"],
    ownerId: api.ownerId,
    ownerWallet: api.ownerWallet ?? "",
    agentId: api.agentId,
    agentWallet: api.agentWallet,
    verification: {
      status: mapVerificationStatus(api.status),
      verifiedAt: api.status === "active" ? api.createdAt : undefined,
    },
    history: [],
    featured: api.featured ?? false,
    createdAt: api.createdAt ?? new Date().toISOString(),
    views: api.views ?? 0,
    saves: api.saves ?? 0,
  };
}

export function mapInquiry(api: ApiInquiry): Inquiry {
  const id = String(api.id ?? api._id ?? "");
  return {
    id,
    propertyId: api.propertyId,
    propertyTitle: api.propertyTitle,
    buyerId: api.buyerId,
    buyerName: api.buyerName,
    type: api.type,
    message: api.message,
    status: api.status,
    createdAt: api.createdAt ?? new Date().toISOString(),
  };
}

export interface ApiKycSubmission {
  id?: string;
  _id?: string;
  userId: string;
  status: KycSubmission["status"];
  legalName: string;
  dateOfBirth: string;
  address: string;
  idType: KycSubmission["idType"];
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
  userRole?: User["role"];
  userKycStatus?: string;
}

export function mapKycSubmission(api: ApiKycSubmission): KycSubmission {
  return {
    id: String(api.id ?? api._id ?? ""),
    userId: api.userId,
    status: api.status,
    legalName: api.legalName,
    dateOfBirth: api.dateOfBirth,
    address: api.address,
    idType: api.idType,
    idDocumentUrl: api.idDocumentUrl,
    selfieUrl: api.selfieUrl,
    addressProofUrl: api.addressProofUrl,
    brokerLicenseUrl: api.brokerLicenseUrl,
    reviewNotes: api.reviewNotes,
    reviewedAt: api.reviewedAt,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
    userName: api.userName,
    userEmail: api.userEmail,
    userRole: api.userRole,
    userKycStatus: api.userKycStatus,
  };
}
