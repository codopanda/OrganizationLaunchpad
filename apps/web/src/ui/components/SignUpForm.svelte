<script lang="ts">
  import { authService } from '@/application/auth';
  import Toast from './Toast.svelte';

  interface Props {
    onSuccess?: () => void;
    onClose?: () => void;
  }

  let { onSuccess, onClose }: Props = $props();

  let email = $state('');
  let password = $state('');
  let confirmPassword = $state('');
  let error = $state('');
  let loading = $state(false);
  let toastMessage = $state('');
  let toastType = $state<'success' | 'error'>('error');

  let isValid = $derived(
    email.length > 0 && password.length >= 8 && password === confirmPassword
  );

  let passwordsMatch = $derived(password === confirmPassword || confirmPassword.length === 0);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!isValid || !authService) return;

    loading = true;
    error = '';

    const result = await authService.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + '/auth/callback',
      },
    });

    loading = false;

    if (result.error) {
      error = result.error.message;
      return;
    }

    toastMessage = 'Account created! Check your email to confirm.';
    toastType = 'success';
    onSuccess?.();
  }

  async function handleGoogleOAuth() {
    if (!authService) return;

    loading = true;
    error = '';

    const result = await authService.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback',
      },
    });

    loading = false;

    if (result.error) {
      error = result.error.message;
      return;
    }

    if (result.session?.access_token && result.session.access_token.startsWith('http')) {
      window.location.href = result.session.access_token;
    }
  }
</script>

<div class="form-container">
  {#if onClose}
    <button class="close-btn" onclick={onClose} aria-label="Close">×</button>
  {/if}

  <h2>Create Account</h2>

  <form onsubmit={handleSubmit}>
    <div class="field">
      <label for="email">Email</label>
      <input
        type="email"
        id="email"
        bind:value={email}
        placeholder="you@example.com"
        autocomplete="email"
        disabled={loading}
      />
    </div>

    <div class="field">
      <label for="password">Password</label>
      <input
        type="password"
        id="password"
        bind:value={password}
        placeholder="At least 8 characters"
        autocomplete="new-password"
        disabled={loading}
      />
    </div>

    <div class="field">
      <label for="confirm-password">Confirm Password</label>
      <input
        type="password"
        id="confirm-password"
        bind:value={confirmPassword}
        placeholder="Confirm your password"
        autocomplete="new-password"
        disabled={loading}
        class:invalid={!passwordsMatch}
      />
      {#if !passwordsMatch}
        <span class="field-error">Passwords do not match</span>
      {/if}
    </div>

    {#if error}
      <p class="error-message">{error}</p>
    {/if}

    <button type="submit" class="btn-primary" disabled={!isValid || loading}>
      {loading ? 'Creating account...' : 'Sign Up'}
    </button>
  </form>

  <div class="divider">
    <span>or</span>
  </div>

  <button class="btn-google" onclick={handleGoogleOAuth} disabled={loading}>
    <svg class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
    Continue with Google
  </button>
</div>

{#if toastMessage}
  <Toast message={toastMessage} type={toastType} onClose={() => (toastMessage = '')} />
{/if}

<style>
  .form-container {
    position: relative;
    padding: 1.5rem;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface);
  }

  .close-btn {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    background: none;
    border: none;
    color: var(--muted);
    font-size: 1.5rem;
    cursor: pointer;
    line-height: 1;
    padding: 0.25rem;
  }

  .close-btn:hover {
    color: var(--text);
  }

  h2 {
    margin: 0 0 1.25rem;
    font-size: 1.25rem;
    text-align: center;
  }

  .field {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    font-size: 0.875rem;
    color: var(--muted);
    margin-bottom: 0.375rem;
  }

  input {
    width: 100%;
    padding: 0.625rem 0.875rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--bg);
    color: var(--text);
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  input:focus {
    outline: none;
    border-color: var(--accent);
  }

  input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  input.invalid {
    border-color: var(--error);
  }

  .field-error {
    display: block;
    color: var(--error);
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }

  .error-message {
    color: var(--error);
    font-size: 0.875rem;
    margin: 0 0 1rem;
  }

  .btn-primary {
    width: 100%;
    padding: 0.75rem;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
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

  .divider {
    display: flex;
    align-items: center;
    margin: 1.25rem 0;
    color: var(--muted);
    font-size: 0.875rem;
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .divider span {
    padding: 0 1rem;
  }

  .btn-google {
    width: 100%;
    padding: 0.75rem;
    background: var(--bg);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    transition: border-color 0.2s;
  }

  .btn-google:hover:not(:disabled) {
    border-color: var(--muted);
  }

  .btn-google:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .google-icon {
    width: 20px;
    height: 20px;
  }
</style>
