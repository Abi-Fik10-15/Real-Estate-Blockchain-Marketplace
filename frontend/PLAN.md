# ChainEstate — Blockchain Real Estate Marketplace
## Claude-Driven Development & Migration Plan

> **Project:** Blockchain-Enabled Real Estate Marketplace  
> **Current Stack (Phase 1 - Frontend Prototype):** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Zustand · Ethers.js · Leaflet (OpenStreetMap) · AI Chatbot
> **Target Stack (Phase 2 - Production Integration):** NestJS · MongoDB (Mongoose) · Solidity (Sepolia Testnet) · Hardhat · Cloudinary · Socket.IO  
> **Team:** 5 members · 5 days  
> **Methodology:** Claude-driven development — mock-up prototype built first, followed by production API & blockchain migration.

---

## How to Use This Plan

This document is your **development playbook and progress tracker**. It is divided into two distinct phases:
1. **Phase 1: High-Fidelity Frontend Prototype (Completed [x])** — A fully interactive, self-contained client-side experience with mocked data, mock blockchain transactions, Leaflet maps, and Zustand store-backed storage.
2. **Phase 2: Full-Stack Production Integration (Planned [ ])** — A detailed guide with Claude prompts to migrate the mock APIs and simulation services to a real NestJS API, MongoDB database, and Sepolia smart contracts.

---

## Team Assignments

| Member | Role | Primary Responsibility |
|---|---|---|
| Abubker Zerihun | Project Manager | Sprint tracking, integration checkpoints, demo coordination |
| Zenet Roba | Frontend | Next.js pages, components, Leaflet maps, wallet UI |
| Beamlak Abera | SEO / Content | Metadata, OpenGraph, structured data, property schema |
| Rediet Jedika | Backend / Blockchain | NestJS modules, MongoDB schemas, smart contracts |
| Eden Tekeste | UI/UX | Design system, component library, UI polish |

---

## Repository Structure

The current codebase is organized as a standalone, client-side Next.js project inside the `frontend` folder:

```
frontend/
├── app/                      # App Router page layouts and views
│   ├── page.tsx              # Dynamic landing page (Hero, Stats, Featured, Comparison, CTA)
│   ├── login/                # Sign-in page (role selection)
│   ├── register/             # Sign-up page (role registration)
│   ├── marketplace/          # Property catalog (grid/list view, advanced filters, sort)
│   ├── property/[id]/        # Property detail view (Leaflet map, verification status, contact agent)
│   └── dashboard/            # Role-specific dashboard layouts:
│       ├── admin/            # Admin dashboard (users, verification records, reports)
│       ├── agent/            # Agent dashboard (assigned properties, inquiries, verifications)
│       ├── buyer/            # Buyer dashboard (saved listings, request history, profile)
│       └── owner/            # Owner dashboard (property editor, transfer logs, agent assigner)
├── components/               # Custom modular UI layout and sections
│   ├── chatbot/              # AI chatbot assistant for real estate guidance
│   ├── dashboard/            # Shared dashboard layouts and shells
│   ├── landing/              # Dedicated sections for the Home landing page
│   ├── layout/               # Global Header/Navbar and Footer
│   ├── property/             # Property filters, gallery, and Leaflet map wrapper
│   ├── ui/                   # Custom UI components (button, card, dialog, avatar, badge)
│   └── wallet/               # MetaMask wallet connection flow buttons
├── features/                 # Major Web3 transaction flows (Ownership Transfer, Agent Assignment)
├── hooks/                    # React Query hooks (use-properties.ts)
├── lib/                      # Zod validation schemas (validations.ts) and utils (utils.ts)
├── services/                 # Mock API layers & AI Chatbot configuration:
│   ├── chatbot.ts            # Local AI helper chat prompt and answer routing
│   ├── mock-api.ts           # Mock REST endpoint calls with simulated latency
│   ├── mock-blockchain.ts    # Simulated Ethers.js-backed on-chain events (address & tx generation)
│   └── mock-data.ts          # Static dummy users, property listings, and statistics
├── store/                    # Zustand client-side persistent storage (auth, properties, wallet, saved, inquiry)
├── types/                    # Shared TypeScript model definitions
└── package.json              # Client dependencies and build scripts
```

---

# PHASE 1 — High-Fidelity Frontend Prototype (COMPLETED)

All baseline views, mock integrations, local storage persistence, and interactive user flows are completed.

