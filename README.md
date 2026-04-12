# OrganizationLaunchpad

Turn AI-generated "vibecoded" apps into production-ready SaaS. Drop your frontend in, get auth, CI/CD, and deployment pre-wired.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## The Problem

AI-generated apps work locally but fail in production. They skip auth, CI/CD, and proper infrastructure. OrganizationLaunchpad is the production shell that fills the gap.

## How It Works

1. **Clone** this repo — you get a monorepo with auth + deployment pre-wired
2. **Drop** your frontend (Svelte, React, Vue, htmx — any framework) into `apps/`
3. **Configure** your Supabase project and Cloudflare deployment
4. **Ship** — GitHub Actions handles CI/CD to Cloudflare Pages

The scaffold handles the boring stuff so you can focus on your app.

---

## Get Started

```bash
# Clone the template
git clone https://github.com/anomalyco/organization-launchpad && cd organization-launchpad

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your:
# - Supabase URL + anon key
# - Cloudflare account details

# Start development
npm run dev:web
```

See [docs/setup-guide.md](docs/setup-guide.md) for detailed setup.

---

## MVP — GitHub to Cloudflare Pages

One-command deployment from GitHub to Cloudflare Pages with full auth out of the box.

**What's included:**

- Email/password authentication via Supabase
- Google OAuth (SSO)
- GitHub Actions CI/CD
- Cloudflare Pages deployment
- Database with Row Level Security (RLS)
- User profiles with avatar upload

**Stack:** GitHub, Cloudflare Pages, Supabase (Auth + Database)

---

## Architecture

```
organization-launchpad/
├── apps/
│   └── web/                    # Your frontend goes here
│       ├── src/
│       │   ├── domain/         # Business logic (framework-free)
│       │   ├── application/    # Use cases, ports
│       │   ├── adapters/       # Auth, storage adapters
│       │   └── ui/             # Your components
│       └── src-tauri/          # Optional: Tauri desktop packaging
├── supabase/
│   ├── functions/              # Edge Functions
│   └── migrations/             # Auth schema + RLS policies
├── infra/terraform/            # Cloudflare DNS
└── docs/                       # Setup guides + AGENTS.md
```

**Design principles:**

- Adapters are framework-agnostic — works with any frontend
- Auth configured once, used by all apps
- Infrastructure as code — no manual dashboard configuration

---

## Documentation

| Guide                                | When to Read          |
| ------------------------------------ | --------------------- |
| [Setup Guide](docs/setup-guide.md)   | Initial setup         |
| [AGENTS.md](AGENTS.md)               | AI agent instructions |
| [Architecture](docs/architecture.md) | Code structure        |
| [Deployment](docs/deployment.md)     | Production deployment |

---

## AI Agent Support

This repo is designed for AI agents to understand and maintain. See [AGENTS.md](AGENTS.md) for:

- Project structure overview
- How to add new apps
- How to wire up services
- Deployment workflow

---

## License

MIT
