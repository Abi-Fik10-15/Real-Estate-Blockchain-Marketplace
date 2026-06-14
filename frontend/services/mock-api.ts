import { sleep } from "@/lib/utils";
import {
  MOCK_INQUIRIES,
  MOCK_OWNERSHIP_RECORDS,
  MOCK_PROPERTIES,
  MOCK_USERS,
  PLATFORM_STATS,
} from "./mock-data";
import type { Property, PropertyFilters } from "@/types";

/** Mock REST-like API. All methods return promises to mimic network latency. */
export const mockApi = {
  async getProperties(filters?: Partial<PropertyFilters>): Promise<Property[]> {
    await sleep(700);
    let result = [...MOCK_PROPERTIES];
    if (!filters) return result;

    const { search, type, minPrice, maxPrice, bedrooms, bathrooms, location, status, listingType, sort } =
      filters;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.location.city.toLowerCase().includes(q) ||
          p.location.country.toLowerCase().includes(q)
      );
    }
    if (type && type !== "all") result = result.filter((p) => p.type === type);
    if (typeof minPrice === "number") result = result.filter((p) => p.price >= minPrice);
    if (typeof maxPrice === "number" && maxPrice > 0)
      result = result.filter((p) => p.price <= maxPrice);
    if (bedrooms) result = result.filter((p) => p.bedrooms >= bedrooms);
    if (bathrooms) result = result.filter((p) => p.bathrooms >= bathrooms);
    if (location)
      result = result.filter((p) =>
        p.location.city.toLowerCase().includes(location.toLowerCase())
      );
    if (status && status !== "all") result = result.filter((p) => p.status === status);
    if (listingType && listingType !== "all")
      result = result.filter((p) => p.listingType === listingType);

    switch (sort) {
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "area_desc":
        result.sort((a, b) => b.area - a.area);
        break;
      default:
        result.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }
    return result;
  },

  async getProperty(id: string): Promise<Property | undefined> {
    await sleep(500);
    return MOCK_PROPERTIES.find((p) => p.id === id || p.chainId === id);
  },

  async getPropertiesByOwner(ownerId: string): Promise<Property[]> {
    await sleep(500);
    return MOCK_PROPERTIES.filter((p) => p.ownerId === ownerId);
  },

  async getPropertiesByAgent(agentId: string): Promise<Property[]> {
    await sleep(500);
    return MOCK_PROPERTIES.filter((p) => p.agentId === agentId);
  },

  async getUsers() {
    await sleep(500);
    return MOCK_USERS;
  },

  async getAgents() {
    await sleep(400);
    return MOCK_USERS.filter((u) => u.role === "agent");
  },

  async getInquiries() {
    await sleep(500);
    return MOCK_INQUIRIES;
  },

  async getOwnershipRecords() {
    await sleep(500);
    return MOCK_OWNERSHIP_RECORDS;
  },

  async getStats() {
    await sleep(300);
    return PLATFORM_STATS;
  },
};
