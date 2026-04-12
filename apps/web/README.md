# `apps/web`

Svelte + Vite static site. Build output: `dist/`. Tauri desktop shell lives in `src-tauri/`.

This app is now the reference consumer of the shared auth shell in `shared/auth`. It is the primary external-test target for the current beta and does not own login/signup logic anymore.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production bundle to `dist/` |
| `npm run tauri:dev` | Desktop shell against Vite |
| `npm run tauri:build` | Desktop release build |

From the monorepo root, `npm run dev:web` and `npm run tauri:dev` are wired in the root `package.json`.

## Environment

Copy `.env.example` to `.env` or `.env.local` and set `VITE_PUBLIC_*` variables. See `docs/api-keys/` in the repo root.

## Auth Routes

The example app mounts the shared auth shell on:

- `/login`
- `/signup`
- `/auth/callback`
- `/dashboard`
