<script lang="ts">
  let isOnline = $state(typeof navigator !== 'undefined' ? navigator.onLine : true);

  $effect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => (isOnline = true);
    const handleOffline = () => (isOnline = false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });
</script>

{#if !isOnline}
  <div class="offline-indicator">
    <span class="icon">📡</span>
    <span>You are offline</span>
  </div>
{/if}

<style>
  .offline-indicator {
    position: fixed;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    background: #1a1a1a;
    color: #fff;
    padding: 0.75rem 1.5rem;
    border-radius: 2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: system-ui, sans-serif;
    font-size: 0.875rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 9999;
  }

  .icon {
    font-size: 1rem;
  }
</style>
