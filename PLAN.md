# OrganizationLaunchpad - Project Plan

## Vision

Industry-standard monorepo scaffold for turning AI-generated apps into production-ready SaaS with all essential business APIs pre-wired and documented.

**Target User**: Individual developers/hobbyists building SaaS/web apps.

**Core Problem Solved**: AI-generated "vibecoded" apps work locally but fail in production - OrganizationLaunchpad provides the infrastructure shell to deploy with confidence.

---

## Tech Stack

| Layer           | Technology                           |
| --------------- | ------------------------------------ |
| Frontend        | Svelte 5 + Vite (static output)      |
| Desktop         | Tauri 2 (Rust-based)                 |
| Backend API     | Supabase Edge Functions (TypeScript) |
| Database/Auth   | Supabase (Postgres, RLS, Auth)       |
| Email           | Resend                               |
| Payments        | Stripe (optional module)             |
| Analytics       | Plausible Analytics                  |
| Infrastructure  | Terraform (Cloudflare DNS)           |
| Testing         | Vitest (unit) + Playwright (E2E)     |
| Package Manager | npm workspaces (monorepo)            |

---

## Business APIs (Documentation Priority)

| API              | Purpose                                     | Status |
| ---------------- | ------------------------------------------- | ------ |
| Supabase         | Auth + Database + Edge Functions            | Core   |
| Google OAuth     | SSO via Supabase                            | Core   |
| Resend           | Transactional email                         | Core   |
| Cloudflare       | Pages (hosting), DNS                        | Core   |
| Stripe           | Payments (optional)                         | Core   |
| Supabase Storage | File uploads                                | Core   |
| PostHog          | Privacy-friendly analytics + error tracking | Core   |
| PostHog          | Privacy-friendly analytics + error tracking | Docs   |

---

## Application Features

| Feature         | Implementation                                |
| --------------- | --------------------------------------------- |
| Login           | Supabase Auth (email/password + Google OAuth) |
| Feedback        | In-app widget → Supabase feedback table       |
| User Profiles   | Avatar upload to Supabase Storage             |
| Analytics       | Plausible script injection                    |
| Notifications   | In-app toast system + email via Resend        |
| Cookie Consent  | GDPR-compliant banner                         |
| Form Validation | Zod schemas                                   |

---

## Kitchen App Modules

The bundled example app showcases all platform capabilities. Each module is isolated and can be removed.

| Module              | Capability Demonstrated              |
| ------------------- | ------------------------------------ |
| Auth Module         | Login, logout, session, Google OAuth |
| Profile Module      | User profile with avatar upload      |
| Feedback Module     | Submit/view feedback                 |
| Alarm Module        | Timer with browser notifications     |
| Camera Module       | Photo capture via Tauri              |
| Notification Module | In-app + email notifications         |
| Offline Module      | PWA service worker                   |
| Analytics Module    | PostHog integration                  |

---

## User Stories

### Epic 1: Core Scaffold Infrastructure

| ID  | User Story                                                      | Acceptance Criteria                             |
| --- | --------------------------------------------------------------- | ----------------------------------------------- |
| P1  | **As a developer**, I can clone the repo and run it locally     | `npm install && npm run dev` starts frontend    |
| P2  | **As a developer**, I can deploy the scaffold to production     | Cloudflare Pages + Supabase deploy successfully |
| P3  | **As a developer**, the scaffold follows hexagonal architecture | Business logic has no framework dependencies    |
| P4  | **As a developer**, the app passes TypeScript strict mode       | No `any` types, full type coverage              |
| P5  | **As a developer**, the CI pipeline validates my changes        | GitHub Actions runs tests + build on PR         |

### Epic 2: Authentication & Database

