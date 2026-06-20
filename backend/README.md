# ChainEstate Backend

NestJS REST API for the ChainEstate blockchain real estate marketplace.

## Stack

- **NestJS 11** — modular REST API
- **MongoDB + Mongoose** — persistence
- **Passport JWT** — authentication
- **Ethers.js v6** — Sepolia smart contract integration
- **Socket.IO** — real-time notifications
- **Swagger / OpenAPI** — interactive API docs

## Quick Start (Local)

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

| Resource | URL |
|----------|-----|
| REST API | http://localhost:3001/api |
| **Swagger UI** | http://localhost:3001/api/docs |
| **OpenAPI JSON** | http://localhost:3001/api/docs/openapi.json |
| Health | http://localhost:3001/api/health |

## Swagger — test APIs (not localhost-only)

Swagger is wired for **production and local** via the **Servers** dropdown:

1. Open **http://localhost:3001/api/docs** (or your deployed URL + `/api/docs`).
2. Set **`API_PUBLIC_URL`** in `.env` to your deployed API origin (e.g. `https://api.yourdomain.com` — no `/api` suffix).
3. In Swagger, choose **Production (API_PUBLIC_URL)** from the server dropdown — requests go to your live API, not hardcoded localhost.
4. Call **POST /auth/login**, copy `accessToken`.
5. Click **Authorize**, enter: `Bearer <your-token>`.
6. Test any endpoint from the UI.

```env
# backend/.env
API_PUBLIC_URL=https://api.yourdomain.com
SWAGGER_ENABLED=true
SWAGGER_PATH=docs
```

Import **`/api/docs/openapi.json`** into Postman, Insomnia, or Hoppscotch for offline testing.

## Docker

```bash
cd backend
cp .env.example .env
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:3001/api |
| Swagger | http://localhost:3001/api/docs |
| MongoDB | mongodb://localhost:27017 |

## Environment Variables

See `.env.example`. Production requirements:

| Variable | Required in prod | Notes |
|----------|------------------|-------|
| `JWT_SECRET` | Yes | 32+ chars, not a placeholder |
| `MONGODB_URI` | Yes | Real MongoDB connection string |
| `FRONTEND_ORIGIN` | Yes | Comma-separated allowed origins |
| `API_PUBLIC_URL` | Recommended | Powers Swagger production server |
| `SEPOLIA_RPC_URL` | Optional | Blockchain features |
| `PRIVATE_KEY` | Optional | Backend minting / txs |
| `CONTRACT_ADDRESS` | Optional | Deployed marketplace contract |
| `CLOUDINARY_*` | Optional | Image uploads (falls back to base64) |
| `SWAGGER_ENABLED` | Optional | Default `true`; set `false` to hide docs |

## API Modules

| Tag | Base path | Description |
|-----|-----------|-------------|
| health | `/api` | Health check |
| auth | `/api/auth` | Register, login, profile, avatar |
| users | `/api/users` | Agents list, saved properties |
| properties | `/api/properties` | CRUD, upload, approve |
| inquiries | `/api/inquiries` | Buyer inquiries |
| transactions | `/api/transactions` | Sales & escrow |
| kyc | `/api/kyc` | Identity verification submissions |
| blockchain | `/api/blockchain` | Sepolia reads & mint |

Full request/response schemas: **Swagger UI** at `/api/docs`.

## Production checklist

| Done | Item |
|------|------|
| ✅ | JWT auth + role guards |
| ✅ | Swagger on all controllers |
| ✅ | Configurable public API URL for Swagger |
| ✅ | OpenAPI JSON export |
| ✅ | Docker healthchecks |
| ✅ | On-chain verification (Sepolia) |
| ✅ | Profile settings + avatar upload |
| ✅ | KYC document upload + admin review |
| ⬜ | Email notifications (currently localStorage toggle) |
| ⬜ | Rate limiting / helmet hardening |
| ⬜ | Deploy to cloud with HTTPS + secrets manager |

## Build

```bash
npm run build
npm run start:prod
```
