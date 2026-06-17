# ChainEstate — Blockchain Real Estate Marketplace

Monorepo with a **Next.js** frontend, **NestJS** API, **MongoDB**, and optional **Sepolia** smart-contract integration.

## Run everything with Docker (recommended)

```bash
cd backend
cp .env.example .env   # optional — defaults work for local demo
docker compose up --build
```

| Service  | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| API      | http://localhost:3001/api |
| MongoDB  | localhost:27017 |

See [DOCKER.md](./DOCKER.md) for demo credentials, logs, and troubleshooting.

## Blockchain (Phase 3)

Deploy the Sepolia smart contract and enable on-chain property deeds, escrow, and ownership verification:

See [BLOCKCHAIN.md](./BLOCKCHAIN.md).

## Local development (without Docker)

```bash
# Terminal 1 — MongoDB (or use Docker: docker run -d -p 27017:27017 mongo:7)
cd backend && cp .env.example .env && npm install && npm run start:dev

# Terminal 2
cd frontend && cp .env.example .env && npm install && npm run dev
```

## Environment files

| File | Git |
|------|-----|
| `.env.example`, `backend/.env.example`, `frontend/.env.example` | ✅ Commit |
| `.env`, `backend/.env`, `frontend/.env` | ❌ Never commit (in `.gitignore`) |

Copy the relevant `.env.example` to `.env` before running locally or with Docker.
