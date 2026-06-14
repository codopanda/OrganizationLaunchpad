<script lang="ts">
  import { track, isPostHogConfigured } from '@/lib/posthog';

  type EventEntry = { name: string; time: string };

  let firedEvents = $state<EventEntry[]>([]);
  let customEvent = $state('');

  function fireEvent(name: string) {
    track(name, { source: 'kitchen_widget', timestamp: Date.now() });
    firedEvents = [{ name, time: new Date().toLocaleTimeString() }, ...firedEvents.slice(0, 4)];
  }

  function handleCustom() {
    const name = customEvent.trim();
    if (!name) return;
    fireEvent(name);
    customEvent = '';
  }

  const presets = ['button_clicked', 'feature_used', 'page_viewed', 'error_occurred'];
</script>

<div class="posthog-widget">
  <div class="widget-header">
    <h3>Analytics</h3>
    <span class="badge" class:configured={isPostHogConfigured}>
      {isPostHogConfigured ? 'PostHog configured' : 'Not configured'}
    </span>
  </div>

  {#if !isPostHogConfigured}
    <p class="notice">
      Set <code>VITE_PUBLIC_POSTHOG_KEY</code> to start capturing events.
    </p>
  {:else}
    <p class="muted">Fire events and see them appear live in your PostHog dashboard.</p>

    <div class="presets">
      {#each presets as preset}
        <button class="preset-btn" onclick={() => fireEvent(preset)}>{preset}</button>
      {/each}
    </div>

    <div class="custom-row">
      <input
        type="text"
        placeholder="custom_event_name"
        bind:value={customEvent}
        onkeydown={(e) => e.key === 'Enter' && handleCustom()}
      />
      <button class="btn-primary" onclick={handleCustom} disabled={!customEvent.trim()}>Fire</button>
    </div>

    {#if firedEvents.length > 0}
      <div class="log">
        <p class="log-label">Fired this session</p>
        {#each firedEvents as entry}
          <div class="log-entry">
            <code>{entry.name}</code>
            <span class="time">{entry.time}</span>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>

<style>
  .posthog-widget {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .widget-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  h3 { margin: 0; font-size: 1rem; }

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

  .presets {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .preset-btn {
    padding: 0.375rem 0.75rem;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text);
    font-size: 0.8rem;
    font-family: monospace;
    cursor: pointer;
    transition: border-color 0.15s;
  }

  .preset-btn:hover { border-color: var(--accent); }

  .custom-row {
    display: flex;
    gap: 0.5rem;
  }

  input {
    flex: 1;
    padding: 0.5rem 0.75rem;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text);
    font-size: 0.875rem;
    font-family: monospace;
    min-width: 0;
  }

  input:focus { outline: none; border-color: var(--accent); }

  .btn-primary {
    padding: 0.5rem 1rem;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    cursor: pointer;
    white-space: nowrap;
    transition: opacity 0.15s;
  }

  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

  .log {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .log-label { margin: 0 0 0.25rem; font-size: 0.75rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; }

  .log-entry {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }

  code { font-size: 0.8rem; color: var(--text); }
  .time { font-size: 0.75rem; color: var(--muted); }
  .muted { color: var(--muted); font-size: 0.875rem; margin: 0; }
  .notice { color: var(--muted); font-size: 0.875rem; margin: 0; }

  .notice code {
    background: var(--code, #11131a);
    padding: 0.1em 0.4em;
    border-radius: 4px;
  }
</style>