### Done Checklist
- `[x]` **Monorepo Setup Simplified:** Standardized project structure inside `frontend/` using Next.js 15, React 19, and Tailwind CSS.
- `[x]` **Design System Setup:** Fully-typed React UI components in `components/ui/` integrated with tailwind styles and dark mode toggles.
- `[x]` **Zustand Local Storage Stores:** Client-side state managers (`store/`) for session logs, inquiries, property updates, wallet balances, and bookmarks.
- `[x]` **Leaflet Property Maps:** Interactive geography widgets (`components/property/property-map.tsx`) using OpenStreetMap/react-leaflet (replacing Mapbox GL dependencies).
- `[x]` **AI Chatbot Guide:** Fully working client-side AI chat drawer (`components/chatbot/`) using `services/chatbot.ts` to guide users through blockchain real estate basics.
- `[x]` **Mock Blockchain Transactions:** Simulating on-chain wallet connection, network switching, ownership transfer, and agent assignment inside `services/mock-blockchain.ts` using ethers.js to generate valid addresses/tx-hashes.
- `[x]` **Role-Based Dashboards:** Distinct dashboards for **Buyers**, **Owners**, **Agents**, and **Admins** with dynamic status badges, verification requests, and property managers.
- `[x]` **Interactive Buyer Dashboard Upgrades:** Polished metrics, onboarding setup progress checklist, sandbox Web3 console, simulated multi-phase escrow lockup payments modal, Framer Motion gallery exit transitions, and validator oracle title deed certificate lookup pages.
- `[x]` **SEO & Metadata:** Custom robots.txt, default metadata tags, OpenGraph configs, and structured JSON-LD schemas in `app/layout.tsx` and property details pages.

---

# PHASE 2 — Full-Stack Production Integration (PLANNED)

This phase guides the team through migrating the client prototype to a production database, a NestJS backend API, and a Sepolia Solidity contract deployment.

## Step 1 — Database & Smart Contract Setup

**Prompt for Rediet (Backend - Smart Contracts):**

```
Write a Solidity smart contract for a real estate marketplace. Solidity version ^0.8.20.

Contract name: RealEstateMarketplace

Features:
1. Property NFT minting (ERC-721) — each property is represented as a token.
2. Escrow for purchases — buyer deposits ETH, which is locked in escrow and released to the seller upon confirmation.
3. Rental agreements — stores start date, end date, and monthly rent on-chain.
4. Ownership transfer — transfers the NFT from the seller to the buyer on deal completion.
5. Events: PropertyListed, EscrowDeposited, OwnershipTransferred, RentalCreated.

Functions:
- listProperty(string memory tokenURI) → returns tokenId
- initiateEscrow(uint256 tokenId) payable → buyer deposits ETH
- confirmSale(uint256 tokenId) → seller confirms, ETH released, NFT transferred
- createRental(uint256 tokenId, uint256 startDate, uint256 endDate, uint256 monthlyRent)
- cancelEscrow(uint256 tokenId) → refund buyer if escrow is cancelled
- getProperty(uint256 tokenId) → returns on-chain property details
- transferOwnership(uint256 tokenId, address newOwner)

Also generate:
- A Hardhat configuration (`hardhat.config.ts`) configured for Sepolia testnet.
- A deployment script `deploy.ts` that compiles and deploys the contract to Sepolia, logging the target address.
- Unit tests (`RealEstateMarketplace.test.ts`) using Chai/Ethers to test listing, escrow funding, and sale confirmation.

Use OpenZeppelin ERC721, Ownable, and ReentrancyGuard contracts.
```

**Verification:**
```bash
npx hardhat compile       # should compile with no errors
npx hardhat test          # all unit tests pass
npx hardhat run scripts/deploy.ts --network sepolia  # deploys and logs address
```

---

## Step 2 — NestJS API & Mongoose Schema Migration

**Prompt for Rediet (Backend - API Modules):**

```
Generate a NestJS REST API codebase that connects to MongoDB using Mongoose, replacing the mock endpoints currently defined in `services/mock-api.ts`.

Generate Mongoose schemas and NestJS modules for:
1. Users: email, passwordHash, role (buyer/owner/agent/admin), walletAddress, kycStatus.
2. Properties: ownerId, title, description, price, currency (ETH/USD), status (draft/pending/active/sold/rented), location: { address, city, country, lat, lng }, bedrooms, bathrooms, area, blockchainTokenId, images, documents.
3. Inquiries & Visits: propertyId, buyerId, type (purchase/rental/question), message, status (new/in_progress/closed).
4. Transactions: propertyId, buyerId, sellerId, type (sale/rental), amount, status (initiated/escrow/completed), contractAddress, txHash.

Enable CORS for the frontend origin, configure a global validation pipe, and set up simple JWT authentication using a Passport JWT strategy. Attach the JWT middleware to protect user profile, property creation, and dashboard transactions.
```

