# Apps

Place application repositories or app source folders here.

## Included scaffold

- **`web`** — Svelte + Vite (`npm run dev -w web`), static `dist/` output, optional Tauri shell in `src-tauri/`.

Guidelines:

- net-new frontend apps should use Svelte
- existing static apps are allowed if they can build to static assets
- keep business logic separated from UI concerns
- design apps so the same frontend can be deployed to the web and optionally wrapped with Tauri

Suggested convention:

```text
apps/<app-name>/
```

