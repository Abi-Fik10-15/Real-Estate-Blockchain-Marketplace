# ChainEstate - Current-State Engineering Plan

Last updated: 2026-06-20 (buyer UI overhaul + property detail polish)  
Branch: `feat/ui-overhaul-auth-email-verification`  
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
- [x] **Saved properties user-ID fix:** `resolveUserId()` helper handles lean JWT user docs (`_id` vs `id`) so save/unsave no longer 404 silently.
- [x] **Email verification (Resend):** registration no longer returns a JWT immediately; users must verify email before login.
  - User model fields: `emailVerified`, `emailVerificationToken`, `emailVerificationExpires`
  - `POST /api/auth/register` — creates unverified user, sends verification email
  - `GET /api/auth/verify-email?token=` — validates token, returns JWT + user
  - `POST /api/auth/resend-verification` — resends link (anti-enumeration response)
  - `POST /api/auth/login` — rejects unverified accounts with explicit message
  - `MailService` via **Resend** (`RESEND_API_KEY`); dev fallback logs link to console when key is unset
  - Demo seed users created with `emailVerified: true`
- [x] **Admin transaction audit API:** `GET /api/transactions` (admin-only) returns full platform transaction ledger.
- [x] **Solidity naming fix:** `transferOwnership(uint256,address)` renamed to `transferPropertyOwnership` to avoid shadowing OpenZeppelin `Ownable.transferOwnership`; event renamed to `PropertyOwnershipTransferred`. ABIs synced in backend + frontend.

### Frontend — Buyer dashboard UI overhaul (shared design language)
- [x] **Design tokens applied across buyer subtree:** summary bars (`rounded-xl border-border/60 bg-card`), primary counts/titles, muted subtitles/descriptions, dashed empty states, outline CTAs, rose save hearts, `roleLabel="Buyer"`.
- [x] **Marketplace:** `marketplace-view.tsx` — hero search, grid/list/map toggle, empty state; `buyer/marketplace/page.tsx` simplified (removed duplicate toggle/dead imports).
- [x] **Property cards & filters:** `property-card.tsx` (16:10 images, chainId badge, list view, save toggle props); `property-filters.tsx` (outline styling, section dividers).
- [x] **Map view:** `map-based-listing.tsx` — light embed, bounds fit, sidebar cards (no duplicate page heading in dashboard context).
- [x] **Buyer home:** `buyer/page.tsx` + `buyer/layout.tsx` — welcome summary bar, KPI cards, loading skeleton aligned with dashboard shell.
- [x] **Saved:** `buyer/saved/page.tsx` — summary bar + `PropertyCard` grid, server-synced bookmarks (`saved-store.ts` syncGeneration, optimistic toggle).
- [x] **Requests:** `buyer/requests/page.tsx` + `inquiry-list.tsx` — summary bar, card list, status badges, empty state.
- [x] **Verification:** `buyer/verification/page.tsx` — on-chain verification workflow UI aligned with requests/saved patterns.
- [x] **Settings:** `profile-settings.tsx`, `kyc-verification.tsx`, `buyer/settings/page.tsx` — summary bar, card layout (subtitles stay muted; section titles primary).
- [x] **Sandbox:** `dashboard/sandbox/page.tsx` — ledger explorer UI aligned with buyer dashboard styling.
- [x] **Buyer property detail:** `buyer/marketplace/property/[id]/page.tsx` — summary bar (back link, `text-primary-500` title, listing/verified/save badges), 16:10 hero, stats pills, gallery/map cards, sticky sidebar (inquiries + activity timeline), loading/not-found states.
- [x] **Buyer nav cleanup:** removed static "Property Detail" nav item (detail is reached from marketplace cards).
- [x] **Dev cache recovery:** `npm run dev:clean` script clears `.next` before starting (fixes corrupted webpack pack / spurious 404s on Windows after hot reload).
- [x] **Leaflet stability fix:** map renders only after client mount; invalid `0,0` coordinates show fallback UI.
- [x] **Owner rental yield KPI:** gross rental yield card on owner dashboard derived from completed rental transactions.
- [x] **Owner tenant management:** `/dashboard/owner/tenants` — active/pending rental tenants, Etherscan links, tenant names from inquiry store.
- [x] **Admin transaction audit:** `/dashboard/admin/audit` — searchable/filterable ledger of all platform transactions.
- [x] **Nav wiring:** `OWNER_NAV` → Tenant Management; `ADMIN_NAV` → Transaction Audit.
- [x] **Email verification UX:**
  - `/register` — post-submit "Check your inbox" screen with resend button (no auto-login)
  - `/verify-email?token=` — verifies token, logs user in, redirects to role dashboard
  - `/login` — amber banner when login blocked due to unverified email
  - `auth-store`: `register()` no longer sets token; `loginAfterVerify()` for post-verification session
