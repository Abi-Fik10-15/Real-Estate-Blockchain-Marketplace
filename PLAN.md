# ChainEstate - Current-State Engineering Plan

Last updated: 2026-06-17  
Scope: `frontend/` + `backend/` + blockchain integration path

---

## Purpose

This plan tracks the integrated MVP state (Next.js frontend + NestJS backend + MongoDB + optional Sepolia contract hooks) and what remains for production readiness.

It is updated after each meaningful delivery increment — not only at major milestones.

---

## Recent Progress (Session Updates)

### Backend
- [x] **Local dev auth unblock:** `AppConfigService` falls back to in-memory MongoDB when local Mongo is unreachable (non-production), or when `MONGODB_USE_MEMORY=true`.
- [x] **Saved properties API:** user bookmarks persisted on the server via `savedPropertyIds` on the User model.
  - `GET /api/users/saved` — list saved property IDs (JWT)
  - `POST /api/users/saved/:propertyId` — save (JWT)
  - `DELETE /api/users/saved/:propertyId` — unsave (JWT)

### Frontend
- [x] **Buyer property detail UX:** compact hero card layout, badges above price, stats row without icons, primary-colored titles.
- [x] **Ownership verification card:** state expressed via background wash instead of colored borders.
- [x] **Buyer nav cleanup:** removed static "Property Detail" nav item (detail is reached from marketplace cards).
- [x] **Saved properties flow:** optimistic save/unsave on property pages, server sync on buyer login, dedicated `/dashboard/buyer/saved` page wired to API.
- [x] **Leaflet stability fix:** map renders only after client mount; invalid `0,0` coordinates show fallback UI.

---

## Current Architecture Snapshot

### Frontend (`frontend/`)
- Next.js 15 App Router + React 19 + TypeScript.
- Dashboard flows for buyer/owner/agent/admin are implemented.
- Axios API client with JWT interceptors in `lib/api.ts`.
- Ethers v6 browser client in `lib/contract.ts`.
- Socket.IO notifications via `hooks/use-notifications.ts`.
- Zustand stores + partial React Query usage (hybrid state architecture).
- Buyer saved listings: `store/saved-store.ts` (optimistic toggle + server sync) + `app/dashboard/buyer/saved/page.tsx`.

### Backend (`backend/`)
- NestJS 11 modular API with global validation and `/api` prefix.
- MongoDB (Mongoose) schemas and modules for users, properties, inquiries, transactions.
- JWT auth (`passport-jwt`) + role guard/decorators.
- Socket.IO gateway (`notifications`) with JWT handshake verification.
- Blockchain service (`ethers`) for mint/ownership/escrow primitives.
- User bookmarks stored in `users.savedPropertyIds` (ObjectId refs to properties).

### Blockchain
- Solidity contract exists: `contracts/RealEstateMarketplace.sol`.
- Backend and frontend both include blockchain integration code.
- Integration is partial: database state and on-chain state are not fully synchronized.

---

## Delivery Status (Reality Check)

### Completed
- [x] Full frontend app structure with role-based dashboard UX.
- [x] NestJS backend with core modules and DTO validation.
- [x] JWT login/register/profile flow wired frontend ↔ backend.
- [x] Property/inquiry/transaction API integration from frontend.
- [x] Socket notification events for inquiries, escrow, completion, property approval.
- [x] Contract client utilities in frontend and blockchain service in backend.
- [x] **Saved/bookmarked properties** — backend persistence + buyer UI (property page toggle + saved listings page).
- [x] **Local dev resilience** — backend starts without Docker/local Mongo via in-memory fallback.
- [x] **Buyer property detail page** — professional compact layout (Phase 2 UX polish, buyer path).

### Partially Complete
- [~] Blockchain transaction lifecycle (mint/escrow/confirm) is implemented in pieces but not fully consistent end-to-end.
- [~] Role-based access exists, but resource-level authorization checks are incomplete on some endpoints.
- [~] Frontend role routing is partly guarded (buyer subtree has guard; owner/agent/admin are not consistently protected).
- [~] Owner/agent dashboards still contain hardcoded mock user IDs in some views.
- [~] Duplicate property detail implementations (public vs buyer dashboard) — not yet consolidated into one shared component.

