<script lang="ts">
  import { onMount } from 'svelte';
  import { auth as authClient } from '@/lib/auth';
  import { getSubscription } from '@/lib/stripe';
  import { isSupabaseConfigured } from '@/lib/supabase';
  import { isPostHogConfigured, track } from '@/lib/posthog';
  import { STRIPE_PRICE_ID } from '@/lib/stripe';
  import type { User } from '@shared/auth';
  import Toast from '@/ui/components/Toast.svelte';

  type Subscription = {
    plan: 'free' | 'pro';
    status: string;
    current_period_end: string | null;
  } | null;

  let user = $state<User | null>(null);
  let subscription = $state<Subscription>(null);
  let loading = $state(true);
  let toastMessage = $state('');
  let toastType = $state<'success' | 'error'>('error');

  const services = $derived([
    {
      name: 'Supabase',
      description: 'Auth + Database',
      ok: isSupabaseConfigured,
      hint: 'Set VITE_PUBLIC_SUPABASE_URL and VITE_PUBLIC_SUPABASE_ANON_KEY',
    },
    {
      name: 'Stripe',
      description: 'Payments',
      ok: Boolean(STRIPE_PRICE_ID),
      hint: 'Set VITE_PUBLIC_STRIPE_PRICE_ID',
    },
    {
      name: 'PostHog',
      description: 'Analytics',
      ok: isPostHogConfigured,
      hint: 'Set VITE_PUBLIC_POSTHOG_KEY',
    },
    {
      name: 'Resend',
      description: 'Email (via edge function)',
      ok: isSupabaseConfigured,
      hint: 'Deploy send-email edge function with RESEND_API_KEY secret',
    },
  ]);

  onMount(async () => {
    if (!authClient.isConfigured) { loading = false; return; }

    authClient.getCurrentUser().then(async ({ user: currentUser }) => {
      user = currentUser;
      if (currentUser) {
        track('dashboard_viewed', { user_id: currentUser.id });
        subscription = await getSubscription(currentUser.id);
      }
      loading = false;
    });

    return authClient.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        user = session?.user ?? null;
      } else if (event === 'SIGNED_OUT') {
        user = null;
      }
    });
  });

  async function handleSignOut() {
    track('signed_out');
    const { error } = await authClient.signOut();
    if (error) {
      toastMessage = error.message;
      toastType = 'error';
      return;
    }
    toastMessage = 'Signed out';
    toastType = 'success';
    authClient.navigate(authClient.config.postLogoutPath);
  }

  function navigate(path: string) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  const periodEnd = $derived(
    subscription?.current_period_end
      ? new Date(subscription.current_period_end).toLocaleDateString()
      : null,
  );
</script>

<organization-launchpad-auth-guard heading="Dashboard Access" message="Sign in to view your dashboard.">
  <div class="dashboard">
    <header class="header">
      <h1>Dashboard</h1>
      <div class="header-right">
        <button class="btn-ghost" onclick={() => navigate('/kitchen')}>Kitchen Sink</button>
        <button class="btn-ghost" onclick={() => navigate('/pricing')}>Pricing</button>
        <button class="btn-secondary" onclick={handleSignOut}>Sign Out</button>
      </div>
    </header>

    <main class="content">
      <!-- User + Subscription -->
      <div class="top-row">
        <section class="card">
          <h2>Account</h2>
          {#if loading}
            <p class="muted">Loading…</p>
          {:else if user}
            <dl class="info">
              <dt>Email</dt>
              <dd>{user.email}</dd>
              <dt>User ID</dt>
              <dd class="mono">{user.id}</dd>
            </dl>
          {:else}
            <p class="muted">Not signed in</p>
          {/if}
        </section>

        <section class="card">
          <h2>Subscription</h2>
          {#if loading}
            <p class="muted">Loading…</p>
          {:else if subscription?.plan === 'pro' && subscription.status === 'active'}
            <div class="plan-badge pro">Pro</div>
            {#if periodEnd}<p class="muted small">Renews {periodEnd}</p>{/if}
          {:else}
            <div class="plan-badge free">Free</div>
            <button class="btn-primary small" onclick={() => navigate('/pricing')}>
              Upgrade to Pro
            </button>
          {/if}
        </section>
      </div>

      <!-- Integration Health -->
      <section class="card">
        <h2>Integrations</h2>
        <div class="integration-grid">
          {#each services as service}
            <div class="integration">
              <div class="integration-status">
                <span class="dot" class:ok={service.ok} class:err={!service.ok}></span>
                <strong>{service.name}</strong>
                <span class="integration-desc">{service.description}</span>
              </div>
              {#if !service.ok}
                <p class="hint">{service.hint}</p>
              {/if}
            </div>
          {/each}
        </div>
      </section>
    </main>
  </div>
</organization-launchpad-auth-guard>

{#if toastMessage}
  <Toast message={toastMessage} type={toastType} onClose={() => (toastMessage = '')} />
{/if}

<style>
  .dashboard { min-height: 100vh; background: var(--bg); }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    gap: 1rem;
    flex-wrap: wrap;
  }

  .header h1 { margin: 0; font-size: 1.25rem; }

  .header-right { display: flex; gap: 0.5rem; align-items: center; }

  .content {
    padding: 2rem;
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .top-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  @media (max-width: 600px) {
    .top-row { grid-template-columns: 1fr; }
    .header { padding: 1rem; }
    .content { padding: 1rem; }
  }

  .card {
    padding: 1.5rem;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface);
  }

  .card h2 { margin: 0 0 1rem; font-size: 1rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; font-size: 0.75rem; }

  .info {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.5rem 1rem;
    margin: 0;
  }

  dt { color: var(--muted); font-size: 0.8rem; }
  dd { margin: 0; font-size: 0.875rem; }
  dd.mono { font-family: monospace; font-size: 0.75rem; word-break: break-all; }

  .plan-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  .plan-badge.pro { background: rgba(124, 58, 237, 0.2); color: #a78bfa; }
  .plan-badge.free { background: var(--bg); color: var(--muted); border: 1px solid var(--border); }

  .btn-primary {
    padding: 0.5rem 1rem;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .btn-primary.small { padding: 0.375rem 0.75rem; font-size: 0.8rem; }

  .btn-ghost {
    padding: 0.5rem 0.75rem;
    background: transparent;
    color: var(--muted);
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: color 0.15s;
  }

  .btn-ghost:hover { color: var(--text); }

  .btn-secondary {
    background: transparent;
    color: var(--text);
    border: 1px solid var(--border);
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    cursor: pointer;
  }

  .integration-grid { display: flex; flex-direction: column; gap: 1rem; }

  .integration { display: flex; flex-direction: column; gap: 0.25rem; }

  .integration-status { display: flex; align-items: center; gap: 0.5rem; }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .dot.ok { background: #34d399; }
  .dot.err { background: #f87171; }

  .integration-status strong { font-size: 0.9375rem; }

  .integration-desc { font-size: 0.8rem; color: var(--muted); margin-left: 0.25rem; }

  .hint { margin: 0 0 0 1.25rem; font-size: 0.775rem; color: var(--muted); font-family: monospace; }

  .muted { color: var(--muted); font-size: 0.875rem; margin: 0; }
  .small { font-size: 0.8rem; }
</style>
