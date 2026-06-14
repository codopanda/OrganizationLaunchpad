<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '@/lib/auth';
  import { getSubscription, redirectToCheckout, STRIPE_PRICE_ID } from '@/lib/stripe';
  import { isSupabaseConfigured } from '@/lib/supabase';
  import { track } from '@/lib/posthog';

  type Subscription = {
    plan: 'free' | 'pro';
    status: string;
    current_period_end: string | null;
    stripe_subscription_id: string | null;
  } | null;

  let subscription = $state<Subscription>(null);
  let loading = $state(true);
  let upgradeStatus = $state<'idle' | 'loading' | 'error'>('idle');
  let errorMessage = $state('');

  const isConfigured = isSupabaseConfigured && Boolean(STRIPE_PRICE_ID);

  onMount(async () => {
    if (!isSupabaseConfigured) { loading = false; return; }

    const { user } = await auth.getCurrentUser();
    if (user) {
      subscription = await getSubscription(user.id);
    }
    loading = false;
  });

  async function handleUpgrade() {
    const { user } = await auth.getCurrentUser();
    if (!user) return;

    upgradeStatus = 'loading';
    track('upgrade_clicked', { source: 'stripe_widget' });

    const { error } = await redirectToCheckout(user.id, user.email ?? '');
    if (error) {
      upgradeStatus = 'error';
      errorMessage = error;
    }
  }

  const periodEnd = $derived(
    subscription?.current_period_end
      ? new Date(subscription.current_period_end).toLocaleDateString()
      : null,
  );
</script>

<div class="stripe-widget">
  <div class="widget-header">
    <h3>Payments</h3>
    <span class="badge" class:configured={isConfigured}>
      {isConfigured ? 'Stripe configured' : 'Not configured'}
    </span>
  </div>

  {#if !isConfigured}
    <p class="notice">
      Set <code>VITE_PUBLIC_STRIPE_PRICE_ID</code> and configure Supabase to enable payments.
    </p>
  {:else if loading}
    <p class="muted">Loading…</p>
  {:else if subscription?.plan === 'pro' && subscription.status === 'active'}
    <div class="status active">
      <span class="dot"></span>
      <div>
        <strong>Pro — Active</strong>
        {#if periodEnd}<p class="sub">Renews {periodEnd}</p>{/if}
      </div>
    </div>
    <p class="muted small">Subscription managed via Stripe dashboard.</p>
  {:else}
    <div class="status inactive">
      <span class="dot"></span>
      <div><strong>Free plan</strong></div>
    </div>
    <button
      class="btn-primary"
      onclick={handleUpgrade}
      disabled={upgradeStatus === 'loading'}
    >
      {upgradeStatus === 'loading' ? 'Redirecting…' : 'Upgrade to Pro — $9/mo'}
    </button>
    {#if upgradeStatus === 'error'}
      <p class="error">{errorMessage}</p>
    {/if}
  {/if}
</div>

<style>
  .stripe-widget {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .widget-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  h3 {
    margin: 0;
    font-size: 1rem;
  }

  .badge {
    font-size: 0.7rem;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
    font-weight: 500;
  }

  .badge.configured {
    background: rgba(52, 211, 153, 0.15);
    color: #34d399;
  }

  .status {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    border-radius: 8px;
    background: var(--bg);
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .active .dot { background: #34d399; }
  .inactive .dot { background: var(--muted); }

  .status strong { font-size: 0.9375rem; }
  .sub { margin: 0.125rem 0 0; font-size: 0.8rem; color: var(--muted); }

  .btn-primary {
    width: 100%;
    padding: 0.75rem;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .btn-primary:hover:not(:disabled) { opacity: 0.9; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

  .notice, .muted { color: var(--muted); font-size: 0.875rem; margin: 0; }
  .small { font-size: 0.8rem; }
  .error { color: var(--error); font-size: 0.875rem; margin: 0; }

  code {
    font-size: 0.8rem;
    background: var(--code, #11131a);
    padding: 0.1em 0.4em;
    border-radius: 4px;
  }
</style>
