import type {
  Inquiry,
  OwnershipRecord,
  Property,
  User,
  VerificationEvent,
} from "@/types";

const IMG = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

const HOUSE_IMAGES = [
  "photo-1600596542815-ffad4c1539a9",
  "photo-1600585154340-be6161a56a0c",
  "photo-1600607687939-ce8a6c25118c",
  "photo-1564013799919-ab600027ffc6",
  "photo-1568605114967-8130f3a36994",
  "photo-1605276374104-dee2a0ed3cd6",
  "photo-1572120360610-d971b9d7767c",
  "photo-1512917774080-9991f1c4c750",
  "photo-1580587771525-78b9dba3b914",
  "photo-1613490493576-7fde63acd811",
];

const galleryFor = (seed: number) =>
  Array.from({ length: 4 }, (_, i) => IMG(HOUSE_IMAGES[(seed + i) % HOUSE_IMAGES.length]));

export const MOCK_USERS: User[] = [
  {
    id: "u-owner-1",
    name: "Sophia Bennett",
    email: "sophia@chainestate.io",
    phone: "+1 415 555 0132",
    role: "owner",
    walletAddress: "0xA4B7C2D9E1F3A5B7C9D1E3F5A7B9C1D3E5F7D81F",
    avatar: "https://i.pravatar.cc/150?img=47",
    status: "active",
    joinedAt: "2024-03-12T10:00:00Z",
    verified: true,
  },
  {
    id: "u-agent-1",
    name: "Marcus Reed",
    email: "marcus@chainestate.io",
    phone: "+1 312 555 0177",
    role: "agent",
    walletAddress: "0xC81F3B7A2E9D4C6F8A1B3D5E7F9A2C4B6D8E0F11",
    avatar: "https://i.pravatar.cc/150?img=12",
    status: "active",
    joinedAt: "2024-04-02T10:00:00Z",
    verified: true,
  },
  {
    id: "u-buyer-1",
    name: "Elena Cruz",
    email: "elena@chainestate.io",
    phone: "+1 206 555 0144",
    role: "buyer",
    walletAddress: "0xD12E4F6A8B0C2D4E6F8A0B2C4D6E8F0A2B4C6D88",
    avatar: "https://i.pravatar.cc/150?img=32",
    status: "active",
    joinedAt: "2024-05-21T10:00:00Z",
    verified: true,
  },
  {
    id: "u-admin-1",
    name: "Admin Control",
    email: "admin@chainestate.io",
    role: "admin",
    walletAddress: "0xADMIN0000C2D4E6F8A0B2C4D6E8F0A2B4C6D6E80",
    avatar: "https://i.pravatar.cc/150?img=5",
    status: "active",
    joinedAt: "2024-01-01T10:00:00Z",
    verified: true,
  },
  {
    id: "u-agent-2",
    name: "Priya Nair",
    email: "priya@chainestate.io",
    phone: "+44 20 5550 0190",
    role: "agent",
    walletAddress: "0xB22A1C3E5F7A9B1D3F5A7C9E1B3D5F7A9C1E3B55",
    avatar: "https://i.pravatar.cc/150?img=20",
    status: "active",
    joinedAt: "2024-06-08T10:00:00Z",
    verified: true,
  },
  {
    id: "u-owner-2",
    name: "Daniel Okafor",
    email: "daniel@chainestate.io",
    phone: "+1 646 555 0123",
    role: "owner",
    walletAddress: "0xE33B2D4F6A8C0E2A4C6E8A0C2E4A6C8E0A2C4E66",
    avatar: "https://i.pravatar.cc/150?img=15",
    status: "active",
    joinedAt: "2024-02-19T10:00:00Z",
    verified: true,
  },
  {
    id: "u-buyer-2",
    name: "Hiro Tanaka",
    email: "hiro@chainestate.io",
    phone: "+81 3 5550 0166",
    role: "buyer",
    walletAddress: "0xF44C3E5A7B9D1F3A5C7E9B1D3F5A7C9E1B3D5F77",
    avatar: "https://i.pravatar.cc/150?img=51",
    status: "suspended",
    joinedAt: "2024-07-30T10:00:00Z",
    verified: false,
  },
];

const LOCATIONS = [
  { city: "Miami", country: "USA", lat: 25.7617, lng: -80.1918 },
  { city: "Austin", country: "USA", lat: 30.2672, lng: -97.7431 },
  { city: "Lisbon", country: "Portugal", lat: 38.7223, lng: -9.1393 },
  { city: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708 },
  { city: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198 },
  { city: "Barcelona", country: "Spain", lat: 41.3851, lng: 2.1734 },
  { city: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832 },
  { city: "Bali", country: "Indonesia", lat: -8.4095, lng: 115.1889 },
];

const TYPES = [
  "Apartment",
  "House",
  "Villa",
  "Condo",
  "Townhouse",
  "Commercial",
] as const;

