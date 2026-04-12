# OrganizationLaunchpad

[![CI](https://github.com/anomalyco/organization-launchpad/actions/workflows/ci.yml/badge.svg)](https://github.com/anomalyco/organization-launchpad/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Svelte](https://img.shields.io/badge/Svelte-5.53-FF3E00.svg)](https://svelte.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Production-ready scaffold for AI-generated apps. Svelte frontend, Supabase backend, all the business APIs pre-wired.

---

## Get Started

```bash
# Clone the repo
git clone https://github.com/anomalyco/organization-launchpad && cd organization-launchpad

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase URL and anon key

# Start development
npm run dev:web
```

**That's it.** Open [http://localhost:5173](http://localhost:5173)

For full setup including auth, payments, and deployment → [Setup Guide](docs/setup-guide.md)

---

## Why OrganizationLaunchpad?

| Before (Vibecoded)                 | After (OrganizationLaunchpad) |
| ---------------------------------- | ----------------------------- |
| Works locally, fails in production | Deploys with confidence       |
| Ad-hoc infrastructure              | Terraform + CI/CD             |
| Auth as afterthought               | Supabase Auth + RLS           |
| No analytics                       | PostHog pre-wired             |
| Manual dashboard setup             | Everything in code            |

---

## Features

- **Svelte 5** + Vite frontend with TypeScript strict mode
- **Supabase** — Auth, Postgres, RLS, Storage, Edge Functions
- **Cloudflare Pages** — Static hosting with global CDN
- **PWA + Offline** — Service worker, works offline
- **Tauri** — Desktop app packaging (optional)
- **Hexagonal Architecture** — Business logic stays framework-free
- **CI/CD** — GitHub Actions for test, build, deploy
- **Kitchen App Demo** — Full example showcasing all capabilities

---

## Quick Reference

### Commands

```bash
npm run dev:web          # Start frontend (http://localhost:5173)
npm run build -w web     # Build for production
npm run test -w web     # Run unit tests
npm run test:e2e -w web # Run E2E tests
npm run lint            # Lint code
npm run tauri:dev       # Desktop development
npm run tauri:build     # Build desktop app
```

### Project Structure

```
organization-launchpad/
├── apps/web/                    # Svelte + Vite frontend
│   ├── src/
│   │   ├── domain/             # Business logic (framework-free)
│   │   ├── application/         # Use cases, ports
│   │   ├── adapters/           # Supabase, Stripe, etc.
│   │   └── ui/                # Components, pages, kitchen/
│   └── src-tauri/              # Tauri desktop shell
├── supabase/
│   ├── functions/              # Edge Functions
│   └── migrations/             # Database schema + RLS
├── infra/terraform/             # DNS infrastructure
└── docs/                       # Setup guides
```

---

## Pre-Wired Services

| Service      | Purpose                                     |
| ------------ | ------------------------------------------- |
| Supabase     | Auth, database, RLS, storage                |
| Google OAuth | Single sign-on                              |
| Resend       | Transactional email (auth confirmations)    |
| Stripe       | Payments (optional)                         |
| PostHog      | Privacy-friendly analytics + error tracking |

See [docs/setup-guide.md](docs/setup-guide.md) for setup instructions.

---

## Documentation

| Guide                                | When to Read                         |
| ------------------------------------ | ------------------------------------ |
| [Setup Guide](docs/setup-guide.md)   | First time - complete service setup  |
| [Architecture](docs/architecture.md) | Understanding the codebase structure |
| [Deployment](docs/deployment.md)     | Deploying to production              |
| [API Docs](docs/api-keys/)           | Detailed service integration docs    |

---

## Kitchen App Demo

Clone and you get a working app demonstrating:

- Email/password + Google OAuth login
- User profiles with avatar upload
- Feedback submission
- Timer with browser notifications
- In-app notification center
- Offline PWA support

Each module is isolated — delete what you don't need.

---

## Principles

- **Static-first** — Prefer static deployment where possible
- **Database-centric** — RLS for auth, Supabase for backend
- **Infrastructure as code** — Terraform, no manual dashboard config
- **Framework independence** — Domain logic has no framework deps

---

## License

MIT