- [x] **Merge conflict cleanup:** resolved markers in `next.config.ts` and `owner/properties/new/page.tsx`.
- [x] **Admin charts dependency:** `recharts` installed for admin analytics components.

---

## Current Architecture Snapshot

### Frontend (`frontend/`)
- Next.js 15 App Router + React 19 + TypeScript.
- Dashboard flows for buyer/owner/agent/admin are implemented.
- Axios API client with JWT interceptors in `lib/api.ts`.
- Ethers v6 browser client in `lib/contract.ts` (calls `transferPropertyOwnership` on-chain).
- Socket.IO notifications via `hooks/use-notifications.ts`.
- Zustand stores + partial React Query usage (hybrid state architecture).
- Buyer saved listings: `store/saved-store.ts` (optimistic toggle + server sync) + `app/dashboard/buyer/saved/page.tsx`.
- Marketplace: grid/list/map views; map uses `MapBasedListing` with dynamic import.
- Buyer dashboard pages share a consistent summary-bar + card layout pattern (home, marketplace, saved, requests, verification, settings, sandbox, property detail).
- Auth pages: register → email verification → login (Resend-backed on backend).

### Backend (`backend/`)
- NestJS 11 modular API with global validation and `/api` prefix.
- MongoDB (Mongoose) schemas and modules for users, properties, inquiries, transactions, KYC.
- JWT auth (`passport-jwt`) + role guard/decorators.
- Email verification via `MailModule` + Resend (`mail/mail.service.ts`).
- Socket.IO gateway (`notifications`) with JWT handshake verification.
- Blockchain service (`ethers`) for mint/ownership/escrow primitives.
- User bookmarks stored in `users.savedPropertyIds` (ObjectId refs to properties).
- `resolveUserId()` utility for consistent user ID resolution from JWT lean docs.

### Blockchain
- Solidity contract: `contracts/RealEstateMarketplace.sol`.
- `transferPropertyOwnership(uint256,address)` — property deed transfer (distinct from contract owner transfer).
- Backend and frontend ABIs aligned; integration is partial — DB state and on-chain state are not fully synchronized.

---

## Delivery Status (Reality Check)

### Completed
- [x] Full frontend app structure with role-based dashboard UX.
- [x] NestJS backend with core modules and DTO validation.
- [x] JWT login/register/profile flow wired frontend ↔ backend.
- [x] **Email verification gate** — register → verify email → login (Resend; console fallback in dev).
- [x] Property/inquiry/transaction API integration from frontend.
- [x] Socket notification events for inquiries, escrow, completion, property approval.
- [x] Contract client utilities in frontend and blockchain service in backend.
- [x] **Saved/bookmarked properties** — backend persistence + buyer UI (property page toggle + saved listings page); user-ID bug fixed.
- [x] **Local dev resilience** — backend starts without Docker/local Mongo via in-memory fallback.
- [x] **Buyer dashboard UI overhaul** — consistent design language across home, marketplace, saved, requests, verification, settings, sandbox, and property detail.
- [x] **Buyer property detail page** — summary bar, hero image, stats pills, inquiry sidebar, activity timeline (buyer dashboard path).
- [x] **Marketplace map view** — grid/list/map toggle with Leaflet map.
- [x] **Owner rental yield panel** — gross yield KPI on owner dashboard.
- [x] **Owner tenant management page** — `/dashboard/owner/tenants`.
- [x] **Admin transaction audit log** — `/dashboard/admin/audit` + `GET /api/transactions`.
- [x] **Solidity transfer naming** — no longer shadows Ownable.

