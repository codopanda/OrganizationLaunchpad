<script lang="ts">
  import AlarmWidget from '@/ui/kitchen/AlarmWidget.svelte';
  import CameraWidget from '@/ui/kitchen/CameraWidget.svelte';
  import NotificationWidget from '@/ui/kitchen/NotificationWidget.svelte';
  import FeedbackWidget from '@/ui/kitchen/FeedbackWidget.svelte';

  let alarmComplete = $state(false);
  let cameraActive = $state(false);
  let notificationCount = $state(0);
  let feedbackSubmitted = $state(false);

  function handleAlarmComplete() {
    alarmComplete = true;
    setTimeout(() => (alarmComplete = false), 3000);
  }

  function handleCameraToggle() {
    cameraActive = !cameraActive;
  }

  function handleNotification() {
    notificationCount++;
    setTimeout(() => (notificationCount = Math.max(0, notificationCount - 1)), 5000);
  }

  function handleFeedbackSubmit(rating: number) {
    feedbackSubmitted = true;
    setTimeout(() => (feedbackSubmitted = false), 3000);
  }

  let widgetCount = $derived(4);
</script>

<div class="kitchen-page">
  <header class="header">
    <h1>Kitchen App Demo</h1>
    <p class="subtitle">Showcasing modular kitchen widgets</p>
  </header>

  <main class="grid">
    <section class="card">
      <h2>Alarm Widget</h2>
      <AlarmWidget initialSeconds={10} onComplete={handleAlarmComplete} />
      {#if alarmComplete}
        <p class="status success">Alarm completed!</p>
      {/if}
    </section>

    <section class="card">
      <h2>Camera Widget</h2>
      <CameraWidget />
      <p class="status" class:active={cameraActive}>
        Camera is {cameraActive ? 'active' : 'inactive'}
      </p>
    </section>

    <section class="card">
      <h2>Notification Widget</h2>
      <NotificationWidget />
      <p class="status">
        Notifications: {notificationCount} pending
      </p>
    </section>

    <section class="card">
      <h2>Feedback Widget</h2>
      <FeedbackWidget onSubmit={handleFeedbackSubmit} />
      {#if feedbackSubmitted}
        <p class="status success">Thank you for your feedback!</p>
      {/if}
    </section>
  </main>

  <footer class="footer">
    <p>{widgetCount} widgets available</p>
  </footer>
</div>

<style>
  .kitchen-page {
    min-height: 100vh;
    background: var(--bg);
    padding: 0;
  }

  .header {
    padding: 2rem;
    text-align: center;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
  }

  .header h1 {
    margin: 0;
    font-size: 1.75rem;
  }

  .subtitle {
    margin: 0.5rem 0 0;
    color: var(--muted);
    font-size: 0.875rem;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
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

  .card h2 {
    margin: 0 0 1rem;
    font-size: 1rem;
    color: var(--text);
  }

  .status {
    margin: 1rem 0 0;
    padding: 0.5rem;
    border-radius: 6px;
    font-size: 0.875rem;
    text-align: center;
    background: var(--bg);
    color: var(--muted);
  }

  .status.active {
    color: var(--success);
    background: rgba(34, 197, 94, 0.1);
  }

  .status.success {
    color: var(--success);
    background: rgba(34, 197, 94, 0.1);
  }

  .footer {
    padding: 1rem 2rem;
    text-align: center;
    border-top: 1px solid var(--border);
    color: var(--muted);
    font-size: 0.875rem;
  }

  .footer p {
    margin: 0;
  }

  @media (max-width: 640px) {
    .header {
      padding: 1.5rem 1rem;
    }

    .header h1 {
      font-size: 1.5rem;
    }

    .grid {
      padding: 1rem;
      gap: 1rem;
    }
  }
</style>