const STREETS = [
  "Skyline Residences",
  "Harbor Point Villa",
  "The Glass Tower",
  "Palm Grove Estate",
  "Aurora Lofts",
  "Cedar Hill House",
  "Marina Bay Condo",
  "Sunset Terrace",
  "Crystal Court",
  "Emerald Heights",
  "Riverside Manor",
  "Summit View Penthouse",
];

function buildHistory(ownerWallet: string, agentWallet: string, base: number): VerificationEvent[] {
  const day = (n: number) => new Date(Date.UTC(2024, 8, base + n)).toISOString();
  return [
    {
      id: `ev-${base}-1`,
      type: "verification",
      description: "Ownership verified on-chain via title registry oracle",
      txHash: `0x${(base * 7919).toString(16).padEnd(64, "a")}`.slice(0, 66),
      actor: ownerWallet,
      timestamp: day(0),
    },
    {
      id: `ev-${base}-2`,
      type: "agent_assigned",
      description: "Agent authorized to manage listing",
      txHash: `0x${(base * 104729).toString(16).padEnd(64, "b")}`.slice(0, 66),
      actor: ownerWallet,
      timestamp: day(2),
    },
  ];
}

export const MOCK_PROPERTIES: Property[] = Array.from({ length: 12 }, (_, i) => {
  const loc = LOCATIONS[i % LOCATIONS.length];
  const owner = i % 2 === 0 ? MOCK_USERS[0] : MOCK_USERS[5];
  const agent = i % 3 === 0 ? MOCK_USERS[1] : i % 3 === 1 ? MOCK_USERS[4] : undefined;
  const price = 250000 + i * 145000 + (i % 4) * 90000;
  const listingType: "sale" | "rent" = i % 4 === 0 ? "rent" : "sale";
  const verified = i % 5 !== 0;
  return {
    id: `prop-${i + 1}`,
    chainId: `EST-${1000 + i}`,
    title: STREETS[i % STREETS.length],
    description:
      "A meticulously designed residence offering panoramic views, premium finishes, and smart-home automation. Ownership is recorded immutably on-chain, ensuring fully transparent and tamper-proof title history for buyers and agents.",
    price: listingType === "rent" ? 2200 + i * 350 : price,
    currency: "USD",
    listingType,
    status: i % 6 === 0 ? "pending" : i % 7 === 0 ? "sold" : "active",
    type: TYPES[i % TYPES.length],
    bedrooms: 1 + (i % 5),
    bathrooms: 1 + (i % 4),
    area: 850 + i * 240,
    location: {
      lat: loc.lat,
      lng: loc.lng,
      city: loc.city,
      country: loc.country,
      address: `${100 + i} ${STREETS[i % STREETS.length]}, ${loc.city}`,
    },
    images: galleryFor(i),
    ownerId: owner.id,
    ownerWallet: owner.walletAddress,
    agentId: agent?.id,
    agentWallet: agent?.walletAddress,
    verification: {
      status: verified ? "verified" : "pending",
      verifiedAt: verified ? new Date(Date.UTC(2024, 8, 1 + i)).toISOString() : undefined,
      txHash: verified
        ? `0x${(i * 31337).toString(16).padEnd(64, "c")}`.slice(0, 66)
        : undefined,
    },
    history: buildHistory(owner.walletAddress, agent?.walletAddress ?? owner.walletAddress, i + 1),
    featured: i < 4,
    createdAt: new Date(Date.UTC(2024, 8, 1 + i)).toISOString(),
    views: 120 + i * 37,
    saves: 8 + i * 3,
  };
});

export const MOCK_INQUIRIES: Inquiry[] = Array.from({ length: 6 }, (_, i) => ({
  id: `inq-${i + 1}`,
  propertyId: MOCK_PROPERTIES[i % MOCK_PROPERTIES.length].id,
  propertyTitle: MOCK_PROPERTIES[i % MOCK_PROPERTIES.length].title,
  buyerId: MOCK_USERS[2].id,
  buyerName: i % 2 === 0 ? "Elena Cruz" : "Hiro Tanaka",
  type: i % 3 === 0 ? "purchase" : i % 3 === 1 ? "rental" : "question",
  message:
    "I'm interested in scheduling a viewing and verifying the on-chain ownership record before proceeding.",
  status: i % 3 === 0 ? "new" : i % 3 === 1 ? "in_progress" : "closed",
  createdAt: new Date(Date.UTC(2024, 9, 1 + i)).toISOString(),
}));

export const MOCK_OWNERSHIP_RECORDS: OwnershipRecord[] = MOCK_PROPERTIES.map((p) => ({
  propertyId: p.chainId,
  propertyTitle: p.title,
  ownerWallet: p.ownerWallet,
  agentWallet: p.agentWallet,
  verificationStatus: p.verification.status,
  transfers: p.history.filter((h) => h.type === "transfer" || h.type === "verification"),
}));

export const PLATFORM_STATS = {
  properties: 1250,
  verifiedOwners: 520,
  authorizedAgents: 300,
  transactions: 2500,
};