### Partially Complete
- [~] Blockchain transaction lifecycle (mint/escrow/confirm) is implemented in pieces but not fully consistent end-to-end.
- [~] Role-based access exists, but resource-level authorization checks are incomplete on some endpoints.
- [~] Frontend role routing is partly guarded (buyer subtree has guard; owner/agent/admin are not consistently protected).
- [~] Owner/agent dashboards still contain hardcoded mock user IDs in some views (tenant page fixed to use inquiry store for names).
- [~] Duplicate property detail implementations (public `property/[id]` vs buyer dashboard detail) — buyer path polished; shared component extraction still pending.
- [~] **`ownership-verification.tsx` sidebar** on buyer property detail — not yet restyled to match new card/summary patterns.
- [~] **`/verify-email` production build** — may need `<Suspense>` wrapper around `useSearchParams` (Next.js 15 static generation).
- [~] Email delivery in dev requires backend restart after `.env` changes; Resend `onboarding@resend.dev` only delivers to the Resend account owner email until a domain is verified.
- [~] **Next.js dev cache on Windows** — webpack pack files under `.next/cache` can corrupt after restarts; use `npm run dev:clean` when routes return 404 or compile errors reference missing `.pack.gz` files.

### Not Complete (Production Critical)
- [ ] Security hardening (restrict registration role to buyer-only, rate limiting, httpOnly token strategy).
- [ ] Test coverage (frontend + backend).
- [ ] Stable data architecture on frontend (remove Zustand/React Query duplication for server state).
- [ ] Full docs parity (`README` still lags in places).
- [ ] Operational readiness (health depth, observability, CI quality gates).
- [ ] Verified Resend sending domain for production (replace `onboarding@resend.dev`).

---

## Confirmed Gaps From Current Code

### Security and Authorization
- Registration still allows privileged role assignment in request payload (buyer/owner/agent/admin).
- JWT is stored in localStorage (XSS risk) and route protection is largely client-side.
- Resource ownership checks are missing on some mutation flows.
- Demo seed accounts can appear in non-dev environments if not gated.

### Blockchain Consistency
- Escrow/confirm flows are not uniformly wired across API, UI, and chain execution.
- Some transaction paths update DB state without guaranteed on-chain confirmation.
- Property minting and `blockchainTokenId` lifecycle is not fully standardized.
- **Contract redeploy required** if `transferPropertyOwnership` rename has not been deployed to Sepolia yet.

### Frontend Architecture
- Owner/agent dashboards contain hardcoded mock identifiers in some views.
- Zustand + React Query overlap causes potential stale/duplicated state behavior.
- Duplicate implementations of similar property detail screens increase maintenance cost.

### Quality and Ops
- No meaningful automated test suites currently drive confidence.
- Lint/test/documentation gates are not strict enough for release workflows.
- Backend `dist/` must be rebuilt (`npm run build`) if stale — `start:dev` can fail with missing module errors after partial dist cleanup.

---

## Updated Execution Roadmap

### Phase 0 - Immediate Stabilization (1-2 days)
Goal: remove the highest-risk defects before further feature work.

- Restrict self-registration role to safe defaults (for example, buyer only).
- Remove hardcoded user IDs in owner/agent pages; use authenticated user identity.
- Enforce role checks on all dashboard route groups (owner/agent/admin), not only buyer.
- Gate seed behavior to development-only mode.
- Align escrow update permissions and transaction mutation authorization.
- Verify Resend domain + `EMAIL_FROM` for production email delivery.

Exit criteria:
- No dashboard depends on mock user IDs.
- No public path allows privilege escalation by request payload alone.
- Verification emails deliver reliably outside dev console fallback.

### Phase 1 - End-to-End Transaction Correctness (2-4 days)
Goal: make purchase flow deterministic across UI, API, and chain.

- Define one canonical flow for sale: inquiry → transaction → escrow → confirm → property status update.
- Ensure `markEscrow` and `confirmSale` semantics match real chain behavior.
- Ensure token minting writes/updates property chain linkage consistently.
- Redeploy contract with `transferPropertyOwnership` if not already on Sepolia.
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
- Add rate limiting and brute-force protections on auth endpoints (including resend-verification).
- Validate all raw body params with DTOs on backend.
- Add deeper health checks (database, Resend, and integration readiness).
- Unify CORS and websocket origin policy management through central config.
- Replace in-memory Mongo fallback with explicit production Mongo requirement (fallback is dev-only).

Exit criteria:
- Security review items have explicit owner + resolution status.
- Runtime defaults are safe in production mode.

