# CLAUDE.md

This repository is a scaffold for productionizing static web applications with:

- Svelte frontends for net-new apps
- Cloudflare Workers for backend APIs
- Supabase for auth and data
- Terraform for infrastructure
- Tauri for desktop packaging where needed

## Architecture direction

Use hexagonal architecture as the default mental model.

The goal is to keep product logic independent from frameworks, hosting providers, and UI details so apps can evolve without rewriting the core.

## Recommended boundaries

### Domain

Put business rules and domain models in framework-free modules.

The domain layer should not depend on:

- Svelte
- Cloudflare Worker runtime APIs
- Supabase client libraries directly
- Tauri APIs
- Terraform concerns

Domain code should express:

- entities
- value objects
- use-case rules
- invariants
- domain services

### Application

The application layer coordinates use cases.

It should define ports for things such as:

- user repositories
- session/auth services
- billing providers
- notification services
- file storage
- external API clients

Application code depends on ports, not providers.

### Adapters

Adapters implement the ports.

Examples:

- a Supabase adapter for auth and persistence
- a Cloudflare Worker adapter for HTTP entrypoints
- a Tauri adapter for desktop integrations
- a third-party API adapter for Stripe, OpenAI, or similar services

Adapters are where vendor-specific code belongs.

### Frontend

For net-new applications, use Svelte.

Frontend code should:

- call application-facing APIs, not embed backend business rules
- keep view state separate from domain rules
- avoid binding directly to vendor SDK behavior when an internal abstraction is reasonable

If a static app is imported from elsewhere, preserve its existing stack only when rewriting would not pay off.

## Repository patterns

### Per-app layout

Each app should aim for a structure close to:

```text
apps/<app-name>/
  src/
    domain/
    application/
    adapters/
    ui/
```

This does not need to be rigid, but the separation should remain obvious.

### Worker layout

Workers should stay thin. A Worker should mostly:

1. parse the request
2. authenticate it
3. call an application use case
4. translate the result into an HTTP response

Do not let Workers become the place where all business logic accumulates.

### Supabase usage

Supabase is an infrastructure dependency, not the system design.

Treat it as an adapter behind ports when possible. Keep SQL, auth policies, and client setup out of core business logic.

### Terraform usage

Terraform should encode the platform topology:

- domains and subdomains
- Cloudflare resources
- Supabase-related environment configuration references
- deploy-time wiring for apps and Workers

Avoid manual dashboard configuration when the same setup can live in code.

## Decision rules

- Prefer simple ports over leaking SDK types throughout the codebase.
- Prefer static generation and edge-friendly deployment models.
- Prefer one clear responsibility per adapter.
- Prefer explicit environment variable contracts.
- Prefer composition over hidden framework magic.

## What to avoid

- business logic inside Svelte components
- business logic inside Cloudflare request handlers
- direct vendor SDK calls scattered across the app
- coupling core application flow to Supabase table shapes
- mixing deployment concerns with domain rules

## Definition of done for new apps

A new app is in good shape when:

- the frontend can be built as static assets
- core use cases can be reasoned about without framework knowledge
- Worker handlers are thin
- Supabase is isolated behind clear boundaries where practical
- infrastructure assumptions are documented and reproducible
- required API keys and setup steps are documented in `docs/api-keys/`

