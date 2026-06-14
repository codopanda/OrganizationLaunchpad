<script lang="ts">
  import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
  import { track } from '@/lib/posthog';

  let to = $state('');
  let subject = $state('Test email from OrganizationLaunchpad');
  let status = $state<'idle' | 'loading' | 'success' | 'error'>('idle');
  let errorMessage = $state('');

  async function handleSend() {
    if (!to.trim() || status === 'loading') return;

    status = 'loading';
    errorMessage = '';
    track('email_test_sent');

    try {
      const supabase = getSupabase();
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: to.trim(),
          subject,
          html: `<h2>Hello from OrganizationLaunchpad</h2><p>This is a test email sent via the Resend integration. It works!</p>`,
        },
      });

      if (error) throw new Error(error.message);
      status = 'success';
    } catch (err) {
      status = 'error';
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }

  function reset() {
    status = 'idle';
    to = '';
    errorMessage = '';
  }
</script>

<div class="email-widget">
  <div class="widget-header">
    <h3>Email</h3>
    <span class="badge" class:configured={isSupabaseConfigured}>
      {isSupabaseConfigured ? 'Resend via Supabase' : 'Not configured'}
    </span>
  </div>

  {#if !isSupabaseConfigured}
    <p class="notice">Configure Supabase and deploy the <code>send-email</code> edge function to test email sending.</p>
  {:else if status === 'success'}
    <div class="success">
      <span class="check">✓</span>
      <p>Email sent! Check your inbox.</p>
      <button class="text-btn" onclick={reset}>Send another</button>
    </div>
  {:else}
    <form onsubmit={(e) => { e.preventDefault(); handleSend(); }}>
      <div class="field">
        <label for="email-to">To</label>
        <input
          id="email-to"
          type="email"
          placeholder="you@example.com"
          bind:value={to}
          disabled={status === 'loading'}
          required
        />
      </div>
      <div class="field">
        <label for="email-subject">Subject</label>
        <input
          id="email-subject"
          type="text"
          bind:value={subject}
          disabled={status === 'loading'}
        />
      </div>

      {#if status === 'error'}
        <p class="error">{errorMessage}</p>
      {/if}

      <button class="btn-primary" type="submit" disabled={!to.trim() || status === 'loading'}>
        {status === 'loading' ? 'Sending…' : 'Send test email'}
      </button>
    </form>
  {/if}
</div>

<style>
  .email-widget {
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

  form { display: flex; flex-direction: column; gap: 0.75rem; }

  .field { display: flex; flex-direction: column; gap: 0.375rem; }

  label { font-size: 0.8rem; color: var(--muted); }

  input {
    padding: 0.625rem 0.75rem;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text);
    font-size: 0.875rem;
    font-family: inherit;
    transition: border-color 0.15s;
  }

  input:focus { outline: none; border-color: var(--accent); }
  input:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-primary {
    padding: 0.625rem;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

  .success {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.5rem;
    text-align: center;
  }

  .check {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(52, 211, 153, 0.15);
    color: #34d399;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1rem;
  }

  .success p { margin: 0; font-size: 0.9375rem; }

  .text-btn {
    background: none;
    border: none;
    color: var(--accent);
    font-size: 0.875rem;
    cursor: pointer;
    text-decoration: underline;
  }

  .notice { color: var(--muted); font-size: 0.875rem; margin: 0; }
  .error { color: var(--error); font-size: 0.875rem; margin: 0; }

  code {
    font-size: 0.8rem;
    background: var(--code, #11131a);
    padding: 0.1em 0.4em;
    border-radius: 4px;
  }
</style>
