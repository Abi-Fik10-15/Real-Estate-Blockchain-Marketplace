# ChainEstate Backend

NestJS REST API for the ChainEstate blockchain real estate marketplace.

## Stack

- **NestJS 11** — modular REST API
- **MongoDB + Mongoose** — persistence
- **Passport JWT** — authentication
- **Ethers.js v6** — Sepolia smart contract integration
- **Socket.IO** — real-time notifications

## Folder Structure

```
backend/
├── src/
│   ├── auth/           # Register, login, JWT profile
│   ├── users/          # User schema & admin/agent listings
│   ├── properties/     # Property CRUD, filters, approval
│   ├── inquiries/      # Buyer inquiries & visit requests
│   ├── transactions/   # Sale/rental transaction lifecycle
│   ├── blockchain/     # Sepolia contract service + ABI
│   ├── notifications/  # Socket.IO gateway & emitters
│   ├── config/         # Typed environment configuration
│   ├── common/         # Shared decorators & guards
│   └── health/         # Health check endpoint
├── Dockerfile
├── docker-compose.yml  # MongoDB + API + frontend (run from backend/)
└── .env.example
```

## Quick Start (Local)

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

API base URL: `http://localhost:3001/api`

## Quick Start (Docker)

From the **`backend/`** folder:

```bash
cd backend
cp .env.example .env   # optional
docker compose up --build
```

Services:

| Service   | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost:3000        |
| Backend   | http://localhost:3001/api    |
| MongoDB   | mongodb://localhost:27017    |

## API Endpoints

### Auth
| Method | Path              | Auth | Description        |
|--------|-------------------|------|--------------------|
| POST   | `/auth/register`  | —    | Create account     |
| POST   | `/auth/login`     | —    | Get JWT token      |
| GET    | `/auth/profile`   | JWT  | Current user       |
| PATCH  | `/auth/profile`   | JWT  | Update profile     |

### Properties
| Method | Path                        | Auth  | Description          |
|--------|-----------------------------|-------|----------------------|
| GET    | `/properties`               | —     | List with filters    |
| GET    | `/properties/:id`           | —     | Property detail      |
| POST   | `/properties`               | JWT   | Create (owner/admin) |
| PATCH  | `/properties/:id/approve`   | admin | Verify listing       |

### Inquiries, Transactions, Blockchain
See Phase 2 integration plan for full endpoint mapping.

## Environment Variables

Copy `.env.example` to `.env`:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/chainestate
JWT_SECRET=change-me-in-production
FRONTEND_ORIGIN=http://localhost:3000

# Optional — blockchain (Sepolia)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=0x...
CONTRACT_ADDRESS=0x...
```

## Verification

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"TestPassword123!","role":"buyer","name":"Test User"}'

# List properties
curl http://localhost:3001/api/properties
```
