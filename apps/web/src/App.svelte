<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchHealth } from './lib/api';
  import { isSupabaseConfigured } from './lib/auth';
  import DashboardPage from './ui/pages/DashboardPage.svelte';
  import LoginPage from './ui/pages/LoginPage.svelte';
  import SignUpPage from './ui/pages/SignUpPage.svelte';
  import CallbackPage from './ui/pages/CallbackPage.svelte';
  import { auth, initAuth } from './ui/stores/auth.svelte';

  const health = fetchHealth();

  let route = $state(window.location.pathname);

  function navigate(path: string) {
    window.history.pushState({}, '', path);
    route = path;
  }

  onMount(() => {
    initAuth();

    const handleRoute = () => {
      route = window.location.pathname;
    };

    window.addEventListener('popstate', handleRoute);
    return () => window.removeEventListener('popstate', handleRoute);
  });
</script>

{#if route === '/login'}
  <LoginPage />
{:else if route === '/signup'}
  <SignUpPage />
{:else if route === '/auth/callback'}
  <CallbackPage />
{:else if route === '/dashboard'}
  <DashboardPage />
{:else}
  <main class="wrap">
    <header class="hero">
      <p class="eyebrow">OrganizationLaunchpad</p>
      <h1>Portable auth shell for vibe-coded apps</h1>
      <p class="lede">
        Shared auth now lives outside the example app. This sample consumes the shell through Web Components and a
        minimal auth store.
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
      <h2>Shared Auth</h2>
      {#if isSupabaseConfigured}
        <p class="muted">
          Auth is configured in <code>shared/auth</code>. The app mounts shared login screens and reads the shared
          session state.
        </p>
        {#if auth.isAuthenticated}
          <p>Signed in as {auth.user?.email}</p>
          <button class="link-button" onclick={() => navigate('/dashboard')}>Go to Dashboard</button>
        {:else}
          <div class="actions">
            <button class="link-button" onclick={() => navigate('/login')}>Sign In</button>
            <button class="link-button secondary" onclick={() => navigate('/signup')}>Sign Up</button>
          </div>
        {/if}
      {:else}
        <p class="muted">
          Set <code>VITE_PUBLIC_SUPABASE_URL</code> and <code>VITE_PUBLIC_SUPABASE_ANON_KEY</code> to enable the shared
          auth shell.
        </p>
      {/if}
    </section>
  </main>
{/if}
