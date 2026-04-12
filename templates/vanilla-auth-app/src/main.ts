import './styles.css';
import { auth } from './auth';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App root not found.');
}

function renderHome(): string {
  return `
    <main class="shell">
      <section class="card hero">
        <p class="eyebrow">OrganizationLaunchpad</p>
        <h1>__APP_TITLE__</h1>
        <p class="lede">
          This framework-neutral starter mounts the shared auth shell with plain TypeScript and Web Components.
        </p>
        <div class="actions">
          <a class="button" href="/login" data-nav>Sign In</a>
          <a class="button secondary" href="/signup" data-nav>Create Account</a>
        </div>
      </section>
      <section class="card">
        <h2>Public Area</h2>
        <p>This page is public. The authenticated area lives at <code>/app</code>.</p>
      </section>
    </main>
  `;
}

function renderProtectedApp(): string {
  return `
    <main class="shell">
      <organization-launchpad-auth-guard
        heading="App Access"
        message="Sign in to enter the authenticated area."
      >
        <section class="card">
          <div class="stack">
            <h1>Authenticated App</h1>
            <p>Your app UI starts here. Keep your own pages and business logic, and let the shared auth shell own login, signup, callback, and session handling.</p>
            <button class="button" data-sign-out>Sign Out</button>
          </div>
        </section>
      </organization-launchpad-auth-guard>
    </main>
  `;
}

function renderRoute(pathname: string): string {
  if (pathname === '/login') {
    return `
      <main class="shell centered">
        <organization-launchpad-auth-form mode="login" success-path="/app"></organization-launchpad-auth-form>
      </main>
    `;
  }

  if (pathname === '/signup') {
    return `
      <main class="shell centered">
        <organization-launchpad-auth-form mode="signup" success-path="/app"></organization-launchpad-auth-form>
      </main>
    `;
  }

  if (pathname === '/auth/callback') {
    return `
      <main class="shell centered">
        <organization-launchpad-auth-callback
          success-path="/app"
          fallback-path="/login"
        ></organization-launchpad-auth-callback>
      </main>
    `;
  }

  if (pathname === '/app') {
    return renderProtectedApp();
  }

  return renderHome();
}

function wireInteractions(): void {
  document.querySelectorAll<HTMLElement>('[data-nav]').forEach((element) => {
    element.addEventListener('click', (event) => {
      event.preventDefault();
      const href = element.getAttribute('href');
      if (!href) return;
      auth.navigate(href);
    });
  });

  document.querySelector<HTMLElement>('[data-sign-out]')?.addEventListener('click', async () => {
    await auth.signOut();
    auth.navigate(auth.config.postLogoutPath);
  });
}

function render(): void {
  app.innerHTML = renderRoute(window.location.pathname);
  wireInteractions();
}

window.addEventListener('popstate', render);

render();
