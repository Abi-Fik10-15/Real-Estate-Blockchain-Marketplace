# 🏠 ChainEstate — Blockchain Real Estate Marketplace

> A full-stack, decentralised real estate marketplace where properties are listed, bought, and transferred on-chain — powered by Ethereum smart contracts and a modern TypeScript monorepo.

![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?style=flat-square&logo=solidity)
![Hardhat](https://img.shields.io/badge/Hardhat-2.x-F5CB5C?style=flat-square)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ✨ Features

- 🔗 **On-chain ownership** — property listings and transfers recorded on Ethereum / Polygon smart contracts
- 🔐 **JWT-secured API** — NestJS backend with role-based authentication
- 🏘️ **Rich property explorer** — filterable, searchable listings with image carousels and analytics dashboards
- 📋 **Smart contract suite** — Solidity 0.8.24 contracts deployable to Sepolia, Polygon Mumbai, or Polygon Mainnet
- 🐳 **One-command Docker setup** — the entire stack (frontend + backend + MongoDB) spins up with a single command
- 🧪 **Hardhat test environment** — full local blockchain node with gas reporting

---

## 🗂️ Project Structure

```
Real-Estate-Blockchain-Marketplace/
├── frontend/          # React 19 + Vite + TanStack Router SPA
├── backend/           # NestJS REST API + MongoDB
├── contracts/         # Solidity smart contracts
├── src/               # Shared utilities / types
├── scripts/           # Hardhat deployment & maintenance scripts
├── test/              # Smart contract test suite
├── hardhat.config.ts  # Hardhat networks, Etherscan, gas reporter
├── .env.example       # Root environment template (copy → .env)
└── DOCKER.md          # Full Docker usage guide
```

---

## 🛠️ Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite 8 + TanStack Start |
| Routing | TanStack Router |
| Data fetching | TanStack Query |
| UI components | Radix UI primitives + shadcn/ui |
| Styling | Tailwind CSS v4 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Notifications | Sonner |
| Package manager | Bun |

### Backend
| Layer | Technology |
|---|---|
| Framework | NestJS (Node.js) |
| Database | MongoDB 7 |
| Auth | JWT (RS256) |
| API | REST |

### Blockchain
| Layer | Technology |
|---|---|
| Language | Solidity 0.8.24 |
| Dev environment | Hardhat |
| Bindings | Ethers v6 + TypeChain |
| RPC provider | Alchemy |
| Testnets | Sepolia · Polygon Mumbai |
| Mainnet | Polygon |

---

## 🚀 Getting Started

### Prerequisites

- [Docker & Docker Compose](https://docs.docker.com/get-docker/) *(recommended)*
- Node.js 20+ and [Bun](https://bun.sh/) *(for local dev)*
- An [Alchemy](https://alchemy.com/) account *(for testnet/mainnet deployment)*

---

### ⚡ Option A — Docker (Recommended)

The fastest way to run the full stack locally:

```bash
# 1. Clone the repo
git clone https://github.com/Abi-Fik10-15/Real-Estate-Blockchain-Marketplace.git
cd Real-Estate-Blockchain-Marketplace

# 2. Copy environment file
cp .env.example .env

# 3. Start everything
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:3001/api |
| MongoDB | localhost:27017 |

> See [DOCKER.md](./DOCKER.md) for demo credentials, volume management, and troubleshooting.

---

### 🔧 Option B — Local Development (without Docker)

**Terminal 1 — Backend**
```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

**Terminal 2 — Frontend**
```bash
cd frontend
cp .env.example .env
bun install
bun run dev
```

> MongoDB must be running. Quick start: `docker run -d -p 27017:27017 mongo:7`

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
# Ports
FRONTEND_PORT=3000
BACKEND_PORT=3001

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_CONTRACT_ADDRESS=        # deployed contract address

# Backend
JWT_SECRET=change-me-to-a-long-random-string
MONGODB_URI=mongodb://localhost:27017/chainestate

# Blockchain (Sepolia / Polygon deployment)
SEPOLIA_RPC_URL=
PRIVATE_KEY=
ALCHEMY_API_KEY=
ETHERSCAN_API_KEY=
DEPLOYER_PRIVATE_KEY=
```

> ⚠️ **Never commit `.env`** — it is listed in `.gitignore`.

---

## 📜 Smart Contract Deployment

Contracts live in `/contracts` and are managed by Hardhat.

```bash
# Compile contracts
bun hardhat compile

# Run tests (local node)
bun hardhat test

# Deploy to local node
bun hardhat run scripts/deploy.ts --network localhost

# Deploy to Sepolia testnet
bun hardhat run scripts/deploy.ts --network sepolia

# Verify on Etherscan
bun hardhat verify --network sepolia <DEPLOYED_ADDRESS>
```

### Supported Networks

| Network | Chain ID | Purpose |
|---|---|---|
| hardhat | 31337 | Local testing |
| localhost | 31337 | Local node |
| sepolia | 11155111 | Ethereum testnet |
| mumbai | 80001 | Polygon testnet |
| polygon | 137 | Polygon mainnet |

---

## 📦 Available Scripts

From the project root:

```bash
bun run dev          # Start frontend dev server
bun run build        # Production build
bun run preview      # Preview production build
bun run lint         # ESLint check
bun run format       # Prettier format
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit with conventional commits: `git commit -m "feat: add property tokenization"`
4. Push and open a Pull Request

Please run `bun run lint` and `bun run format` before submitting.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

## 👤 Author

**Abraham Fikadu**
- GitHub: [@Abi-Fik10-15](https://github.com/Abi-Fik10-15)
- LinkedIn: [linkedin.com/in/abrahamfikadu](https://linkedin.com/in/abrahamfikadu)

---

> *Built with ❤️ at the intersection of Web3 and real estate.*
