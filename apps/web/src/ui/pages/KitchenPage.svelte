<script lang="ts">
  import AlarmWidget from '@/ui/kitchen/AlarmWidget.svelte';
  import CameraWidget from '@/ui/kitchen/CameraWidget.svelte';
  import NotificationWidget from '@/ui/kitchen/NotificationWidget.svelte';
  import FeedbackWidget from '@/ui/kitchen/FeedbackWidget.svelte';
  import StripeWidget from '@/ui/kitchen/StripeWidget.svelte';
  import PostHogWidget from '@/ui/kitchen/PostHogWidget.svelte';
  import EmailWidget from '@/ui/kitchen/EmailWidget.svelte';

  let alarmComplete = $state(false);
  let feedbackSubmitted = $state(false);

  function navigate(path: string) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
</script>

<div class="kitchen-page">
  <header class="header">
    <div class="header-left">
      <button class="back-btn" onclick={() => navigate('/')}>← Home</button>
      <div>
        <h1>Kitchen Sink</h1>
        <p class="subtitle">Every integration, all in one place</p>
      </div>
    </div>
    <button class="btn-ghost" onclick={() => navigate('/dashboard')}>Dashboard →</button>
  </header>

  <main class="grid">
    <!-- Business services -->
    <section class="card">
      <StripeWidget />
    </section>

    <section class="card">
      <PostHogWidget />
    </section>

    <section class="card">
      <EmailWidget />
    </section>

    <section class="card">
      <FeedbackWidget onSuccess={() => (feedbackSubmitted = true)} />
      {#if feedbackSubmitted}
        <p class="status success">Feedback saved to Supabase!</p>
      {/if}
    </section>

    <!-- Device / browser capabilities -->
    <section class="card">
      <h3>Timer</h3>
      <AlarmWidget initialSeconds={10} onComplete={() => (alarmComplete = true)} />
      {#if alarmComplete}
        <p class="status success">Done!</p>
      {/if}
    </section>

    <section class="card">
      <h3>Camera</h3>
      <CameraWidget />
    </section>

    <section class="card">
      <h3>Notifications</h3>
      <NotificationWidget />
    </section>
  </main>
</div>

<style>
  .kitchen-page {
    min-height: 100vh;
    background: var(--bg);
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    flex-wrap: wrap;
    gap: 1rem;
  }

  .header-left { display: flex; align-items: center; gap: 1rem; }

  .back-btn {
    background: none;
    border: none;
    color: var(--muted);
    font-size: 0.875rem;
    cursor: pointer;
    padding: 0.25rem;
  }

  .back-btn:hover { color: var(--text); }

  h1 { margin: 0; font-size: 1.25rem; }

  .subtitle { margin: 0.125rem 0 0; color: var(--muted); font-size: 0.8rem; }

  .btn-ghost {
    background: transparent;
    border: none;
    color: var(--muted);
    font-size: 0.875rem;
    cursor: pointer;
  }

  .btn-ghost:hover { color: var(--text); }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .card {
    padding: 1.5rem;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface);
  }

  .card h3 { margin: 0 0 1rem; font-size: 1rem; }

  .status {
    margin: 1rem 0 0;
    padding: 0.5rem;
    border-radius: 6px;
    font-size: 0.875rem;
    text-align: center;
  }

  .status.success {
    color: #34d399;
    background: rgba(52, 211, 153, 0.1);
  }

  @media (max-width: 640px) {
    .header { padding: 1rem; }
    .grid { padding: 1rem; gap: 1rem; }
  }
</style>
