<script lang="ts">
  import { auth as authClient } from '@/lib/auth';
  import type { User } from '@shared/auth';
  import Toast from '@/ui/components/Toast.svelte';

  let user = $state<User | null>(null);
  let loading = $state(true);
  let toastMessage = $state('');
  let toastType = $state<'success' | 'error'>('error');

  $effect(() => {
    if (!authClient.isConfigured) {
      loading = false;
      return;
    }

    authClient.getCurrentUser().then(({ user: currentUser }) => {
      user = currentUser;
      loading = false;
    });

    const unsubscribe = authClient.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        user = session?.user ?? null;
      } else if (event === 'SIGNED_OUT') {
        user = null;
      }
    });

    return unsubscribe;
  });

  async function handleSignOut() {
    const { error } = await authClient.signOut();

    if (error) {
      toastMessage = error.message;
      toastType = 'error';
      return;
    }

    toastMessage = 'Successfully signed out!';
    toastType = 'success';
    authClient.navigate(authClient.config.postLogoutPath);
  }
</script>

<organization-launchpad-auth-guard heading="Dashboard Access" message="Sign in to view the authenticated dashboard.">
  <div class="dashboard">
    <header class="header">
      <h1>Dashboard</h1>
      <button class="btn-secondary" onclick={handleSignOut}>Sign Out</button>
    </header>

    <main class="content">
      <section class="card">
        <h2>User Information</h2>
        {#if loading}
          <p class="muted">Loading...</p>
        {:else if user}
          <dl class="user-info">
            <dt>Email</dt>
            <dd>{user.email}</dd>
            <dt>User ID</dt>
            <dd class="mono">{user.id}</dd>
          </dl>
        {:else}
          <p class="muted">Not signed in</p>
        {/if}
      </section>
    </main>
  </div>
</organization-launchpad-auth-guard>

{#if toastMessage}
  <Toast message={toastMessage} type={toastType} onClose={() => (toastMessage = '')} />
{/if}

<style>
  .dashboard {
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
  }

  .header h1 {
    margin: 0;
    font-size: 1.25rem;
  }

  .content {
    padding: 2rem;
    max-width: 800px;
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
  }

  .user-info {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.5rem 1rem;
    margin: 0;
  }

  dt {
    color: var(--muted);
    font-size: 0.875rem;
  }

  dd {
    margin: 0;
    font-size: 0.875rem;
  }

  dd.mono {
    font-family: monospace;
    font-size: 0.8rem;
    word-break: break-all;
  }

  .muted {
    color: var(--muted);
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
