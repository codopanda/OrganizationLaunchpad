<script lang="ts">
  import { fetchHealth } from './lib/api';
  import { isSupabaseConfigured } from './lib/supabase';
  import { auth } from './ui/stores/auth.svelte';

  const health = fetchHealth();
</script>

<main class="wrap">
  <header class="hero">
    <p class="eyebrow">Scaifold</p>
    <h1>Platform shell</h1>
    <p class="lede">
      Svelte static app, Cloudflare Worker API, Supabase auth/data, Terraform DNS, and Tauri desktop—all wired for
      repeatable deploys.
    </p>
  </header>

  <section class="card">
    <h2>Worker API</h2>
    <p class="muted">
      Run <code>npm run dev:worker</code> from the repo root, then open this page. Override URL with
      <code>VITE_PUBLIC_API_URL</code>.
    </p>
    {#await health}
      <p class="muted">Contacting <code>/health</code>…</p>
    {:then data}
      <pre class="code">{JSON.stringify(data, null, 2)}</pre>
    {:catch err}
      <p class="error">
        {err instanceof Error ? err.message : String(err)}
      </p>
    {/await}
  </section>

  <section class="card">
    <h2>Supabase</h2>
    {#if isSupabaseConfigured}
      <p>Client is configured in <code>src/lib/supabase.ts</code>.</p>
      {#if auth.isAuthenticated}
        <p>Signed in as {auth.user?.email}</p>
        <a href="/dashboard">Go to Dashboard</a>
      {:else}
        <a href="/login">Sign In</a>
      {/if}
    {:else}
      <p class="muted">
        Set <code>VITE_PUBLIC_SUPABASE_URL</code> and <code>VITE_PUBLIC_SUPABASE_ANON_KEY</code> (see
        <code>docs/api-keys/</code>).
      </p>
    {/if}
  </section>
</main>
