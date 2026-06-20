# ChainEstate — Blockchain Setup (Sepolia)

On-chain property deeds (ERC-721), escrow-backed sales, and wallet-verified ownership on **Ethereum Sepolia testnet** (chain ID `11155111`).

> **Important:** ChainEstate uses **Sepolia test ETH only** — not Ethereum Mainnet. Never use a wallet with real funds for testing.

---

## What runs where

| Component | Where it runs |
|-----------|----------------|
| Smart contract | **Sepolia** (deploy once) |
| Backend minting | NestJS API → Sepolia via RPC |
| Buyer / owner txs | **MetaMask** in your browser → Sepolia |
| MongoDB, API, UI | Local or **Docker** (see [DOCKER.md](./DOCKER.md)) |

Blockchain is **not** a Docker container — Docker passes your Sepolia keys to the backend/frontend so they can talk to the public testnet.

---

## Platform lifecycle (off-chain + on-chain)

ChainEstate combines MongoDB records with optional Sepolia smart contracts. This is the full path from listing to purchase:

```
Owner creates listing (status: pending)
        ↓
Optional: API mints ERC-721 deed on Sepolia → token ID stored on property
        ↓
Admin approves listing (status: active) → appears on marketplace / browse filters
        ↓
Buyer submits purchase or rental inquiry (stored in MongoDB, linked to property + buyer)
        ↓
Owner approves inquiry (status: in_progress) → buyer can fund escrow
        ↓
Buyer funds escrow (MetaMask initiateEscrow or API-only demo path)
        ↓
Owner confirms in Escrow & Sales → property status sold/rented, inquiry closed
```

### Listing approval (marketplace visibility)

| Status | Visible on marketplace? | Who acts |
|--------|-------------------------|----------|
| `pending` | No | Owner after create/mint |
| `active` | Yes | Admin approves in **Admin → Properties** |
| `sold` / `rented` | No (completed deals) | Automatic after owner confirms escrow |

New properties are always created with `status: pending`. Only **`active`** listings are returned when the frontend requests marketplace/browse data (`status=active`).

### Buyer inquiries (purchase / rental requests)

| Step | Buyer | Owner |
|------|-------|-------|
| 1 | Submit inquiry on property page or marketplace detail | — |
| 2 | See request under **My Requests** (persisted via `GET /inquiries/mine`) | See under **Buyer Inquiries** (`GET /inquiries`) |
| 3 | Wait for owner to set status **Approved** | Change inquiry to **Approved by Owner** |
| 4 | **Fund Escrow** from My Requests | — |
| 5 | Status shows escrow funded; await owner | **Escrow & Sales → Confirm Sale/Rental** |
| 6 | Property appears under **My Properties** as purchased/rented | Listing shows **Sold** or **Rented** |

Inquiries are stored in MongoDB with `propertyId`, `buyerId`, and `status` (`new` → `in_progress` → `closed`). They survive page reloads; the API is the source of truth (not only local Zustand state).

### KYC (identity verification)

Users submit documents under **Settings → Identity Verification**. Admins review in **KYC & Verification → KYC Review**. Verified users receive a KYC badge on their profile.

---

## Architecture

```
Owner creates listing → API mints NFT (deployer wallet) → NFT sent to owner wallet
Buyer funds escrow    → MetaMask initiateEscrow(tokenId) + Sepolia ETH
Owner confirms sale   → MetaMask confirmSale(tokenId) → NFT + escrow settle on-chain
```

Smart contract source: `backend/contracts/RealEstateMarketplace.sol`

---

## Prerequisites

Before you start, you need:

