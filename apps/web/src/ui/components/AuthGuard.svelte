<script lang="ts">
  import type { Snippet } from 'svelte';
  import { authService } from '@/application/auth';
  import type { User } from '@/application/ports/driving/IAuthService';
  import LoginForm from './LoginForm.svelte';
  import Toast from './Toast.svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  let user = $state<User | null>(null);
  let loading = $state(true);
  let showLogin = $state(false);
  let toastMessage = $state('');
  let toastType = $state<'success' | 'error'>('error');

  $effect(() => {
    if (!authService) {
      loading = false;
      return;
    }

    const { getCurrentUser } = authService;
    getCurrentUser().then(({ user: u }) => {
      user = u;
      loading = false;
    });

    const unsubscribe = authService.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        user = session?.user ?? null;
      } else if (event === 'SIGNED_OUT') {
        user = null;
      }
    });

    return unsubscribe;
  });

  function handleAuthSuccess() {
    showLogin = false;
    toastMessage = 'Successfully signed in!';
    toastType = 'success';
  }

  function handleSignOut() {
    if (!authService) return;
    authService.signOut().then(({ error }) => {
      if (error) {
        toastMessage = error.message;
        toastType = 'error';
      }
    });
  }
</script>

{#if loading}
  <div class="loading">Checking authentication...</div>
{:else if user}
  <div class="auth-header">
    <span class="user-email">{user.email}</span>
    <button class="btn-secondary" onclick={handleSignOut}>Sign Out</button>
  </div>
  {@render children()}
{:else}
  <div class="auth-prompt">
    <div class="prompt-content">
      <h2>Authentication Required</h2>
      <p>Please sign in to access this content.</p>
      {#if showLogin}
        <LoginForm onSuccess={handleAuthSuccess} onClose={() => (showLogin = false)} />
      {:else}
        <button class="btn-primary" onclick={() => (showLogin = true)}>Sign In</button>
      {/if}
    </div>
  </div>
{/if}

{#if toastMessage}
  <Toast message={toastMessage} type={toastType} onClose={() => (toastMessage = '')} />
{/if}

<style>
  .loading {
    color: var(--muted);
    padding: 2rem;
    text-align: center;
  }

  .auth-header {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 1rem;
    padding: 1rem;
    border-bottom: 1px solid var(--border);
    margin-bottom: 1rem;
  }

  .user-email {
    color: var(--muted);
    font-size: 0.875rem;
  }

  .auth-prompt {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
  }

  .prompt-content {
    text-align: center;
    padding: 2rem;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface);
    max-width: 400px;
    width: 100%;
  }

  .prompt-content h2 {
    margin: 0 0 0.5rem;
    font-size: 1.25rem;
  }

  .prompt-content p {
    color: var(--muted);
    margin: 0 0 1.5rem;
  }

  .btn-primary {
    background: var(--accent);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .btn-primary:hover {
    opacity: 0.9;
  }

  .btn-secondary {
    background: transparent;
    color: var(--text);
    border: 1px solid var(--border);
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: border-color 0.2s;
  }

  .btn-secondary:hover {
    border-color: var(--muted);
  }
</style>
