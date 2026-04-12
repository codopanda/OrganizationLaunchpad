<script lang="ts">
  import LoginForm from '@/ui/components/LoginForm.svelte';

  function handleSuccess() {
    window.location.href = '/dashboard';
  }

  function handleSignUpClick() {
    window.location.href = '/signup';
  }
</script>

<div class="page">
  <div class="container">
    <div class="header">
      <h1>Welcome Back</h1>
      <p>Sign in to your account to continue</p>
    </div>

    <LoginForm onSuccess={handleSuccess} />

    <p class="switch-auth">
      Don't have an account? <button onclick={handleSignUpClick}>Sign up</button>
    </p>
  </div>
</div>

<style>
  .page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: var(--bg);
  }

  .container {
    width: 100%;
    max-width: 400px;
  }

  .header {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .header h1 {
    margin: 0 0 0.5rem;
    font-size: 1.75rem;
  }

  .header p {
    margin: 0;
    color: var(--muted);
  }

  .switch-auth {
    text-align: center;
    margin-top: 1.5rem;
    color: var(--muted);
    font-size: 0.875rem;
  }

  .switch-auth button {
    background: none;
    border: none;
    color: var(--accent);
    cursor: pointer;
    font-size: inherit;
    padding: 0;
  }

  .switch-auth button:hover {
    text-decoration: underline;
  }
</style>
