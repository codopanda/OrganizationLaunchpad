# Apps

Place application repositories or app source folders here.

## Included scaffold

- **`web`** — Svelte + Vite (`npm run dev -w web`), static `dist/` output, optional Tauri shell in `src-tauri/`.

## New App Path

New apps should start from `templates/vanilla-auth-app`.

It gives you:

- framework-neutral auth integration
- shared `/login`, `/signup`, `/auth/callback`, and protected `/app` routes
- no dependency on app-specific UI from `apps/web`

Create a new app with:

```bash
npm run new:app -- my-new-app
npm install
npm run dev -w my-new-app
```

Guidelines:

- net-new apps should default to the framework-neutral starter unless there is a strong reason not to
- existing static apps are allowed if they can build to static assets
- keep business logic separated from UI concerns
- design apps so the same frontend can be deployed to the web and optionally wrapped with Tauri

Suggested convention:

```text
apps/<app-name>/
```
