<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchHealth } from './lib/api';
  import { isSupabaseConfigured } from './lib/supabase';
  import { identify, track } from './lib/posthog';
  import { auth, initAuth } from './ui/stores/auth.svelte';
  import DashboardPage from './ui/pages/DashboardPage.svelte';
  import LoginPage from './ui/pages/LoginPage.svelte';
  import SignUpPage from './ui/pages/SignUpPage.svelte';
  import CallbackPage from './ui/pages/CallbackPage.svelte';
  import PricingPage from './ui/pages/PricingPage.svelte';
  import SuccessPage from './ui/pages/SuccessPage.svelte';
  import KitchenPage from './ui/pages/KitchenPage.svelte';

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
      track('$pageview', { path: route });
    };

    window.addEventListener('popstate', handleRoute);

    // Identify the user in PostHog once auth is ready
    const unsubscribe = auth.user
      ? (identify(auth.user.id, { email: auth.user.email }), () => {})
      : () => {};

    return () => {
      window.removeEventListener('popstate', handleRoute);
      unsubscribe();
    };
  });

  $effect(() => {
    if (auth.user) {
      identify(auth.user.id, { email: auth.user.email });
    }
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
{:else if route === '/pricing'}
  <PricingPage />
{:else if route === '/success'}
  <SuccessPage />
{:else if route === '/kitchen'}
  <KitchenPage />
{:else}
  <main class="wrap">
    <header class="hero">
      <p class="eyebrow">OrganizationLaunchpad</p>
      <h1>Ship your app with a full business stack</h1>
      <p class="lede">
        Auth, payments, email, and analytics — all wired together and ready to deploy.
      </p>
      <div class="hero-actions">
        <button class="btn-primary" onclick={() => navigate('/pricing')}>View Pricing</button>
        <button class="btn-secondary" onclick={() => navigate('/kitchen')}>Kitchen Sink Demo</button>
      </div>
    </header>

    <section class="card">
      <h2>Services</h2>
      <div class="service-grid">
        <div class="service">
          <span class="service-icon">🔐</span>
          <div>
            <strong>Auth</strong>
            <p>{isSupabaseConfigured ? 'Supabase configured' : 'Configure VITE_PUBLIC_SUPABASE_URL'}</p>
          </div>
        </div>
        <div class="service">
          <span class="service-icon">💳</span>
          <div>
            <strong>Payments</strong>
            <p>Stripe checkout + webhooks</p>
          </div>
        </div>
        <div class="service">
          <span class="service-icon">✉️</span>
          <div>
            <strong>Email</strong>
            <p>Resend via Supabase edge functions</p>
          </div>
        </div>
        <div class="service">
          <span class="service-icon">📊</span>
          <div>
            <strong>Analytics</strong>
            <p>PostHog event tracking</p>
          </div>
        </div>
      </div>
    </section>

    <section class="card">
      <h2>Auth</h2>
      {#if isSupabaseConfigured}
        {#if auth.isAuthenticated}
          <p>Signed in as {auth.user?.email}</p>
          <div class="actions">
            <button class="link-button" onclick={() => navigate('/dashboard')}>Dashboard</button>
            <button class="link-button" onclick={() => navigate('/pricing')}>Pricing</button>
          </div>
        {:else}
          <div class="actions">
            <button class="link-button" onclick={() => navigate('/login')}>Sign In</button>
            <button class="link-button secondary" onclick={() => navigate('/signup')}>Sign Up</button>
          </div>
        {/if}
      {:else}
        <p class="muted">
          Set <code>VITE_PUBLIC_SUPABASE_URL</code> and <code>VITE_PUBLIC_SUPABASE_ANON_KEY</code> to enable auth.
        </p>
      {/if}
    </section>

    <section class="card">
      <h2>Edge Function Health</h2>
      <p class="muted">
        Run <code>npm run dev:worker</code> or deploy edge functions to test.
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
  </main>
{/if}

<style>
  .hero-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1.5rem;
    flex-wrap: wrap;
  }

  .btn-primary {
    padding: 0.625rem 1.25rem;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .btn-primary:hover { opacity: 0.9; }

  .btn-secondary {
    padding: 0.625rem 1.25rem;
    background: transparent;
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 0.9375rem;
    cursor: pointer;
    transition: border-color 0.2s;
  }

  .btn-secondary:hover { border-color: var(--muted); }

  .service-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .service {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .service-icon { font-size: 1.25rem; margin-top: 0.1rem; }

  .service strong { font-size: 0.9375rem; display: block; }

  .service p {
    margin: 0.125rem 0 0;
    font-size: 0.8rem;
    color: var(--muted);
  }

  .actions {
    display: flex;
    gap: 1rem;
    margin-top: 0.75rem;
  }

  code {
    font-size: 0.85em;
    background: var(--code, #11131a);
    padding: 0.1em 0.35em;
    border-radius: 4px;
  }
</style>