- [MetaMask](https://metamask.io/) browser extension
- A **dedicated test wallet** (create a new account in MetaMask — do not use your main wallet)
- **Sepolia ETH** in that wallet (free from faucets below)
- [Alchemy](https://www.alchemy.com/) or [Infura](https://infura.io/) account (free RPC URL)
- Node.js 18+ installed (for contract deploy only)

---

## Step 1 — MetaMask on Sepolia

1. Open MetaMask → click the **network dropdown** (top center).
2. Select **Sepolia test network**.
   - If missing: **Add network** → search “Sepolia” or add manually:
     - Network name: `Sepolia`
     - RPC URL: `https://rpc.sepolia.org`
     - Chain ID: `11155111`
     - Symbol: `ETH`
     - Explorer: `https://sepolia.etherscan.io`
3. Create a **new account** and name it e.g. `ChainEstate Test`.

### How to know it’s a test account

| Sign | Test (good) | Real (avoid for dev) |
|------|-------------|----------------------|
| Network | **Sepolia** | Ethereum Mainnet |
| ETH source | Faucet (free) | Purchased / mainnet transfer |
| Explorer | `sepolia.etherscan.io` | `etherscan.io` |
| Value | Worth $0 | Real money |

---

## Step 2 — Get Sepolia test ETH

Your deployer wallet and MetaMask users need Sepolia ETH for gas and escrow.

**Recommended faucets** (no mainnet balance required):

- [Alchemy Sepolia Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)
- [Google Cloud Sepolia Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)
- [QuickNode Sepolia Faucet](https://faucet.quicknode.com/ethereum/sepolia)

Copy your MetaMask **Sepolia** address → paste into faucet → receive test ETH.

> **If you see:** “Insufficient balance! You need at least 0.001 ETH on Ethereum Mainnet” — that faucet requires real mainnet ETH as anti-spam. **Use a different faucet** from the list above; you do **not** need mainnet ETH for this project.

Aim for at least **0.05 Sepolia ETH** on your deployer wallet before deploying the contract.

---

## Step 3 — Get your RPC URL (`SEPOLIA_RPC_URL`)

1. Sign up at [Alchemy](https://www.alchemy.com/) (or Infura).
2. Create an app → choose **Ethereum** → **Sepolia**.
3. Copy the **HTTPS** URL, e.g.:

```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
```

For Hardhat deploy you can also set:

```env
ALCHEMY_API_KEY=YOUR_ALCHEMY_API_KEY
```

---

## Step 4 — Export deployer private key (`PRIVATE_KEY`)

This wallet deploys the contract and mints property NFTs from the API.

1. MetaMask → select your **test account** on **Sepolia**.
2. ⋮ menu → **Account details** → **Show private key** → confirm → copy.
3. It looks like: `0x` + 64 hex characters.

```env
PRIVATE_KEY=0xabc123...
DEPLOYER_PRIVATE_KEY=0xabc123...   # same value — used by Hardhat deploy script
```

**Security rules:**

- Never commit `.env` to git (already in `.gitignore`)
- Never share this key publicly
- Use a throwaway test wallet only

---

## Step 5 — Compile and deploy the contract

From the **`backend/`** folder:

```powershell
cd backend
cp .env.example .env
# Edit .env — add SEPOLIA_RPC_URL, PRIVATE_KEY, ALCHEMY_API_KEY

npm install
npm run contracts:compile
npm run contracts:deploy:sepolia
```

Expected output:

```text
Deploying RealEstateMarketplace with account: 0xYourAddress...
Account balance: 0.05 ETH
RealEstateMarketplace deployed to: 0x1234...abcd

Add to backend/.env and frontend/.env:
CONTRACT_ADDRESS=0x1234...abcd
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234...abcd
```

Copy that address into your env files (Step 6).

### Optional: verify on Etherscan

1. Get an API key at [etherscan.io](https://etherscan.io/myapikey)
2. Add to `backend/.env`: `ETHERSCAN_API_KEY=...`
3. Verify manually at [sepolia.etherscan.io](https://sepolia.etherscan.io)

### Local Hardhat node (optional — no Sepolia needed)

For contract dev only, not used by the main app flow:

```bash
npm run contracts:node          # terminal 1
npm run contracts:deploy:local  # terminal 2
```

---

## Step 6 — Configure environment files

### Backend — `backend/.env`

```env
# Required for blockchain
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=0xYOUR_TEST_WALLET_PRIVATE_KEY
CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS

# Hardhat deploy (same key as PRIVATE_KEY)
DEPLOYER_PRIVATE_KEY=0xYOUR_TEST_WALLET_PRIVATE_KEY
ALCHEMY_API_KEY=YOUR_KEY
```

### Frontend — `frontend/.env` (local `npm run dev`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
```

`NEXT_PUBLIC_CONTRACT_ADDRESS` must match `CONTRACT_ADDRESS` exactly.

---

## Step 7 — Start the app

### Option A — Local development

```powershell
# Terminal 1 — MongoDB (or: docker start chainestate-mongo)
cd backend
npm run start:dev

# Terminal 2
cd frontend
npm run dev
```

### Option B — Docker

Put **all** blockchain vars in `backend/.env` (Docker reads this folder):

```env
SEPOLIA_RPC_URL=...
PRIVATE_KEY=...
CONTRACT_ADDRESS=...
NEXT_PUBLIC_CONTRACT_ADDRESS=...   # same address — used when building frontend image
FRONTEND_PORT=3000
BACKEND_PORT=3001
```

Then:

```powershell
cd backend
docker compose up --build
```

> Re-run `docker compose up --build` after changing `NEXT_PUBLIC_CONTRACT_ADDRESS` — it is baked into the frontend at **build time**.

---

## Step 8 — Verify blockchain is enabled

With the API running:

```powershell
curl http://localhost:3001/api/blockchain/status
```

Success:

```json
{
  "enabled": true,
  "contractAddress": "0x1234...abcd",
  "network": "sepolia",
  "chainId": 11155111,
  "explorerUrl": "https://sepolia.etherscan.io"
}
```

If `"enabled": false`:

- Check `SEPOLIA_RPC_URL`, `PRIVATE_KEY`, and `CONTRACT_ADDRESS` in `backend/.env`
- Ensure values are not placeholders (`YOUR_...`, `change-me`, etc.)
- Restart the backend after editing `.env`

In the browser: connect MetaMask → app should prompt you to switch to **Sepolia**.

---

## Step 9 — End-to-end test flow

| Step | Who | Action |
|------|-----|--------|
| 1 | Anyone | Connect MetaMask on **Sepolia** |
| 2 | Owner | Login `sophia@chainestate.io` / `DemoPassword123!` |
| 3 | Owner | **Create Property** — set **Escrow price (Sepolia ETH)** e.g. `0.01` |
| 4 | Admin | Login `admin@chainestate.io` → approve listing |
| 5 | Buyer | Login `elena@chainestate.io` → inquiry → owner approves |
| 6 | Buyer | **Fund Escrow** — MetaMask sends `priceEth` to contract |
| 7 | Owner | **Escrow & Sales** → **Confirm Sale** — MetaMask signs |
| 8 | Anyone | Property page → **Verify Ownership**; Admin → **Ownership Records** |

### Escrow amounts

- **`priceEth`** on each listing = Sepolia ETH locked in escrow (default `0.01`)
- **USD price** is display-only; on-chain always uses `priceEth`

---

## Environment reference (quick copy)

```env
# backend/.env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=0x...deployer_test_wallet...
CONTRACT_ADDRESS=0x...deployed...
DEPLOYER_PRIVATE_KEY=0x...same_as_private_key...
ALCHEMY_API_KEY=YOUR_KEY
ETHERSCAN_API_KEY=                    # optional

# frontend/.env (or backend/.env for Docker build)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...same_as_contract_address...
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Useful commands

```bash
cd backend

npm run contracts:compile           # compile Solidity
npm run contracts:deploy:sepolia      # deploy to Sepolia
npm run contracts:deploy:local      # deploy to local Hardhat node
npm run contracts:node                # start local chain (dev only)
npm run start:dev                     # API with blockchain env
```

---

## Block explorer

| Resource | URL |
|----------|-----|
| Sepolia Etherscan | https://sepolia.etherscan.io |
| Transaction | `https://sepolia.etherscan.io/tx/{hash}` |
| Address | `https://sepolia.etherscan.io/address/{address}` |
| NFT token | `https://sepolia.etherscan.io/token/{contract}?a={tokenId}` |

---

## Troubleshooting

### `Hardhat only supports ESM projects`

Hardhat **v3** requires `"type": "module"` in `package.json`. This project uses **Hardhat 2.x** with NestJS (CommonJS). Run:

```bash
cd backend
npm install
npm run contracts:compile
```

Do **not** run `npm pkg set type=module` — it can break the NestJS API.

### `Insufficient balance` on faucet (mainnet message)

Use [Alchemy](https://www.alchemy.com/faucets/ethereum-sepolia) or [Google Cloud](https://cloud.google.com/application/web3/faucet/ethereum/sepolia) faucet instead. Stay on **Sepolia** network in MetaMask.

### `Blockchain not configured` in API logs

Placeholders in `.env` are rejected. Set real `SEPOLIA_RPC_URL`, `PRIVATE_KEY`, and `CONTRACT_ADDRESS`, then restart.

### Mint skipped / no on-chain token ID

- Deploy contract first (`npm run contracts:deploy:sepolia`)
- Set `CONTRACT_ADDRESS` and restart backend
- Deployer wallet needs Sepolia ETH for gas

### MetaMask wrong network

App enforces Sepolia. Switch network in MetaMask when prompted.

### Docker: blockchain works locally but not in containers

- Put vars in **`backend/.env`** (not only `frontend/.env`)
- Include `NEXT_PUBLIC_CONTRACT_ADDRESS` in `backend/.env`
- Rebuild: `docker compose up --build`

### `EADDRINUSE` port 3001

Stop Docker backend or local `npm run start:dev` — only one API instance at a time.

---

## Security checklist before pushing to GitHub

- [ ] `.env` files are **not** committed (check `git status`)
- [ ] Only `.env.example` files are in the repo
- [ ] Test wallet private key is **not** your main wallet
- [ ] Sepolia-only — no mainnet keys in the project

See also: [DOCKER.md](./DOCKER.md) · [README.md](./README.md)
