import { apiClient } from "@/lib/api";
import {
  mapInquiry,
  mapProperty,
  mapUser,
  type ApiInquiry,
  type ApiProperty,
  type ApiUser,
} from "@/lib/mappers";
import type { CreatePropertyValues } from "@/lib/validations";
import type { Inquiry, Property, PropertyFilters, User, UserRole } from "@/types";

function toQuery(filters?: Partial<PropertyFilters>) {
  if (!filters) return {};
  const q: Record<string, string | number> = {};
  if (filters.search) q.search = filters.search;
  if (filters.type && filters.type !== "all") q.type = filters.type;
  if (filters.minPrice) q.minPrice = filters.minPrice;
  if (filters.maxPrice) q.maxPrice = filters.maxPrice;
  if (filters.bedrooms) q.bedrooms = filters.bedrooms;
  if (filters.bathrooms) q.bathrooms = filters.bathrooms;
  if (filters.location) q.location = filters.location;
  if (filters.status && filters.status !== "all") q.status = filters.status;
  if (filters.listingType && filters.listingType !== "all") q.listingType = filters.listingType;
  if (filters.sort) q.sort = filters.sort;
  return q;
}

export const api = {
  async register(data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
    walletAddress?: string;
  }) {
    const { data: res } = await apiClient.post<{ accessToken: string; user: ApiUser }>(
      "/auth/register",
      data
    );
    return { accessToken: res.accessToken, user: mapUser(res.user) };
  },

  async login(email: string, password: string) {
    const { data: res } = await apiClient.post<{ accessToken: string; user: ApiUser }>(
      "/auth/login",
      { email: email.trim().toLowerCase(), password }
    );
    return { accessToken: res.accessToken, user: mapUser(res.user) };
  },

  async getProfile() {
    const { data } = await apiClient.get<ApiUser>("/auth/profile");
    return mapUser(data);
  },

  async updateProfile(patch: Partial<{ name: string; email: string; phone: string; walletAddress: string; avatar: string }>) {
    const { data } = await apiClient.patch<ApiUser>("/auth/profile", patch);
    return mapUser(data);
  },

  async getProperties(filters?: Partial<PropertyFilters>): Promise<Property[]> {
    const { data } = await apiClient.get<ApiProperty[]>("/properties", {
      params: toQuery(filters),
    });
    return data.map(mapProperty);
  },

  async getProperty(id: string): Promise<Property | undefined> {
    try {
      const { data } = await apiClient.get<ApiProperty>(`/properties/${id}`);
      return mapProperty(data);
    } catch {
      return undefined;
    }
  },

  async getPropertiesByOwner(ownerId: string): Promise<Property[]> {
    const { data } = await apiClient.get<ApiProperty[]>(`/properties/owner/${ownerId}`);
    return data.map(mapProperty);
  },

  async createProperty(
    payload: CreatePropertyValues & {
      ownerWallet?: string;
      images?: string[];
      listingType?: "sale" | "rent";
      priceEth?: number;
    }
  ): Promise<Property> {
    const { data } = await apiClient.post<ApiProperty>("/properties", {
      title: payload.title,
      description: payload.description,
      price: payload.price,
      currency: "USD",
      type: payload.type,
      listingType: payload.listingType ?? "sale",
      bedrooms: payload.bedrooms,
      bathrooms: payload.bathrooms,
      area: payload.area,
      ownerWallet: payload.ownerWallet,
      priceEth: payload.priceEth ?? 0.01,
      location: {
        address: payload.location,
        city: payload.location,
        country: "",
        lat: 0,
        lng: 0,
      },
      images: payload.images,
      status: "pending",
    });
    return mapProperty(data);
  },

  async updateProperty(id: string, patch: Partial<ApiProperty>): Promise<Property> {
    const { data } = await apiClient.patch<ApiProperty>(`/properties/${id}`, patch);
    return mapProperty(data);
  },

  async approveProperty(id: string): Promise<Property> {
    const { data } = await apiClient.patch<ApiProperty>(`/properties/${id}/approve`);
    return mapProperty(data);
  },

  async getStats() {
    const { data } = await apiClient.get("/properties/stats");
    return data;
  },

  async getAgents(): Promise<User[]> {
    const { data } = await apiClient.get<ApiUser[]>("/users/agents");
    return data.map(mapUser);
  },

  async getUsers(): Promise<User[]> {
    const { data } = await apiClient.get<ApiUser[]>("/users");
    return data.map(mapUser);
  },

  async getInquiries(): Promise<Inquiry[]> {
    const { data } = await apiClient.get<ApiInquiry[]>("/inquiries");
    return data.map(mapInquiry);
  },

  async getMyInquiries(): Promise<Inquiry[]> {
    const { data } = await apiClient.get<ApiInquiry[]>("/inquiries/mine");
    return data.map(mapInquiry);
  },

  async createInquiry(payload: {
    propertyId: string;
    type: Inquiry["type"];
    message: string;
  }): Promise<Inquiry> {
    const { data } = await apiClient.post<ApiInquiry>("/inquiries", payload);
    return mapInquiry(data);
  },

  async updateInquiry(id: string, status: Inquiry["status"]): Promise<Inquiry> {
    const { data } = await apiClient.patch<ApiInquiry>(`/inquiries/${id}`, { status });
    return mapInquiry(data);
  },

  async getOwnershipRecords() {
    const { data } = await apiClient.get("/properties/ownership-records");
    return data;
  },

  async mintPropertyToken(ownerAddress: string, tokenURI: string) {
    const { data } = await apiClient.post<{ tokenId: string; txHash: string }>(
      "/blockchain/mint",
      { ownerAddress, tokenURI }
    );
    return data;
  },

  async verifyOwnershipOnChain(walletAddress: string, tokenId: string) {
    const { data } = await apiClient.get<boolean>("/blockchain/verify-ownership", {
      params: { walletAddress, tokenId },
    });
    return data;
  },

  async createTransaction(payload: {
    propertyId: string;
    type: "sale" | "rental";
    amount: number;
    blockchainTokenId?: string;
  }) {
    const { data } = await apiClient.post("/transactions", payload);
    return data;
  },

  async markEscrow(transactionId: string, txHash: string) {
    const { data } = await apiClient.post(`/transactions/${transactionId}/escrow`, { txHash });
    return data;
  },

  async confirmSaleTransaction(transactionId: string, confirmTxHash: string) {
    const { data } = await apiClient.post(`/transactions/${transactionId}/confirm`, {
      confirmTxHash,
    });
    return data;
  },

  async getMyTransactions() {
    const { data } = await apiClient.get<
      Array<{
        id: string;
        propertyId: string;
        buyerId: string;
        sellerId: string;
        type: string;
        amount: number;
        status: string;
        txHash: string;
        confirmTxHash: string;
        blockchainTokenId: string;
        contractAddress: string;
      }>
    >("/transactions/mine");
    return data;
  },

  async getOnChainToken(tokenId: string) {
    const { data } = await apiClient.get(`/blockchain/token/${tokenId}`);
    return data;
  },

  async getBlockchainRecords(tokenIds: string[]) {
    const { data } = await apiClient.get("/blockchain/records", {
      params: { tokenIds: tokenIds.join(",") },
    });
    return data;
  },

  async getBlockchainStatus() {
    const { data } = await apiClient.get<{ enabled: boolean; contractAddress: string }>(
      "/blockchain/status"
    );
    return data;
  },
};

/** Backward-compatible alias used by hooks during migration. */
export const chainEstateApi = api;