| ID  | User Story                                                   | Acceptance Criteria                         |
| --- | ------------------------------------------------------------ | ------------------------------------------- |
| P6  | **As a developer**, users can sign up/login via Supabase     | Email/password auth works, session persists |
| P7  | **As a developer**, users can login via Google OAuth         | SSO flow works via Supabase                 |
| P8  | **As a developer**, I can query user-specific data with RLS  | Users can only see their own data           |
| P9  | **As a developer**, the auth flow works across web and Tauri | Same auth experience desktop and web        |

### Epic 3: Native Platform Capabilities (Tauri)

| ID  | User Story                                                | Acceptance Criteria                         |
| --- | --------------------------------------------------------- | ------------------------------------------- |
| P10 | **As a developer**, the app can send native notifications | Desktop/mobile notifications work via Tauri |
| P11 | **As a developer**, the app can access the camera         | Photo capture works via Tauri               |
| P12 | **As a developer**, the app works offline                 | PWA service worker caches assets            |
| P13 | **As a developer**, the app runs as a native desktop app  | Tauri builds to .exe/.app successfully      |

### Epic 4: Kitchen App

| ID  | User Story                                                     | Acceptance Criteria             |
| --- | -------------------------------------------------------------- | ------------------------------- |
| P14 | **As a developer**, I can delete unused Kitchen features       | Each feature is isolated module |
| P15 | **As a developer**, I understand how each native feature works | Code has clear comments + docs  |

### Epic 5: Documentation

| ID  | User Story                                              | Acceptance Criteria                      |
| --- | ------------------------------------------------------- | ---------------------------------------- |
| P16 | **As a developer**, I can onboard in < 30 minutes       | Clear getting started guide              |
| P17 | **As a developer**, I understand hexagonal architecture | Architecture docs explain patterns       |
| P18 | **As a developer**, I know how to set up each API       | Step-by-step guides for all integrations |

### Epic 6: Testing

| ID  | User Story                               | Acceptance Criteria                      |
| --- | ---------------------------------------- | ---------------------------------------- |
| P19 | **As a developer**, I can run unit tests | `npm test` runs Vitest suite             |
| P20 | **As a developer**, I can run E2E tests  | `npm run test:e2e` runs Playwright suite |
| P21 | **As a developer**, auth flow is tested  | E2E tests cover login/logout/OAuth       |

---

## Subagent Optimization Strategy

### Dependency Tree

```
LEVEL 0 - Independent (Can run immediately)
├── Explore: Research Svelte 5 best practices + patterns
├── Explore: Research Supabase Auth patterns (Google OAuth)
├── Explore: Research Resend + email templates
├── Explore: Research Tauri 2 capabilities (notifications, camera)
├── Explore: Research Vitest + Playwright setup for Svelte
└── Explore: Research hexagonal architecture patterns in TypeScript

LEVEL 1 - Depends on LEVEL 0 research
├── Plan: Monorepo structure (package.json workspaces)
├── Plan: Svelte + Vite configuration
├── Plan: Supabase schema design (profiles, feedback, etc.)
└── Plan: Tauri project structure

LEVEL 2 - Sequential (Human decision points)
├── Phase 1: Core Infrastructure
├── Phase 2: Auth System
├── Phase 3: Database & Storage
├── Phase 4: API Documentation
├── Phase 5: Application Features
├── Phase 6: Tauri Desktop Integration
├── Phase 7: Kitchen App Modules
├── Phase 8: Testing
├── Phase 9: Documentation
└── Phase 10: Polish & Launch
```

### Parallelization Strategy

**Phase 1 (Core Infrastructure)** can be parallelized:

- Agent A: Set up monorepo structure (package.json, workspaces)
- Agent B: Configure Svelte + Vite frontend
- Agent C: Set up Cloudflare Worker skeleton
- Agent D: Configure TypeScript, ESLint, Prettier

**Phase 4 (API Documentation)** can be parallelized:

- Agent E: Draft Supabase setup guide
- Agent F: Draft Google OAuth guide
- Agent G: Draft Resend integration guide
- Agent H: Draft Cloudflare setup guide
- Agent I: Draft Stripe integration guide
- Agent J: Draft Plausible + Sentry docs

