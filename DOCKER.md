# ChainEstate — Docker (one command)

Run MongoDB, NestJS API, and Next.js frontend together.

## Where to run Docker

Run all Docker commands from the **`backend/`** folder — it contains `docker-compose.yml`:

```
Real-Estate-Blockchain-Marketplace/
├── backend/
│   ├── docker-compose.yml   ← run commands here
│   ├── .env.example
│   └── Dockerfile
├── frontend/
└── ...
```

**Windows (PowerShell):**

```powershell
cd C:\path\to\Real-Estate-Blockchain-Marketplace\backend
docker compose up --build
```

**macOS / Linux:**

```bash
cd /path/to/Real-Estate-Blockchain-Marketplace/backend
docker compose up --build
```

## Quick start

```bash
cd backend

# 1. (Optional) Create your local env file — not committed to git
cp .env.example .env

# 2. Edit .env if needed (JWT_SECRET, optional blockchain keys)
#    Skip step 1–2 to use built-in demo defaults.

# 3. Start everything
docker compose up --build
```

Open:

| Service   | URL |
|-----------|-----|
| Frontend  | http://localhost:3000 |
| Backend   | http://localhost:3001/api |
| MongoDB   | localhost:27017 (internal + exposed) |

## Demo login (auto-seeded on first backend start)

| Role  | Email | Password |
|-------|-------|----------|
| Buyer | `elena@chainestate.io` | `DemoPassword123!` |
| Owner | `sophia@chainestate.io` | `DemoPassword123!` |
| Admin | `admin@chainestate.io` | `DemoPassword123!` |

## Useful commands

Run these from the **`backend/`** folder:

```bash
# Run in background
docker compose up --build -d

# View logs
docker compose logs -f

# Stop
docker compose down

# Stop and remove database volume (fresh seed)
docker compose down -v
```

## Environment files

| File | Commit to git? | Purpose |
|------|----------------|---------|
| `backend/.env.example` | Yes | Template with safe defaults |
| `backend/.env` | **No** | Your secrets & Docker overrides |
| `frontend/.env` | **No** | Optional local frontend-only dev |

Docker Compose reads **`backend/.env`** (same folder as `docker-compose.yml`).

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  frontend   │────▶│   backend   │────▶│   mongodb   │
│  :3000      │     │   :3001     │     │   :27017    │
└─────────────┘     └─────────────┘     └─────────────┘
```

Frontend `NEXT_PUBLIC_*` URLs must be reachable from **your browser** (use `localhost`, not Docker service names).