---

## Step 3 — Blockchain Service & Gateway Integration

**Prompt for Rediet (Backend - Web3 Service):**

```
Create a NestJS `BlockchainService` that interacts with the deployed Solidity contract on the Sepolia network using ethers.js v6.

Provide methods for:
1. `mintPropertyToken(ownerAddress: string, tokenURI: string)`:
   - Call the smart contract `listProperty` function using the deployer wallet (PRIVATE_KEY).
   - Wait for transaction confirmation and parse the `PropertyListed` event to extract the generated `tokenId`.
2. `initiateEscrow(tokenId: string, buyerAddress: string, amountEth: string)`:
   - Trigger/validate the escrow initialization, returning the transaction hash.
3. `confirmSale(tokenId: string)`:
   - Release escrow funds to the seller wallet and transfer the NFT title deed to the buyer.
4. `verifyOwnership(walletAddress: string, tokenId: string)`:
   - Query the contract's `ownerOf` function to ensure it matches the specified wallet address.

Store contract ABI files in `src/blockchain/abi/` and configuration values (provider RPC URL, deployer private key, contract address) in environment variables.
```

---

## Step 4 — Frontend API & Smart Contract Connection

**Prompt for Zenet (Frontend Integration):**

```
Refactor the Next.js frontend to replace the simulated mock API and mock blockchain services with real network operations.

1. Configure an Axios client in `lib/api.ts` that points to the NestJS URL (`NEXT_PUBLIC_API_URL`).
   - Add a request interceptor to automatically attach the JWT token retrieved from local storage.
   - Add a response interceptor to redirect the user to `/login` on auth expiration.

2. Create a frontend smart contract client in `lib/contract.ts` using Ethers.js v6:
   - Use `BrowserProvider` to connect to the MetaMask extension.
   - Implement `connectWallet()` and network validation helpers to enforce Sepolia Testnet (chainId: 0xAA36A7).
   - Write async functions to trigger the on-chain transactions directly from the buyer/owner user actions:
     - `initiateEscrow(tokenId, priceEth)`: Calls the contract's `initiateEscrow` function, sending the exact transaction value in Wei.
     - `confirmSale(tokenId)`: Calls the contract's `confirmSale` function to release escrow and complete the purchase.
     - `verifyOwnership(tokenId)`: Checks the on-chain owner.

Update the `useWalletStore` and property verification page panels to use this contract client.
```

---

## Step 5 — Real-Time Gateways & Notifications

**Prompt for Rediet + Zenet (Real-Time Updates):**

```
Add real-time websocket notifications to the real estate portal.

Backend:
- Create a Socket.io gateway in NestJS (`src/notifications/notifications.gateway.ts`).
- Secure the gateway using the JWT handshake protocol.
- Emit events when:
  - An inquiry is submitted (`visit_request` sent to owner).
  - A transaction changes state (`escrow_deposited` or `transaction_completed` sent to buyer/seller).
  - A listing is approved by an administrator (`property_verified` sent to owner).

Frontend:
- Create a `useNotifications` custom React hook that initializes a socket.io client.
- Connect the socket on successful user session authentication, joining a personal notification room.
- Show instant Sonner toaster notifications when events arrive and update the header notification bubble count.
```

---

# Integration & Migration Checkpoints

Verify database connectivity, contract compliance, and api responses at each migration step:

### Backend Check
```bash
# Register a user
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"TestPassword123!","role":"buyer","name":"Test User"}'

# Verify properties endpoint returns 200 OK
curl -X GET http://localhost:3001/properties
```

### Smart Contract Compilation Check
```bash
cd packages/contracts
npx hardhat compile
npx hardhat test
```

---

# Environment Variables Master List

Configure these in a `.env` file in the frontend workspace root:

```env
# Mocks & Platform Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Backend Integration (Phase 2)
NEXT_PUBLIC_API_URL=http://localhost:3001
MONGODB_URI=mongodb://localhost:27017/chainestate

# Blockchain RPC & Wallets (Phase 2)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=0x_YOUR_DEPLOYER_WALLET_PRIVATE_KEY
NEXT_PUBLIC_CONTRACT_ADDRESS=0x_YOUR_DEPLOYED_CONTRACT_ADDRESS
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
```

---

*Updated for ChainEstate — Frontend Prototype Audit & Production Roadmap*  
*Team: Abubker (PM) · Zenet (Frontend) · Beamlak (SEO) · Rediet (Backend/Blockchain) · Eden (UI/UX)*
