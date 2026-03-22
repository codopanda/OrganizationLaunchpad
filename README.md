# Scaifold

Scaifold is a starting point for turning vibecoded apps into software that can survive inside a real company.

It is meant to give AI-generated apps the infrastructure they usually skip:

- deployable static web apps
- packaged desktop builds with Tauri
- backend APIs with Cloudflare Workers
- authentication and data with Supabase
- infrastructure automation with Terraform
- a place to document how to obtain the API keys each platform requires

## Core idea

Clone this repo, then drop one or more application repos into it.

Scaifold provides the platform shell around those apps so they can be deployed, packaged, and operated with a more repeatable structure.

## Technology choices

- `Tauri` for compiling static web apps into desktop applications
- `Cloudflare Workers` for backend APIs and edge logic
- `Terraform` for infrastructure provisioning
- `Supabase` for user accounts, auth, and backend data services
- `Svelte` as the default frontend choice for net-new applications
- Support for `any static site application` when integrating existing apps

## Intended repo structure

```text
apps/
  <app-name>/
workers/
  <worker-name>/
infra/
  terraform/
supabase/
docs/
  api-keys/
```

## How this is intended to work

### Static apps

Application code lives under `apps/`. Each app should build to static assets.

For net-new apps, prefer Svelte. Existing static apps can still be adopted as long as they can output static assets that can be hosted and optionally wrapped with Tauri.

### Tauri

Tauri should be used when an app needs a desktop distribution. In most cases, the desktop shell should point at the same frontend app already used for the web deployment instead of creating a separate UI stack.

### Cloudflare Workers

Backend APIs should live under `workers/`. Keep Workers thin:

- request validation
- auth/session checks
- orchestration
- integration with Supabase or third-party APIs

Avoid putting frontend-specific logic inside Workers.

### Terraform and subdomains

Infrastructure code should live under `infra/terraform/`.

The intended pattern is that Terraform maps folder names to subdomains. For example:

- `apps/admin` -> `admin.<domain>`
- `apps/marketing` -> `marketing.<domain>`
- `workers/api` -> `api.<domain>`

This convention should keep deployment topology obvious from the repo layout.

### Supabase

Supabase owns:

- user account setup
- authentication
- database access
- storage
- policies and backend primitives needed by the apps

Project-specific Supabase migrations, policies, and seed data should live under `supabase/`.

### API key onboarding

Many AI-generated apps fail at operational handoff because nobody documents where credentials come from.

Use `docs/api-keys/` to track:

- which services are required
- where to create each account
- which environment variables are needed
- who should own the credential in production
- any rotation or scope requirements

## Principles

- keep apps static-first where possible
- push backend logic to Cloudflare Workers
- keep data and auth in Supabase
- automate infra with Terraform rather than ad hoc dashboard setup
- make onboarding explicit, especially for secrets and third-party services
- prefer boring deployability over clever local hacks

## Next recommended steps

1. Add a first app under `apps/`.
2. Define Terraform that maps app and worker folder names to subdomains.
3. Add Supabase project setup, schema, and auth configuration.
4. Add Cloudflare Worker entrypoints for backend APIs.
5. Fill in `docs/api-keys/README.md` with the exact services your first app needs.

