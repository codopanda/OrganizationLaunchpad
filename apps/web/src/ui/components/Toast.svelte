<script lang="ts">
  interface Props {
    message: string;
    type?: 'success' | 'error';
    duration?: number;
    onClose?: () => void;
  }

  let { message, type = 'error', duration = 5000, onClose }: Props = $props();

  $effect(() => {
    if (!message || duration <= 0) return;

    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  });
</script>

<div class="toast {type}" role="alert">
  <span class="icon">
    {#if type === 'success'}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    {:else}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    {/if}
  </span>
  <span class="message">{message}</span>
  <button class="close" onclick={onClose} aria-label="Dismiss">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  </button>
</div>

<style>
  .toast {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    border-radius: 8px;
    background: var(--surface);
    border: 1px solid var(--border);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    animation: slideIn 0.3s ease-out;
    z-index: 1000;
    max-width: 400px;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .toast.success {
    border-color: #34a853;
  }

  .toast.error {
    border-color: var(--error);
  }

  .icon {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
  }

  .icon svg {
    width: 100%;
    height: 100%;
  }

  .toast.success .icon {
    color: #34a853;
  }

  .toast.error .icon {
    color: var(--error);
  }

  .message {
    flex: 1;
    font-size: 0.9375rem;
    color: var(--text);
  }

  .close {
    flex-shrink: 0;
    background: none;
    border: none;
    color: var(--muted);
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;
  }

  .close:hover {
    color: var(--text);
  }

  .close svg {
    width: 16px;
    height: 16px;
  }
</style>