---

## Phased Implementation Plan

### Phase 1: Core Infrastructure

- [x] Set up monorepo structure with npm workspaces
- [x] Configure Svelte + Vite frontend (apps/web)
- [x] Set up Supabase Edge Functions skeleton (supabase/functions)
- [x] Configure TypeScript strict mode, ESLint, Prettier
- [x] Set up GitHub Actions CI (test + build)

### Phase 2: Auth System

- [ ] Configure Supabase client with environment variables
- [ ] Implement email/password authentication flow
- [ ] Implement Google OAuth via Supabase
- [ ] Create session management and protected routes

### Phase 3: Database & Storage

- [ ] Design Supabase schema (profiles, feedback tables)
- [ ] Configure Row Level Security (RLS) policies
- [ ] Set up Supabase Storage for avatar uploads

### Phase 4: API Documentation

- [ ] Write Supabase setup guide
- [ ] Write Google OAuth setup guide
- [ ] Write Resend email integration guide
- [ ] Write Cloudflare setup guide (Workers, Pages, DNS)
- [ ] Write Stripe integration guide (optional module)
- [ ] Write Supabase Storage guide
- [ ] Write PostHog analytics guide
- [ ] Write PostHog analytics guide

### Phase 5: Application Features

- [ ] Build user profile page with avatar upload
- [ ] Build feedback widget (submit + view)
- [ ] Build toast notification system
- [ ] Implement Zod form validation patterns
- [ ] Implement cookie consent banner (GDPR)
- [ ] Integrate PostHog Analytics

### Phase 6: Tauri Desktop Integration

- [ ] Configure Tauri desktop project
- [ ] Implement native notifications via Tauri
- [ ] Implement camera access via Tauri
- [ ] Build PWA service worker for offline support

### Phase 7: Kitchen App Modules

- [ ] Build Auth module (login/logout/demo)
- [ ] Build Profile module with avatar upload
- [ ] Build Feedback module
- [ ] Build Alarm/Timer module
- [ ] Build Camera module
- [ ] Build Notification module (in-app + email)
- [ ] Build Offline PWA module
- [ ] Implement feature toggle system (remove unused modules)

### Phase 8: Testing

- [ ] Set up Vitest unit testing framework
- [ ] Write unit tests for domain layer
- [ ] Set up Playwright E2E testing framework
- [ ] Write E2E tests for auth flow
- [ ] Write E2E tests for feedback flow

### Phase 9: Documentation

- [ ] Write comprehensive README with quick start
- [ ] Write architecture guide (hexagonal patterns)
- [ ] Write deployment guide (Cloudflare + Supabase)
- [ ] Write per-module Kitchen app documentation
- [ ] Write environment variable reference

### Phase 10: Polish & Launch

- [ ] Verify all links and docs are accurate
- [ ] Test full flow locally (dev → deploy)
- [ ] Create GitHub template documentation

---

## File Structure

```
OrganizationLaunchpad/
├── apps/
│   └── web/
│       ├── src/
│       │   ├── domain/           # Business logic (framework-free)
│       │   ├── application/     # Use cases, ports
│       │   ├── adapters/        # Supabase, Stripe, etc.
│       │   ├── ui/              # Svelte components
│       │   └── lib/             # Utilities
│       ├── src-tauri/           # Tauri desktop shell
│       └── package.json
├── supabase/
│   ├── functions/
│   │   └── health/            # Edge Function API endpoints
│   └── migrations/
├── infra/
│   └── terraform/
├── docs/
│   ├── api-keys/
│   └── guides/
├── tests/
│   ├── unit/
│   └── e2e/
└── package.json
```

---

## Success Metrics

- GitHub stars/forks as primary adoption metric
- Developer onboarding time < 30 minutes
- All critical APIs documented with working examples
- Full-stack example app demonstrates all major features