### Phase 4 - Testing, CI, and Documentation (2-4 days)
Goal: create confidence and repeatability for team delivery.

- Add backend unit tests (auth service, email verification, guards, saved properties, service authorization paths).
- Add API integration/e2e tests for auth/register/verify/login, property/inquiry/transaction/saved core flows.
- Add frontend tests for auth routing, email verification UX, saved toggle, key dashboard rendering, and transaction UI flows.
- Enforce lint/test checks in CI and fail builds on regressions.
- Update `README` and architecture docs to match current system behavior.

Exit criteria:
- CI has required green checks for lint + tests.
- Documentation matches what is actually deployed and callable.

---

## Priority Backlog (Ordered)

### P0 (Do now)
1. Remove hardcoded owner/agent IDs in remaining frontend dashboards.
2. Restrict registration role behavior (buyer-only self-registration).
3. Guard all dashboard role segments consistently.
4. Verify Resend domain + redeploy Solidity contract if ABI rename not on-chain.

### P1
5. Complete seller-side confirm-sale UI/API/chain flow.
6. Define canonical state ownership pattern (Query vs Zustand).
7. Block seed/demo users in production runtime.
8. Extract shared `PropertyDetailView` from public + buyer dashboard pages (buyer path is the reference implementation).
9. Restyle `ownership-verification.tsx` to match buyer property detail sidebar cards.

### P2
10. Add DTO validation coverage for currently raw body params (e.g. resend-verification email).
11. Add paginated list APIs for scale-sensitive endpoints.
12. Add notification center persistence (not only badge/toast).
13. Geocode property locations on create (currently defaults to `lat: 0, lng: 0`).
14. Wrap `/verify-email` in Suspense for production `next build`.

### P3
15. Add SEO/accessibility completeness for public listing pages.
16. Add upload/document pipeline for property media.
17. Add observability (structured logs + basic metrics).

---

## API Surface

### Auth & Email Verification

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Create account; sends verification email; returns `{ message }` (no JWT) |
| GET | `/api/auth/verify-email?token=` | — | Verify email; returns `{ accessToken, user }` |
| POST | `/api/auth/resend-verification` | — | Body: `{ email }`; resends verification link |
| POST | `/api/auth/login` | — | Login; rejects unverified email with 401 |
| GET | `/api/auth/profile` | JWT | Current user profile |
| PATCH | `/api/auth/profile` | JWT | Update profile |
| POST | `/api/auth/avatar` | JWT | Upload avatar (multipart) |

Frontend integration:
- `services/api.ts` — `register`, `verifyEmail`, `resendVerification`, `login`, `getProfile`
- `store/auth-store.ts` — `register()` (no token), `loginAfterVerify()`, `login()` (throws on failure)
- `app/register/page.tsx` — check-inbox state after submit
- `app/verify-email/page.tsx` — token verification + auto-redirect
- `app/login/page.tsx` — unverified-email banner

### Saved Properties

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users/saved` | JWT | Returns array of saved property ID strings |
| POST | `/api/users/saved/:propertyId` | JWT | Adds property to user's saved list |
| DELETE | `/api/users/saved/:propertyId` | JWT | Removes property from saved list |

Frontend integration:
- `services/api.ts` — `getSavedPropertyIds`, `saveProperty`, `unsaveProperty`
- `store/saved-store.ts` — optimistic toggle + `syncWithServer()` + `syncGeneration`
- `common/utils/resolve-user-id.ts` — backend user ID resolution for JWT lean docs
- `components/app-bootstrap.tsx` — syncs saved IDs when buyer session is active
- `components/property/property-card.tsx` — Save button
- `app/dashboard/buyer/saved/page.tsx` — dedicated saved listings view

### Transactions (Admin Audit)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/transactions` | JWT + admin | Full platform transaction ledger |
| GET | `/api/transactions/mine` | JWT | Current user's transactions |

Frontend integration:
- `services/api.ts` — `getAllTransactions`, `getMyTransactions`
- `app/dashboard/admin/audit/page.tsx` — searchable audit table
- `app/dashboard/owner/tenants/page.tsx` — rental tenant view (uses `getMyTransactions`)

---

## Verification Matrix

Run after each phase:

```bash
# Frontend
cd frontend
npm run lint
npm run build

# Backend (rebuild if dist is stale)
cd ../backend
npm run build
npm run lint
npm run test
npm run start:dev
```