### Not Complete (Production Critical)
- [ ] Security hardening (token strategy, admin registration restrictions, rate limiting).
- [ ] Test coverage (frontend + backend).
- [ ] Stable data architecture on frontend (remove Zustand/React Query duplication for server state).
- [ ] Full docs parity (`README` still lags in places).
- [ ] Operational readiness (health depth, observability, CI quality gates).

---

## Confirmed Gaps From Current Code

### Security and Authorization
- Registration currently allows privileged role assignment in request payload.
- JWT is stored in localStorage (XSS risk) and route protection is largely client-side.
- Resource ownership checks are missing on some mutation flows.
- Demo seed accounts can appear in non-dev environments if not gated.

### Blockchain Consistency
- Escrow/confirm flows are not uniformly wired across API, UI, and chain execution.
- Some transaction paths update DB state without guaranteed on-chain confirmation.
- Property minting and `blockchainTokenId` lifecycle is not fully standardized.

### Frontend Architecture
- Owner/agent dashboards contain hardcoded mock identifiers in multiple views.
- Zustand + React Query overlap causes potential stale/duplicated state behavior.
- Duplicate implementations of similar property detail screens increase maintenance cost.

### Quality and Ops
- No meaningful automated test suites currently drive confidence.
- Lint/test/documentation gates are not strict enough for release workflows.

---

## Updated Execution Roadmap

### Phase 0 - Immediate Stabilization (1-2 days)
Goal: remove the highest-risk defects before further feature work.

- Restrict self-registration role to safe defaults (for example, buyer only).
- Remove hardcoded user IDs in owner/agent pages; use authenticated user identity.
- Enforce role checks on all dashboard route groups (owner/agent/admin), not only buyer.
- Gate seed behavior to development-only mode.
- Align escrow update permissions and transaction mutation authorization.

Exit criteria:
- No dashboard depends on mock user IDs.
- No public path allows privilege escalation by request payload alone.

### Phase 1 - End-to-End Transaction Correctness (2-4 days)
Goal: make purchase flow deterministic across UI, API, and chain.

- Define one canonical flow for sale: inquiry → transaction → escrow → confirm → property status update.
- Ensure `markEscrow` and `confirmSale` semantics match real chain behavior.
- Ensure token minting writes/updates property chain linkage consistently.
- Add explicit failure handling and reconciliation when chain tx fails or is delayed.
- Add ownership checks before confirm/finalize transitions.

Exit criteria:
- One documented happy path for sale completion that is reproducible and testable.
- DB state and chain state remain consistent after completion.

### Phase 2 - Frontend Data Architecture Consolidation (2-3 days)
Goal: eliminate state drift and reduce duplicated logic.

- Choose primary async state model (recommended: React Query for server state).
- Limit Zustand to session/UI local concerns (auth, theme, wallet session, saved IDs as cache only).
- Refactor duplicate property detail pages into shared view components.
- Ensure API mutation invalidation/update strategy is consistent.
- Improve user-facing error handling (replace silent catches with actionable feedback).

Exit criteria:
- No duplicated server-truth stores for the same entity lifecycle.
- Critical CRUD and transaction screens reflect fresh state reliably.

### Phase 3 - Security and Production Hardening (3-5 days)
Goal: move from MVP to deployable baseline.

- Migrate auth token handling toward safer transport (httpOnly cookie/BFF strategy or equivalent hardening).
- Add rate limiting and brute-force protections on auth endpoints.
- Validate all raw body params with DTOs on backend.
- Add deeper health checks (database and integration readiness).
- Unify CORS and websocket origin policy management through central config.
- Replace in-memory Mongo fallback with explicit production Mongo requirement (fallback is dev-only).

Exit criteria:
- Security review items have explicit owner + resolution status.
- Runtime defaults are safe in production mode.

### Phase 4 - Testing, CI, and Documentation (2-4 days)
Goal: create confidence and repeatability for team delivery.

- Add backend unit tests (auth service, guards, saved properties, service authorization paths).
- Add API integration/e2e tests for auth/property/inquiry/transaction/saved core flows.
- Add frontend tests for auth routing, saved toggle, key dashboard rendering, and transaction UI flows.
- Enforce lint/test checks in CI and fail builds on regressions.
- Update `README` and architecture docs to match current system behavior.

Exit criteria:
- CI has required green checks for lint + tests.
- Documentation matches what is actually deployed and callable.

---

## Priority Backlog (Ordered)

