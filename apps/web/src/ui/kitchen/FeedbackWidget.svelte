<script lang="ts">
  import { supabase, isSupabaseConfigured } from '@/lib/supabase';

  interface Props {
    onSuccess?: () => void;
  }

  let { onSuccess }: Props = $props();

  const MAX_CHARS = 500;

  let message = $state('');
  let status = $state<'idle' | 'loading' | 'success' | 'error'>('idle');
  let errorMessage = $state('');

  let charCount = $derived(message.length);
  let isValid = $derived(message.trim().length >= 10 && message.length <= MAX_CHARS);
  let isOverLimit = $derived(message.length > MAX_CHARS);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!isValid || status === 'loading') return;

    status = 'loading';
    errorMessage = '';

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('feedback').insert([
          {
            message: message.trim(),
            created_at: new Date().toISOString(),
          },
        ]);

        if (error) throw error;

        status = 'success';
        message = '';
        onSuccess?.();
      } catch (err) {
        status = 'error';
        errorMessage = err instanceof Error ? err.message : 'Failed to submit feedback';
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 800));
      status = 'success';
      message = '';
      onSuccess?.();
    }
  }

  function reset() {
    status = 'idle';
    errorMessage = '';
  }
</script>

<div class="feedback-widget">
  <h3>Feedback</h3>

  {#if status === 'success'}
    <div class="success-message">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 6L9 17l-5-5" />
      </svg>
      <span>Thank you for your feedback!</span>
      <button class="text-btn" onclick={reset}>Send another</button>
    </div>
  {:else}
    <form onsubmit={handleSubmit}>
      <div class="field">
        <textarea
          bind:value={message}
          placeholder="Share your thoughts with us..."
          rows="4"
          disabled={status === 'loading'}
          aria-label="Feedback message"
        ></textarea>
        <div class="char-count" class:over-limit={isOverLimit}>
          {charCount}/{MAX_CHARS}
        </div>
      </div>

      {#if errorMessage}
        <p class="error-message">{errorMessage}</p>
      {/if}

      {#if !isSupabaseConfigured}
        <p class="demo-notice">Demo mode - Supabase not configured</p>
      {/if}

      <button
        type="submit"
        class="btn-primary"
        disabled={!isValid || status === 'loading' || isOverLimit}
      >
        {status === 'loading' ? 'Sending...' : 'Submit Feedback'}
      </button>
    </form>
  {/if}
</div>

<style>
  .feedback-widget {
    padding: 1.25rem;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface);
  }

  h3 {
    margin: 0 0 1rem;
    font-size: 1.125rem;
    color: var(--text);
  }

  .field {
    margin-bottom: 0.75rem;
  }

  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg);
    color: var(--text);
    font-size: 0.9375rem;
    font-family: inherit;
    resize: vertical;
    min-height: 100px;
    transition: border-color 0.2s;
  }

  textarea:focus {
    outline: none;
    border-color: var(--accent);
  }

  textarea:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .char-count {
    text-align: right;
    font-size: 0.75rem;
    color: var(--muted);
    margin-top: 0.375rem;
  }

  .char-count.over-limit {
    color: var(--error);
  }

  .error-message {
    color: var(--error);
    font-size: 0.875rem;
    margin: 0 0 0.75rem;
  }

  .demo-notice {
    font-size: 0.75rem;
    color: var(--muted);
    margin: 0 0 0.75rem;
    font-style: italic;
  }

  .btn-primary {
    width: 100%;
    padding: 0.75rem;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.9375rem;
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

  .success-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.5rem 1rem;
    text-align: center;
    color: var(--text);
  }

  .success-message svg {
    width: 40px;
    height: 40px;
    color: #34a853;
  }

  .success-message span {
    font-size: 1rem;
  }

  .text-btn {
    background: none;
    border: none;
    color: var(--accent);
    font-size: 0.875rem;
    cursor: pointer;
    text-decoration: underline;
  }

  .text-btn:hover {
    opacity: 0.8;
  }
</style>
