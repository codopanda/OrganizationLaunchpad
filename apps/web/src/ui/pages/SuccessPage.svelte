<script lang="ts">
  import { onMount } from 'svelte';
  import { track } from '@/lib/posthog';

  onMount(() => {
    track('payment_success', {
      session_id: new URLSearchParams(window.location.search).get('session_id'),
    });
  });

  function goToDashboard() {
    window.history.pushState({}, '', '/dashboard');
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
</script>

<div class="success-page">
  <div class="card">
    <div class="icon">✓</div>
    <h1>You're now a Pro member!</h1>
    <p class="lede">
      Your payment was successful. A receipt has been sent to your email. All Pro features are now
      unlocked.
    </p>
    <button class="btn-primary" onclick={goToDashboard}>Go to Dashboard</button>
  </div>
</div>

<style>
  .success-page {
    min-height: 100vh;
    background: var(--bg);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .card {
    max-width: 420px;
    width: 100%;
    padding: 3rem 2rem;
    border: 1px solid var(--border);
    border-radius: 16px;
    background: var(--surface);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: rgba(52, 211, 153, 0.15);
    color: #34d399;
    font-size: 1.5rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 650;
    letter-spacing: -0.02em;
  }

  .lede {
    color: var(--muted);
    margin: 0;
    font-size: 0.9375rem;
    line-height: 1.6;
  }

  .btn-primary {
    padding: 0.75rem 2rem;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s;
    margin-top: 0.5rem;
  }

  .btn-primary:hover {
    opacity: 0.9;
  }
</style>