### P0 (Do now)
1. Remove hardcoded owner/agent IDs in frontend dashboards.
2. Restrict registration role behavior and patch authorization holes.
3. Guard all dashboard role segments consistently.

### P1
4. Complete seller-side confirm-sale UI/API/chain flow.
5. Define canonical state ownership pattern (Query vs Zustand).
6. Block seed/demo users in production runtime.
7. Extract shared `PropertyDetailView` from public + buyer dashboard pages.

### P2
8. Add DTO validation coverage for currently raw body params.
9. Add paginated list APIs for scale-sensitive endpoints.
10. Add notification center persistence (not only badge/toast).
11. Geocode property locations on create (currently defaults to `lat: 0, lng: 0`).

### P3
12. Add SEO/accessibility completeness for public listing pages.
13. Add upload/document pipeline for property media.
14. Add observability (structured logs + basic metrics).

---

## API Surface (Saved Properties)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users/saved` | JWT | Returns array of saved property ID strings |
| POST | `/api/users/saved/:propertyId` | JWT | Adds property to user's saved list |
| DELETE | `/api/users/saved/:propertyId` | JWT | Removes property from saved list |

Frontend integration:
- `services/api.ts` — `getSavedPropertyIds`, `saveProperty`, `unsaveProperty`
- `store/saved-store.ts` — optimistic toggle + `syncWithServer()`
- `components/app-bootstrap.tsx` — syncs saved IDs when buyer session is active
- `app/dashboard/buyer/marketplace/property/[id]/page.tsx` — Save button
- `app/dashboard/buyer/saved/page.tsx` — dedicated saved listings view

---

## Verification Matrix

Run after each phase:

```bash
# Frontend
cd frontend
npm run lint
npm run build

# Backend
cd ../backend
npm run lint
npm run build
npm run test
```

### Local dev startup

```bash
# Backend (uses in-memory Mongo if local Mongo unavailable)
cd backend
npm run start:dev

# Frontend
cd ../frontend
npm run dev
```

### Runtime smoke checks

```bash
# Health
curl http://localhost:3001/api/health

# Auth register/login
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"smoke@test.com\",\"password\":\"TestPassword123!\",\"name\":\"Smoke User\",\"role\":\"buyer\"}"

# Properties
curl http://localhost:3001/api/properties

# Saved properties (replace TOKEN and PROPERTY_ID)
curl http://localhost:3001/api/users/saved -H "Authorization: Bearer TOKEN"
curl -X POST http://localhost:3001/api/users/saved/PROPERTY_ID -H "Authorization: Bearer TOKEN"
curl -X DELETE http://localhost:3001/api/users/saved/PROPERTY_ID -H "Authorization: Bearer TOKEN"
```

### Manual UX checks
- Login as buyer → open property detail → toggle Save → visit Saved Properties page → listing appears.
- Refresh page → saved state persists (server-backed after sync).
- Unsave from saved page or property detail → listing removed from saved page.
- Mint property token and confirm token linkage in property record.
- Trigger escrow from buyer flow and verify status transitions.
- Confirm sale and validate final property/transaction status on API response.

---

## Environment Variable Baseline

Frontend (`frontend/.env`)

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001
NEXT_PUBLIC_CONTRACT_ADDRESS=0x_your_contract_address
```

Backend (`backend/.env`)

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/chainestate
# Optional: force in-memory Mongo in development (data resets on restart)
MONGODB_USE_MEMORY=false
JWT_SECRET=replace_with_strong_secret
JWT_EXPIRES_IN=7d
FRONTEND_ORIGIN=http://localhost:3000,http://localhost:5173
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_project
PRIVATE_KEY=0x_your_private_key
CONTRACT_ADDRESS=0x_your_contract_address
```

**Note:** If Docker/local Mongo is not running, the backend automatically falls back to in-memory MongoDB in non-production (via `mongodb-memory-server`). Set `MONGODB_USE_MEMORY=true` to force that behavior explicitly.

---

## Definition of Done For "Production Ready"

The project is considered production-ready when all are true:
- Security-critical findings are closed (authz, token handling, privileged-role creation).
- End-to-end property sale flow is chain-aware and consistent with DB state.
- Frontend state architecture is consolidated and deterministic.
- Automated tests cover critical paths and run in CI.
- Documentation and operational checks reflect the live system.
- Production deployments use real MongoDB only (no in-memory fallback).
