<script lang="ts">
  import { auth } from '@/lib/auth';
  import { redirectToCheckout, STRIPE_PRICE_ID } from '@/lib/stripe';
  import { track } from '@/lib/posthog';
  import { isSupabaseConfigured } from '@/lib/supabase';

  let status = $state<'idle' | 'loading' | 'error'>('idle');
  let errorMessage = $state('');

  const isStripeConfigured = Boolean(STRIPE_PRICE_ID);

  async function handleUpgrade() {
    if (!auth.isConfigured) {
      window.history.pushState({}, '', '/signup');
      window.dispatchEvent(new PopStateEvent('popstate'));
      return;
    }

    const { user } = await auth.getCurrentUser();
    if (!user) {
      window.history.pushState({}, '', '/login');
      window.dispatchEvent(new PopStateEvent('popstate'));
      return;
    }

    status = 'loading';
    track('upgrade_clicked', { plan: 'pro' });

    const { error } = await redirectToCheckout(user.id, user.email ?? '');
    if (error) {
      status = 'error';
      errorMessage = error;
    }
  }
</script>

<div class="pricing-page">
  <header class="hero">
    <p class="eyebrow">Pricing</p>
    <h1>Simple, honest pricing</h1>
    <p class="lede">Start free. Upgrade when you're ready.</p>
  </header>

  <main class="cards">
    <div class="plan">
      <div class="plan-header">
        <h2>Free</h2>
        <div class="price"><span class="amount">$0</span><span class="period">/month</span></div>
      </div>
      <ul class="features">
        <li>User authentication</li>
        <li>Supabase database</li>
        <li>Community support</li>
      </ul>
      <button class="btn-secondary" disabled>Current plan</button>
    </div>

    <div class="plan featured">
      <div class="badge">Most popular</div>
      <div class="plan-header">
        <h2>Pro</h2>
        <div class="price"><span class="amount">$9</span><span class="period">/month</span></div>
      </div>
      <ul class="features">
        <li>Everything in Free</li>
        <li>Priority email support</li>
        <li>Advanced analytics</li>
        <li>Remove branding</li>
      </ul>

      {#if !isSupabaseConfigured || !isStripeConfigured}
        <p class="config-notice">
          {!isSupabaseConfigured ? 'Configure Supabase' : 'Set VITE_PUBLIC_STRIPE_PRICE_ID'} to enable checkout
        </p>
      {/if}

      <button
        class="btn-primary"
        onclick={handleUpgrade}
        disabled={status === 'loading' || (!isSupabaseConfigured || !isStripeConfigured)}
      >
        {status === 'loading' ? 'Redirecting to checkout…' : 'Upgrade to Pro'}
      </button>

      {#if status === 'error'}
        <p class="error">{errorMessage}</p>
      {/if}
    </div>
  </main>
</div>

<style>
  .pricing-page {
    min-height: 100vh;
    background: var(--bg);
    padding: 4rem 1.5rem;
  }

  .hero {
    text-align: center;
    max-width: 480px;
    margin: 0 auto 3rem;
  }

  .eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 0.75rem;
    color: var(--muted);
    margin: 0 0 0.5rem;
  }

  h1 {
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 650;
    letter-spacing: -0.03em;
    margin: 0 0 0.75rem;
  }

  .lede {
    color: var(--muted);
    margin: 0;
  }

  .cards {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    flex-wrap: wrap;
    max-width: 720px;
    margin: 0 auto;
  }

  .plan {
    position: relative;
    flex: 1;
    min-width: 260px;
    max-width: 320px;
    padding: 2rem;
    border: 1px solid var(--border);
    border-radius: 16px;
    background: var(--surface);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .plan.featured {
    border-color: var(--accent);
    box-shadow: 0 0 0 1px var(--accent);
  }

  .badge {
    position: absolute;
    top: -0.75rem;
    left: 50%;
    transform: translateX(-50%);
    background: var(--accent);
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    white-space: nowrap;
  }

  .plan-header h2 {
    margin: 0 0 0.5rem;
    font-size: 1.25rem;
  }

  .price {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
  }

  .amount {
    font-size: 2.5rem;
    font-weight: 700;
    letter-spacing: -0.03em;
  }

  .period {
    color: var(--muted);
    font-size: 0.875rem;
  }

  .features {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    flex: 1;
  }

  .features li {
    font-size: 0.9375rem;
    color: var(--text);
    padding-left: 1.25rem;
    position: relative;
  }

  .features li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: #34d399;
    font-weight: 700;
  }

  .btn-primary {
    width: 100%;
    padding: 0.75rem;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .btn-primary:hover:not(:disabled) {
    opacity: 0.9;
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-secondary {
    width: 100%;
    padding: 0.75rem;
    background: transparent;
    color: var(--muted);
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 0.9375rem;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .config-notice {
    font-size: 0.75rem;
    color: var(--muted);
    font-style: italic;
    margin: 0;
    text-align: center;
  }

  .error {
    color: var(--error);
    font-size: 0.875rem;
    margin: 0;
    text-align: center;
  }
</style>
