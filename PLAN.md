# ChainEstate - Current-State Engineering Plan

Last updated: 2026-06-22 (owner/agent UI overhaul + security audit fixes + auth form hardening)  
Branch: `main` (merged PR #18 `feat/ui-overhaul-auth-email-verification`; local uncommitted audit/UI work)  
Scope: `frontend/` + `backend/` + blockchain integration path

---

## Purpose

This plan tracks the integrated MVP state (Next.js frontend + NestJS backend + MongoDB + optional Sepolia contract hooks) and what remains for production readiness.

It is updated after each meaningful delivery increment — not only at major milestones.

---

## Deployed Environments

| Service | URL | Notes |
|---------|-----|-------|
| **Frontend (Vercel)** | https://real-estate-blockchain-marketplace.vercel.app | Next.js 15 App Router |
| **Backend (Railway)** | https://giving-simplicity-production-b1bb.up.railway.app/api | NestJS REST + Socket.IO |
| **Smart contract (Sepolia)** | `0x877D7Ceb1F9220b17A2DbBedEb9c9262eD0C18d7` | ERC-721 marketplace + escrow |

Frontend `.env.example` points `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_WS_URL` at the Railway backend for production builds.

---

## Recent Progress (Session Updates)

### 2026-06-22 — Owner & agent UI + security audit

#### Frontend — Owner dashboard UI overhaul
- [x] Shared design language applied across all owner pages: summary bars, `SectionLabel`, outline KPI pills, `Card border-border/60`, `CardTitle text-primary`.
- [x] Pages polished: home, properties list, property detail, create property (sectioned cards + upload UX), agents, escrow, transfers, verification, tenants, inquiries.
- [x] `escrow-panel.tsx` refactored to divided Card pattern.
- [x] Create Property form: `method="post"` + explicit `preventDefault` (avoids native GET submit with credentials in URL).

#### Frontend — Agent dashboard UI overhaul
- [x] Same design system on agent home, properties, requests, verification.

#### Frontend — Auth / session fixes
- [x] Removed dead `/forgot-password` link from login page.
- [x] Login/register forms: `method="post"`, `noValidate`, explicit `preventDefault`.
- [x] Register API client: email trimmed/lowercased before POST.
- [x] Logout clears all Zustand session stores via `clear-session-data.ts` (breaks circular import in `auth-store.ts`).
- [x] Owner/agent inquiry lists filtered to logged-in user; buyer requests no longer fall back to hardcoded demo user ID.

#### Backend — Security audit fixes (10/10)
- [x] **Registration role lock:** `RegisterDto.role` enum is `buyer | owner | agent` only — `admin` cannot self-register.
- [x] **Property status server-controlled:** client cannot set `status` on create/update; new listings always `pending`.
- [x] **Transaction authorization:** `markEscrow` buyer-only; `update` restricted to transaction participants.
- [x] **SeedModule env-guard:** skipped when `NODE_ENV === 'production'`.
- [x] **Admin user suspend:** `PATCH /api/users/:id/status` wired to admin users UI.
- [x] **Agents endpoint auth-gated:** `GET /api/users/agents` requires JWT (was public).
- [x] **DTO ID validation:** `@IsMongoId()` on inquiry/transaction DTO ID fields.
- [x] **List pagination:** `page` / `limit` query params on properties, transactions, inquiries (backend; frontend not wired yet).

### Backend (prior sessions)
- [x] **Local dev auth unblock:** `AppConfigService` falls back to in-memory MongoDB when local Mongo is unreachable (non-production), or when `MONGODB_USE_MEMORY=true`.
- [x] **Saved properties API:** user bookmarks persisted on the server via `savedPropertyIds` on the User model.
- [x] **Saved properties user-ID fix:** `resolveUserId()` helper handles lean JWT user docs (`_id` vs `id`).
- [x] **Email verification infrastructure (Resend):** endpoints and `MailModule` remain in codebase; **currently bypassed** for MVP (see Auth section below).
- [x] **MailService resilience:** Resend send failures log + console fallback instead of throwing (prevents registration 500 when `onboarding@resend.dev` rejects recipients).
- [x] **Admin transaction audit API:** `GET /api/transactions` (admin-only).
- [x] **Solidity naming fix:** `transferPropertyOwnership(uint256,address)` (distinct from OpenZeppelin `Ownable.transferOwnership`); ABIs synced in backend + frontend.
- [x] **CORS (production):** `main.ts` allows Vercel domain via regex + configured `FRONTEND_ORIGIN`; dev origins include `localhost:3000`, `3001`, `3002`, `5173`.
- [x] **CORS (local):** `FRONTEND_ORIGIN` supports comma-separated origins including production Vercel URL.
- [x] **Confirm sale fix:** reject/handle non-numeric `blockchainTokenId` gracefully (commit `4029abe`).

### Auth — current behavior (temporary MVP bypass)
- [x] **Registration:** creates user with `emailVerified: true`; no verification email sent; returns `{ message: "Account created. You can now sign in." }`.
- [x] **Login:** no longer blocks unverified email accounts.
- [x] **Frontend register:** success toast → redirect to `/login` (check-inbox screen removed).
- [~] **Verify-email endpoints still exist** (`GET /verify-email`, `POST /resend-verification`) for future re-enable; `/verify-email` page and login unverified banner remain in UI but are inactive paths.
- [ ] **Re-enable email verification** when Resend domain is verified (restore register → verify → login gate).

### Frontend — Auth UI
- [x] **Auth split layout:** `AuthSplitShell` — primary-blue left panel (desktop), form on right; used by `/login`, `/register`, `/verify-email`.
- [x] **Headings:** `text-primary` on auth titles ("Welcome back!", "Join ChainEstate").
- [x] **Navbar:** `/logo.png` replaces ShieldCheck icon.
- [x] **`/forgot-password` link removed** from login (route never existed; implement later if needed).

### Frontend — Buyer dashboard UI overhaul
- [x] Shared design language: summary bars, primary counts/titles, muted subtitles, dashed empty states, outline CTAs.
- [x] Marketplace (grid/list/map), property cards/filters, buyer home, saved, requests, verification, settings, sandbox, property detail.
- [x] `npm run dev:clean` — clears `.next` before dev start (Windows cache recovery).
- [x] Leaflet map: client-only mount; invalid `0,0` coordinates show fallback UI.

### Frontend — Admin dashboard UI overhaul
- [x] Outline card design across KPI cards, platform analytics, activity feed, property charts, top agents, AI insights, compliance strip.
- [x] Summary bar with inline headline stats; section labels; Quick Actions removed from home.
- [x] Admin sub-pages polished: users, properties, records, reports, audit.
- [x] Admin user suspend/reactivate wired to `PATCH /api/users/:id/status`.

### Frontend — Owner & agent dashboard UI overhaul (2026-06-22)
- [x] Owner: all dashboard routes share buyer/admin outline design system (see Recent Progress above).
- [x] Agent: home, properties, requests, verification aligned to same patterns.
- [x] Create Property: multi-card form, summary bar, media upload polish, primary token consistency.

### Frontend — Security headers (CSP)
- [x] **`connect-src` fix:** uses dynamic `uniqueConnectSrc` (includes `NEXT_PUBLIC_API_URL`, `localhost:3001`, Sepolia RPC).
- [x] **Leaflet markers:** `https://unpkg.com` added to `img-src` and `font-src`.
- [x] **Vercel live feedback:** `https://vercel.live` added to `script-src`.

### Owner / Admin features
- [x] Owner rental yield KPI; `/dashboard/owner/tenants`.
- [x] Admin transaction audit: `/dashboard/admin/audit`.

### Git / merge hygiene
- [x] Merge conflict cleanup in `next.config.ts` and `owner/properties/new/page.tsx`.
- [x] Feature branch merged to `main` via PR #18; subsequent Railway CORS/API prefix fixes merged.

---

## Known Production Issues (2026-06-22)

| Issue | Symptom | Root cause | Status |
|-------|---------|------------|--------|
| **Mint 500** | `POST /api/blockchain/mint` fails | `transferPropertyOwnership(tokenId, owner)` reverts — deployer wallet does not own on-chain token ID stored in DB (token ID / contract deployment mismatch) | Open |
| **Property PATCH 403** | `PATCH /api/properties/:id` forbidden | `assertCanManage()` — logged-in user ID ≠ property `ownerId` in production MongoDB (seeded vs newly registered users) | Open — correct authz; needs UX/docs |
| **Escrow MetaMask fail** | "Transaction failed or was cancelled" | Insufficient Sepolia ETH for escrow value + gas (~0.013 ETH needed) | User action — fund wallet via faucet |
| **Resend delivery** | Emails not received | `onboarding@resend.dev` only sends to Resend account owner; verification bypassed for now | Deferred |
| **Native form GET submit** | `/login?email=...` or `/register?...` in URL | React hydration failure or JS crash before handler runs | Mitigated — `method="post"` + `preventDefault`; hard refresh if persists |
| **CSP on Vercel** | Some console warnings | Partially fixed in `next.config.ts`; redeploy frontend after CSP changes | In progress |
| **Public data exposure** | Unauthenticated reads | `/properties/ownership-records`, `/properties/owner/:id` still public | Open |
| **Frontend pagination** | Large lists load all rows | Backend supports `page`/`limit`; UI not wired | Open |

---

## Current Architecture Snapshot

### Frontend (`frontend/`)
- Next.js 15 App Router + React 19 + TypeScript.
- Dashboard flows for buyer/owner/agent/admin implemented.
- Axios API client with JWT interceptors in `lib/api.ts`.
- Ethers v6 browser client in `lib/contract.ts` (`initiateEscrow`, `confirmSale`, `transferPropertyOwnership`).
- Socket.IO notifications via `hooks/use-notifications.ts`.
- Zustand stores + partial React Query usage (hybrid state architecture).
- Auth pages use `AuthSplitShell`; register → login (no email gate currently).
- Buyer, admin, owner, and agent dashboards share outline/summary-bar design language.
- CSP headers configured in `next.config.ts` (includes API origin + unpkg + vercel.live).

### Backend (`backend/`)
- NestJS 11 modular API with global validation and `/api` prefix.
- MongoDB (Mongoose) — production uses Railway MongoDB; local dev can fall back to in-memory.
- JWT auth (`passport-jwt`) + role guard/decorators; registration role restricted to buyer/owner/agent.
- Property `status` server-assigned (`pending` on create); admin approval sets `active`.
- SeedModule disabled in production (`NODE_ENV=production`).
- Email verification via `MailModule` + Resend (bypassed at register/login; endpoints retained).
- Socket.IO gateway with JWT handshake verification.
- Blockchain service (`ethers`) for mint/ownership/escrow read primitives.
- CORS: dynamic origin callback in `main.ts` + `AppConfigService.frontendOrigins`.

### Blockchain
- Solidity contract: `contracts/RealEstateMarketplace.sol`.
- `listProperty` (onlyOwner) → mints to deployer; `transferPropertyOwnership` assigns to user wallet.
- `initiateEscrow(uint256)` payable — buyer locks ETH from MetaMask.
- `confirmSale(uint256)` — seller releases escrow and transfers NFT.
- DB `chainId` / `blockchainTokenId` and on-chain token ownership are **not always synchronized** across environments.

---

## Delivery Status (Reality Check)

### Completed
- [x] Full frontend app structure with role-based dashboard UX.
- [x] NestJS backend with core modules and DTO validation.
- [x] JWT login/register/profile flow wired frontend ↔ backend.
- [x] Property/inquiry/transaction API integration from frontend.
- [x] Socket notification events for inquiries, escrow, completion, property approval.
- [x] Contract client utilities in frontend and blockchain service in backend.
- [x] Saved/bookmarked properties — backend persistence + buyer UI.
- [x] Local dev resilience — in-memory Mongo fallback.
- [x] Buyer + admin + owner + agent dashboard UI overhauls (outline design system).
- [x] Auth split-layout pages (login, register, verify-email shell).
- [x] Production deployment on Vercel + Railway with CORS for Vercel domain.
- [x] CSP connect-src fix for API calls to backend.
- [x] Registration works without email verification (temporary MVP path).
- [x] Security audit pass: role lock, property status lock, transaction authz, seed guard, session store reset, admin suspend API, agents auth-gate, DTO ID validation, list pagination (backend).

### Partially Complete
- [~] Blockchain transaction lifecycle (mint/escrow/confirm) — implemented in pieces; production mint fails on token ownership mismatch.
- [~] Role-based access exists; resource-level authorization (`assertCanManage`) causes 403 when DB ownerId ≠ session user (expected — document for users).
- [~] Frontend role routing partly guarded (buyer subtree has guard; owner/agent/admin inconsistent).
- [~] Email verification flow built but bypassed; re-enable pending Resend domain setup.
- [~] Duplicate property detail implementations (public `property/[id]` vs buyer dashboard detail).
- [~] **`ownership-verification.tsx`** sidebar — not yet restyled to match buyer property detail.
- [~] **`/verify-email` production build** — Suspense wrapper may be needed for `useSearchParams`.
- [~] Next.js dev cache on Windows — use `npm run dev:clean` when routes 404 or stale bundles appear.
- [~] List pagination — backend supports `page`/`limit`; frontend still loads full lists.
- [~] Registration role — admin blocked; owner/agent still self-selectable (buyer-only restriction deferred).

### Not Complete (Production Critical)
- [ ] Rate limiting + httpOnly token strategy (JWT still in localStorage).
- [ ] Auth-gate public property endpoints (`ownership-records`, owner-scoped lists).
- [ ] Test coverage (frontend + backend).
- [ ] Stable data architecture on frontend (remove Zustand/React Query duplication).
- [ ] Full docs parity (`README` still lags in places).
- [ ] Verified Resend sending domain + re-enable email verification gate.
- [ ] `/forgot-password` page (link removed; feature not built).
- [ ] On-chain token ID lifecycle standardized across mint, DB, and escrow flows.
- [ ] Operational readiness (health depth, observability, CI quality gates).

---

## Confirmed Gaps From Current Code

### Security and Authorization
- ~~Registration allows `admin` role~~ — **fixed:** enum restricted to buyer/owner/agent.
- JWT stored in localStorage (XSS risk); route protection largely client-side.
- Property mutations return 403 when session user is not property owner — correct behavior, but confuses users who registered on production vs seeded demo data.
- ~~Demo seed in production~~ — **fixed:** `SeedModule` skipped when `NODE_ENV=production`.
- Public endpoints still expose ownership records and owner-scoped property lists without auth.
- WebSocket CORS uses raw `process.env` instead of `AppConfigService`.

### Blockchain Consistency
- **Mint flow:** backend calls `listProperty` then `transferPropertyOwnership`; fails if token ID in DB does not match freshly minted token or deployer is not contract owner.
- Escrow requires sufficient Sepolia ETH in buyer MetaMask wallet.
- Some transaction paths update DB state without guaranteed on-chain confirmation.
- Contract at `0x877D7Ceb...` must match `CONTRACT_ADDRESS` / `NEXT_PUBLIC_CONTRACT_ADDRESS` on both Railway and Vercel.

### Frontend Architecture
- ~~Hardcoded demo user fallback on buyer requests~~ — **fixed** on buyer requests page; audit remaining `u-buyer-1` on buyer home if any.
- Zustand + React Query overlap causes potential stale/duplicated state (logout now clears Zustand stores).
- Duplicate property detail implementations increase maintenance cost.
- List views use `images[0]` without guard in several dashboard rows (potential broken thumbnails).
- Frontend list calls do not pass pagination params yet.

### Quality and Ops
- No meaningful automated test suites.
- Lint/test/documentation gates not strict for release workflows.
- Backend `dist/` must be rebuilt after schema/service changes on Railway deploys.

---

## Updated Execution Roadmap

### Phase 0 - Immediate Stabilization (1-2 days)
Goal: remove the highest-risk defects before further feature work.

- [ ] Fix production mint flow: ensure deployer wallet is contract owner; align DB `chainId` with on-chain tokens after mint.
- [ ] Document that seeded properties on production belong to seed user IDs — new users must create new listings.
- [~] Restrict self-registration role — **admin blocked**; buyer-only default still optional.
- [x] Remove hardcoded user IDs in owner/agent inquiry views; buyer requests fallback fixed.
- [ ] Enforce role checks on all dashboard route groups.
- [x] Gate seed behavior to development-only mode (`SeedModule` env guard).
- [x] Remove `/forgot-password` link from login (page not implemented).
- [x] Auth forms hardened against native GET submit (`method="post"` + `preventDefault`).
- [ ] Redeploy frontend after CSP changes land on `main`.

Exit criteria:
- New user can register → login → create property → mint (or graceful skip) without 500/403.
- No dashboard depends on mock user IDs.

### Phase 1 - End-to-End Transaction Correctness (2-4 days)
Goal: make purchase flow deterministic across UI, API, and chain.

- Canonical flow: inquiry → transaction → escrow (MetaMask) → confirm → property status update.
- Ensure `markEscrow` and `confirmSale` match chain behavior; handle insufficient funds with clear UI message.
- Standardize property `chainId` / `blockchainTokenId` lifecycle after mint.
- Add explicit failure handling when chain tx fails or is delayed.
- Fund/deployer wallet and buyer wallets with Sepolia ETH for testing.

Exit criteria:
- One documented happy path for sale completion that is reproducible on Sepolia.
- DB state and chain state remain consistent after completion.

### Phase 2 - Frontend Data Architecture Consolidation (2-3 days)
Goal: eliminate state drift and reduce duplicated logic.

- Choose primary async state model (React Query for server state recommended).
- Limit Zustand to session/UI local concerns.
- Refactor duplicate property detail pages into shared view components.
- Consistent API mutation invalidation/update strategy.

Exit criteria:
- No duplicated server-truth stores for the same entity lifecycle.

### Phase 3 - Security and Production Hardening (3-5 days)
Goal: move from MVP to deployable baseline.

- Re-enable email verification with verified Resend domain.
- Migrate auth token handling toward httpOnly cookie/BFF or equivalent.
- Rate limiting on auth endpoints.
- DTO validation for all raw body params.
- Deeper health checks (database, Resend, blockchain readiness).
- Production MongoDB only (no in-memory fallback).

Exit criteria:
- Security review items have explicit resolution status.
- Verification emails deliver reliably in production.

### Phase 4 - Testing, CI, and Documentation (2-4 days)
Goal: create confidence and repeatability.

- Backend unit tests (auth, guards, saved properties, property authorization).
- API integration tests for register/login, property/inquiry/transaction flows.
- Frontend tests for auth routing, saved toggle, dashboard rendering, escrow UI.
- CI lint + test gates.
- Update `README` to match deployed URLs and auth behavior.

Exit criteria:
- CI has required green checks.
- Documentation matches production deployment.

---

## Priority Backlog (Ordered)

### P0 (Do now)
1. Fix blockchain mint `transferPropertyOwnership` failure (token ID / deployer ownership alignment).
2. Clarify/fix production 403 on property PATCH (ownerId vs session user — UX + docs).
3. Redeploy frontend with CSP fixes (`connect-src`, unpkg, vercel.live).
4. Auth-gate public property endpoints (`ownership-records`, `/properties/owner/:id`).
5. Wire frontend list views to backend pagination (`page`/`limit`).

### P1
6. Complete seller-side confirm-sale UI/API/chain flow with clear insufficient-funds messaging.
7. Re-enable email verification when Resend domain verified.
8. Guard all dashboard role segments consistently.
9. Extract shared `PropertyDetailView` from public + buyer dashboard pages.
10. Restrict registration to buyer-only (optional — owner/agent self-select currently allowed).
11. Implement `/forgot-password` or keep link removed permanently.

### P2
12. Define canonical state ownership pattern (Query vs Zustand).
13. Restyle `ownership-verification.tsx` to match buyer property detail sidebar.
14. Wrap `/verify-email` in Suspense for production `next build`.
15. Geocode property locations on create (currently defaults to `lat: 0, lng: 0`).
16. Guard `images[0]` in dashboard list rows; add image fallbacks.
17. Rate limiting on auth endpoints; httpOnly cookie token strategy.

### P3
18. Add SEO/accessibility completeness for public listing pages.
19. Add upload/document pipeline for property media.
20. Add observability (structured logs + basic metrics).

---

## API Surface

### Auth (current MVP behavior)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Create account (`role`: buyer/owner/agent only); `emailVerified: true`; returns `{ message }` (no JWT) |
| POST | `/api/auth/login` | — | Login; returns `{ accessToken, user }` |
| GET | `/api/auth/verify-email?token=` | — | *(Inactive)* Verify email; returns JWT + user |
| POST | `/api/auth/resend-verification` | — | *(Inactive)* Resend verification link |
| GET | `/api/auth/profile` | JWT | Current user profile |
| PATCH | `/api/auth/profile` | JWT | Update profile |
| POST | `/api/auth/avatar` | JWT | Upload avatar (multipart) |

Frontend integration:
- `services/api.ts` — `register`, `login`, `verifyEmail`, `resendVerification`, `getProfile`
- `store/auth-store.ts` — `register()` (no token), `login()`, `loginAfterVerify()` (for future verify flow)
- `app/register/page.tsx` — success → toast → redirect `/login`
- `app/login/page.tsx` — `AuthSplitShell`; unverified banner present but inactive while gate is bypassed
- `app/verify-email/page.tsx` — retained for future re-enable

### Users

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users` | JWT + admin | List all users |
| PATCH | `/api/users/:id/status` | JWT + admin | Suspend or reactivate account (`active` \| `suspended`) |
| GET | `/api/users/agents` | JWT | List active agents (authenticated) |
| GET | `/api/users/saved` | JWT | Returns array of saved property ID strings |
| POST | `/api/users/saved/:propertyId` | JWT | Adds property to user's saved list |
| DELETE | `/api/users/saved/:propertyId` | JWT | Removes property from saved list |

### Properties

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/properties` | — | List properties; supports `page`, `limit` query params |
| POST | `/api/properties` | JWT + owner/agent | Create listing; server sets `status: pending` |

### Transactions

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/transactions` | JWT + admin | Full platform transaction ledger; supports `page`, `limit` |
| GET | `/api/transactions/mine` | JWT | Current user's transactions |
| PATCH | `/api/transactions/:id` | JWT | Update transaction (participants only) |
| POST | `/api/transactions/:id/escrow` | JWT | Record escrow deposit tx hash (buyer only) |

### Inquiries

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/inquiries` | JWT | Role-scoped list; supports `page`, `limit` |

### Blockchain

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/blockchain/status` | — | Connection status + contract address |
| POST | `/api/blockchain/mint` | JWT + owner/admin | Mint property NFT on Sepolia |
| GET | `/api/blockchain/verify-ownership` | JWT | Check wallet owns token |
| GET | `/api/blockchain/token/:tokenId` | JWT | Read on-chain property deed |

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
npm run build
npm run lint
npm run test
npm run start:dev
```

### Local dev startup

```bash
# Backend
cd backend
npm run build   # if "Cannot find module" from dist/
npm run start:dev

# Frontend (use dev:clean if routes 404 or webpack cache errors)
cd ../frontend
npm run dev
# or: npm run dev:clean
```

**Next.js cache (Windows):** Stop all `node` processes, run `npm run dev:clean`, hard-refresh browser. Do not commit `frontend/.next/`.

**Port collisions:** If port 3000 is taken, Next.js uses 3001/3002 — ensure backend CORS includes those origins (already in `app-config.service.ts`).

### Runtime smoke checks

```bash
# Health
curl http://localhost:3001/api/health

# Register (returns message, no token — then login separately)
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"smoke@test.com\",\"password\":\"TestPassword123!\",\"name\":\"Smoke User\",\"role\":\"buyer\",\"phone\":\"+15550000000\"}"

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"smoke@test.com\",\"password\":\"TestPassword123!\"}"

# Properties
curl http://localhost:3001/api/properties
```

### Manual UX checks
- Register → success toast → redirect to login → sign in → land on role dashboard (no credentials in URL).
- Login as buyer → marketplace → property detail → save toggle → saved page persists after refresh.
- Owner → create new property (sectioned form) → mint or graceful fallback → listing shows as pending.
- Owner/agent dashboards → inquiries filtered to own listings only.
- Logout → re-login as different user → no stale Zustand data from prior session.
- Admin → Users → suspend/reactivate account persists via API.
- Buyer → fund escrow via MetaMask (requires Sepolia ETH) → owner confirms sale.
- Admin → Transaction Audit → ledger searchable.
- Production: https://real-estate-blockchain-marketplace.vercel.app loads; API calls reach Railway backend (no CSP/CORS block in console).

---

## Environment Variable Baseline

### Frontend (`frontend/.env`)

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001
NEXT_PUBLIC_CONTRACT_ADDRESS=0x877D7Ceb1F9220b17A2DbBedEb9c9262eD0C18d7
```

**Production (Vercel):**

```env
NEXT_PUBLIC_SITE_URL=https://real-estate-blockchain-marketplace.vercel.app
NEXT_PUBLIC_API_URL=https://giving-simplicity-production-b1bb.up.railway.app/api
NEXT_PUBLIC_WS_URL=wss://giving-simplicity-production-b1bb.up.railway.app
NEXT_PUBLIC_CONTRACT_ADDRESS=0x877D7Ceb1F9220b17A2DbBedEb9c9262eD0C18d7
```

### Backend (`backend/.env`)

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/chainestate
MONGODB_USE_MEMORY=false
JWT_SECRET=replace_with_strong_secret
JWT_EXPIRES_IN=7d
FRONTEND_ORIGIN=http://localhost:3000,https://real-estate-blockchain-marketplace.vercel.app
FRONTEND_PUBLIC_URL=http://localhost:3000

# Email (optional — verification bypassed for now)
RESEND_API_KEY=
EMAIL_FROM=ChainEstate <onboarding@resend.dev>

# Blockchain (Sepolia)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_key
PRIVATE_KEY=0x_your_deployer_private_key
CONTRACT_ADDRESS=0x877D7Ceb1F9220b17A2DbBedEb9c9262eD0C18d7
```

**Production (Railway):** set `NODE_ENV=production`, strong `JWT_SECRET`, real `MONGODB_URI`, matching `CONTRACT_ADDRESS`, and `FRONTEND_ORIGIN` to the Vercel URL.

**Notes:**
- Local Mongo unavailable → in-memory fallback in non-production only.
- `PRIVATE_KEY` wallet must be the **contract owner** for `listProperty` (onlyOwner) to succeed.
- Resend `onboarding@resend.dev` only delivers to the Resend account owner email.

---

## Definition of Done For "Production Ready"

The project is considered production-ready when all are true:
- Security-critical findings are closed (authz, token handling, privileged-role creation, public endpoint exposure).
- Registration/login works reliably in production without CSP/CORS errors.
- Email verification re-enabled with verified Resend domain (when required).
- End-to-end property sale flow is chain-aware and consistent with DB state.
- Mint/escrow/confirm flows succeed on Sepolia with funded test wallets.
- Frontend state architecture consolidated and deterministic.
- Automated tests cover critical paths and run in CI.
- Documentation and operational checks reflect live Vercel + Railway deployment.
- Production uses real MongoDB only (no in-memory fallback).