### Local dev startup

```bash
# Backend (uses in-memory Mongo if local Mongo unavailable)
cd backend
npm run build   # run if you see "Cannot find module" from dist/
npm run start:dev

# Frontend (use dev:clean if routes 404 or webpack cache errors appear)
cd ../frontend
npm run dev
# or: npm run dev:clean
```

**Important:** After changing `backend/.env` (e.g. `RESEND_API_KEY`), restart the backend so NestJS reloads config. Without a restart, emails fall back to console logging only.

**Next.js cache (Windows):** If the dev server logs `Caching failed for pack` / missing `.pack.gz` and pages return 404, stop all `node` processes, run `npm run dev:clean` from `frontend/`, then hard-refresh the browser. Do not commit `frontend/.next/`.

### Runtime smoke checks

```bash
# Health
curl http://localhost:3001/api/health

# Register (returns message, no token)
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"smoke@test.com\",\"password\":\"TestPassword123!\",\"name\":\"Smoke User\",\"role\":\"buyer\",\"phone\":\"+15550000000\"}"

# Verify email (use token from backend console log or Resend inbox)
curl "http://localhost:3001/api/auth/verify-email?token=YOUR_TOKEN"

# Login (fails if email not verified)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"smoke@test.com\",\"password\":\"TestPassword123!\"}"

# Properties
curl http://localhost:3001/api/properties

# Saved properties (replace TOKEN and PROPERTY_ID)
curl http://localhost:3001/api/users/saved -H "Authorization: Bearer TOKEN"
curl -X POST http://localhost:3001/api/users/saved/PROPERTY_ID -H "Authorization: Bearer TOKEN"
curl -X DELETE http://localhost:3001/api/users/saved/PROPERTY_ID -H "Authorization: Bearer TOKEN"
```

### Manual UX checks
- Register new account → see "Check your inbox" → open verify link → land on dashboard logged in.
- Try login before verifying → see unverified-email banner on login page.
- Login as buyer → open property detail → toggle Save → visit Saved Properties page → listing appears.
- Refresh page → saved state persists (server-backed after sync).
- Unsave from saved page or property detail → listing removed from saved page.
- Owner dashboard → gross rental yield KPI visible when rental transactions exist.
- Owner → Tenant Management → active/pending tenants listed with inquiry-derived names.
- Admin → Transaction Audit → full ledger searchable by property, user, tx hash.
- Marketplace → switch grid / list / map views; map markers navigate to property detail.
- Buyer property detail → summary bar title/badges readable; save heart toggles; inquiry buttons submit; activity timeline renders when history exists.
- Buyer home, saved, requests, verification, settings, sandbox → summary bars and empty states match shared dashboard styling.
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
FRONTEND_ORIGIN=http://localhost:3000
FRONTEND_PUBLIC_URL=http://localhost:3000

# Email verification (Resend — https://resend.com)
# Leave RESEND_API_KEY blank in dev to log verification links to backend console
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=ChainEstate <onboarding@resend.dev>

# Blockchain (Sepolia — optional for local dev)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_project
PRIVATE_KEY=0x_your_private_key
CONTRACT_ADDRESS=0x_your_contract_address
```

**Notes:**
- If Docker/local Mongo is not running, the backend automatically falls back to in-memory MongoDB in non-production (via `mongodb-memory-server`). Set `MONGODB_USE_MEMORY=true` to force that behavior explicitly.
- `onboarding@resend.dev` (Resend test sender) only delivers to the email address that owns your Resend account. For sending to any recipient, verify a domain in Resend and set `EMAIL_FROM` accordingly.
- `FRONTEND_PUBLIC_URL` must match where the frontend actually runs (check `npm run dev` output — default is `http://localhost:3000` unless `-p` is used).

---

## Definition of Done For "Production Ready"

The project is considered production-ready when all are true:
- Security-critical findings are closed (authz, token handling, privileged-role creation).
- Email verification delivers reliably via verified Resend domain (not console fallback).
- End-to-end property sale flow is chain-aware and consistent with DB state.
- Frontend state architecture is consolidated and deterministic.
- Automated tests cover critical paths (including auth verification) and run in CI.
- Documentation and operational checks reflect the live system.
- Production deployments use real MongoDB only (no in-memory fallback).
