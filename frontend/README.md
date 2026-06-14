# ChainEstate — Blockchain Real Estate Marketplace (Frontend)

A frontend-only, production-quality demo of a blockchain-enabled real estate
marketplace. Property ownership, agent authorization, and ownership transfers
are simulated with **mock blockchain services** (no backend, no smart contracts,
no database).

> ⚠️ This app is a standalone **Next.js 15** project. It does **not** run inside
> the Lovable preview (which uses TanStack Start). Run it locally with the steps
> below.

## Tech Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (custom design system, dark/light mode)
- **React Hook Form** + **Zod** (forms & validation)
- **Zustand** (wallet, auth, saved-properties stores)
- **TanStack Query** (data fetching from mock API)
- **Ethers.js** (mock wallet / tx hashes / address validation)
- **Leaflet + react-leaflet** (interactive property map)

## Getting Started

```bash
cd frontend
npm install      # or: pnpm install / bun install
npm run dev
```

Open http://localhost:3000.

## Project Structure

```
frontend/
├── app/                      # App Router routes
│   ├── page.tsx              # Landing page
│   ├── login/  register/     # Auth
│   ├── marketplace/          # Property listing (grid/list, filters, sort)
│   ├── property/[id]/        # Property details + map + verification
│   └── dashboard/            # owner | agent | buyer | admin
├── components/
│   ├── ui/                   # shadcn primitives
│   ├── layout/               # navbar, footer
│   ├── landing/              # hero, features, stats
│   ├── property/             # card, filters, gallery, map, verification
│   ├── wallet/               # wallet connect + status card
│   └── dashboard/            # shell, stat cards
├── features/                 # ownership transfer, agent authorization flows
├── hooks/                    # TanStack Query hooks
├── lib/                      # utils, zod schemas
├── services/                 # mock-api, mock-blockchain, mock-data
├── store/                    # zustand stores
├── types/                    # shared TypeScript interfaces
└── public/                   # hero illustration + assets
```

## Mock Blockchain

`services/mock-blockchain.ts` simulates wallet connection, network switching,
ownership verification, agent authorization/revocation, and ownership transfers.
It uses Ethers.js to generate realistic addresses and transaction hashes and to
validate wallet addresses — all client-side, with artificial latency.

## Demo Logins

The login form is pre-filled with a demo owner account. Any valid email maps to
a mock user; you can also register a new account and pick a role
(Owner / Agent / Buyer) to land on the matching dashboard.

## Notes

All data is mock and resets on reload (except wallet/auth/saved state, which is
persisted to `localStorage` via Zustand). This build is the **foundation**:
landing, auth, wallet, marketplace, property details, mock services, and
role dashboard overviews with blockchain action flows.
