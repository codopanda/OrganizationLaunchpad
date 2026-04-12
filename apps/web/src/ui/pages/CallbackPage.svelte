<div class="page">
  <div class="container">
    <organization-launchpad-auth-callback success-path="/dashboard" fallback-path="/login"></organization-launchpad-auth-callback>
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
    max-width: 460px;
  }
</style>
