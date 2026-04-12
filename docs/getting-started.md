# Getting Started

## Before You Begin

**IMPORTANT**: Follow the [Setup Guide](setup-guide.md) first. It contains all manual configuration steps needed across every service (Supabase, Cloudflare, Resend, GitHub).

This page is a quick reference for running locally after setup is complete.

---

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/your-org/scaifold.git
cd scaifold
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase values

# 3. Start development
npm run dev:web
```

Open [http://localhost:5173](http://localhost:5173)

---

## Project Structure

```
scaifold/
├── apps/web/                    # Svelte frontend
│   ├── src/
│   │   ├── domain/             # Business logic (framework-free)
│   │   ├── application/        # Use cases and ports
│   │   ├── adapters/          # External service implementations
│   │   ├── ui/                # Svelte components
│   │   └── lib/               # Utilities
│   └── src-tauri/             # Tauri desktop shell
├── supabase/
│   ├── functions/              # Edge Functions
│   └── migrations/             # Database schema
├── infra/terraform/            # DNS infrastructure
└── docs/
    ├── setup-guide.md         # Complete setup (start here)
    ├── api-keys/              # Detailed API docs
    └── architecture.md        # Architecture patterns
```

---

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev:web` | Start frontend dev server |
| `npm run build -w web` | Build for production |
| `npm run test -w web` | Run unit tests |
| `npm run test:e2e -w web` | Run E2E tests |
| `npm run lint` | Run ESLint |

---

## Environment Variables

Only two are required locally:

```bash
VITE_PUBLIC_SUPABASE_URL=https://your-ref.supabase.co
VITE_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## Next Steps

1. **Setup Guide** → `docs/setup-guide.md` (if not already done)
2. **Architecture** → `docs/architecture.md`
3. **Kitchen App** → `apps/web/src/ui/kitchen/` - explore the demo modules
