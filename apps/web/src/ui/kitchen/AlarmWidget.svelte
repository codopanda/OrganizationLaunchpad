<script lang="ts">
  interface Props {
    initialSeconds?: number;
    onComplete?: () => void;
  }

  let { initialSeconds = 60, onComplete }: Props = $props();

  let seconds = $state(0);
  let isRunning = $state(false);
  let isPaused = $state(false);
  let intervalId: ReturnType<typeof setInterval> | null = null;

  function formatTime(totalSeconds: number): string {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function tick() {
    if (seconds > 0) {
      seconds--;
    } else {
      stop();
      sendNotification();
      onComplete?.();
    }
  }

  function start() {
    if (isRunning && !isPaused) return;
    
    isRunning = true;
    isPaused = false;
    intervalId = setInterval(tick, 1000);
  }

  function pause() {
    if (!isRunning || isPaused) return;
    
    isPaused = true;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function stop() {
    isRunning = false;
    isPaused = false;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function reset() {
    stop();
    seconds = initialSeconds;
  }

  async function sendNotification() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('Timer Complete!', {
          body: 'Your timer has finished.',
          icon: '/favicon.png',
        });
      }
    }
  }

  $effect(() => {
    let mounted = false;
    if (!mounted) {
      seconds = initialSeconds;
      mounted = true;
    }
  });

  $effect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  });
</script>

<div class="alarm-widget">
  <div class="display" class:alert={seconds === 0}>
    {formatTime(seconds)}
  </div>

  <div class="controls">
    {#if !isRunning}
      <button class="btn start" onclick={start} aria-label="Start timer">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5,3 19,12 5,21" />
        </svg>
      </button>
    {:else if isPaused}
      <button class="btn start" onclick={start} aria-label="Resume timer">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5,3 19,12 5,21" />
        </svg>
      </button>
    {:else}
      <button class="btn pause" onclick={pause} aria-label="Pause timer">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" />
          <rect x="14" y="4" width="4" height="16" />
        </svg>
      </button>
    {/if}

    <button class="btn reset" onclick={reset} aria-label="Reset timer" disabled={seconds === initialSeconds && !isRunning}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
    </button>
  </div>
</div>

<style>
  .alarm-widget {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    padding: 2rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    min-width: 240px;
  }

  .display {
    font-family: 'SF Mono', 'Consolas', monospace;
    font-size: 4rem;
    font-weight: 600;
    color: var(--text);
    letter-spacing: 0.05em;
    padding: 1rem 2rem;
    background: var(--background);
    border-radius: 8px;
    border: 1px solid var(--border);
  }

  .display.alert {
    color: var(--error);
    animation: pulse 1s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .controls {
    display: flex;
    gap: 1rem;
  }

  .btn {
    width: 48px;
    height: 48px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    background: var(--background);
    border: 1px solid var(--border);
    color: var(--text);
  }

  .btn:hover:not(:disabled) {
    transform: scale(1.05);
    border-color: var(--primary);
  }

  .btn:active:not(:disabled) {
    transform: scale(0.95);
  }

  .btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .btn svg {
    width: 20px;
    height: 20px;
  }

  .btn.start {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
  }

  .btn.start:hover:not(:disabled) {
    background: var(--primary-hover, #3b82f6);
  }

  .btn.pause {
    background: var(--warning, #f59e0b);
    color: white;
    border-color: var(--warning, #f59e0b);
  }

  .btn.reset:hover:not(:disabled) {
    color: var(--error);
    border-color: var(--error);
  }
</style>
