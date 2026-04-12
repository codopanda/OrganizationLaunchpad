import { getOrganizationLaunchpadAuth } from './client';

const sheet = `
  :host {
    display: block;
    color: var(--text, #e4e4eb);
    font-family: inherit;
  }

  .card {
    position: relative;
    padding: 1.5rem;
    border: 1px solid var(--border, #2a2c38);
    border-radius: 14px;
    background: var(--surface, #14151c);
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.2);
  }

  h2 {
    margin: 0 0 0.5rem;
    font-size: 1.4rem;
  }

  p.subtle,
  .meta,
  .message {
    color: var(--muted, #9aa0b4);
    margin: 0 0 1.25rem;
  }

  form {
    display: grid;
    gap: 0.95rem;
  }

  label {
    display: grid;
    gap: 0.4rem;
    font-size: 0.9rem;
    color: var(--muted, #9aa0b4);
  }

  input {
    width: 100%;
    padding: 0.72rem 0.85rem;
    border: 1px solid var(--border, #2a2c38);
    border-radius: 8px;
    background: var(--bg, #0c0d12);
    color: inherit;
    font: inherit;
  }

  button,
  a.button {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.8rem 1rem;
    border-radius: 999px;
    border: 0;
    background: var(--accent, #7c3aed);
    color: white;
    font: inherit;
    text-decoration: none;
    cursor: pointer;
  }

  button.secondary,
  a.button.secondary {
    background: transparent;
    border: 1px solid var(--border, #2a2c38);
    color: inherit;
  }

  button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .footer {
    margin-top: 1rem;
    color: var(--muted, #9aa0b4);
    font-size: 0.92rem;
  }

  .footer a {
    color: var(--accent, #7c3aed);
  }

  .error {
    color: var(--error, #f87171);
    margin: 0;
  }

  .success {
    color: #7dd3a5;
    margin: 0;
  }

  .guard {
    display: grid;
    gap: 1rem;
  }

  .hidden {
    display: none;
  }
`;

class OrganizationLaunchpadAuthFormElement extends HTMLElement {
  private readonly root = this.attachShadow({ mode: 'open' });

  connectedCallback(): void {
    void this.render();
  }

  static get observedAttributes(): string[] {
    return ['mode', 'success-path'];
  }

  attributeChangedCallback(): void {
    void this.render();
  }

  private async render(): Promise<void> {
    const auth = getOrganizationLaunchpadAuth();
    const mode = this.getAttribute('mode') === 'signup' ? 'signup' : 'login';
    const successPath = this.getAttribute('success-path') ?? auth.config.postLoginPath;
    const switchHref = mode === 'login' ? auth.config.signupPath : auth.config.loginPath;
    const switchLabel = mode === 'login' ? 'Create an account' : 'Back to sign in';

    this.root.innerHTML = `
      <style>${sheet}</style>
      <div class="card">
        <h2>${mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
        <p class="subtle">${mode === 'login' ? 'Use your account to access protected features.' : 'Create a shared Supabase account for this app.'}</p>
        <form>
          <label>
            Email
            <input name="email" type="email" autocomplete="email" placeholder="you@example.com" required />
          </label>
          <label>
            Password
            <input name="password" type="password" autocomplete="${mode === 'login' ? 'current-password' : 'new-password'}" placeholder="${mode === 'login' ? 'Your password' : 'At least 8 characters'}" required />
          </label>
          ${
            mode === 'signup'
              ? `
                <label>
                  Confirm Password
                  <input name="confirmPassword" type="password" autocomplete="new-password" placeholder="Repeat your password" required />
                </label>
              `
              : ''
          }
          <p class="error hidden" data-role="error"></p>
          <p class="success hidden" data-role="success"></p>
          <button type="submit">${mode === 'login' ? 'Sign In' : 'Sign Up'}</button>
        </form>
        <div class="meta">or</div>
        <button type="button" class="secondary" data-role="google">Continue with Google</button>
        <div class="footer">
          <a href="${switchHref}" data-nav>${switchLabel}</a>
        </div>
      </div>
    `;

    const form = this.root.querySelector('form');
    const googleButton = this.root.querySelector('[data-role="google"]');
    const errorNode = this.root.querySelector('[data-role="error"]') as HTMLParagraphElement | null;
    const successNode = this.root.querySelector('[data-role="success"]') as HTMLParagraphElement | null;
    const navLink = this.root.querySelector('[data-nav]');

    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const email = String(formData.get('email') ?? '');
      const password = String(formData.get('password') ?? '');
      const confirmPassword = String(formData.get('confirmPassword') ?? '');

      this.setMessage(errorNode, '');
      this.setMessage(successNode, '');

      if (mode === 'signup' && password !== confirmPassword) {
        this.setMessage(errorNode, 'Passwords do not match.');
        return;
      }

      const result =
        mode === 'login'
          ? await auth.signIn({ email, password })
          : await auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo: auth.getCallbackUrl(),
              },
            });

      if (result.error) {
        this.setMessage(errorNode, result.error.message);
        return;
      }

      if (mode === 'signup' && !result.session?.user) {
        this.setMessage(successNode, 'Account created. Check your email to confirm your address.');
        return;
      }

      auth.navigate(successPath);
    });

    googleButton?.addEventListener('click', async () => {
      this.setMessage(errorNode, '');
      this.setMessage(successNode, '');

      const result = await auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: auth.getCallbackUrl(),
        },
      });

      if (result.error) {
        this.setMessage(errorNode, result.error.message);
        return;
      }

      const redirectUrl = result.session?.access_token;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    });

    navLink?.addEventListener('click', (event) => {
      event.preventDefault();
      auth.navigate(switchHref);
    });
  }

  private setMessage(node: HTMLParagraphElement | null, message: string): void {
    if (!node) return;
    node.textContent = message;
    node.classList.toggle('hidden', !message);
  }
}

class OrganizationLaunchpadAuthGuardElement extends HTMLElement {
  private readonly root = this.attachShadow({ mode: 'open' });
  private unsubscribe: (() => void) | null = null;

  connectedCallback(): void {
    const auth = getOrganizationLaunchpadAuth();

    this.unsubscribe = auth.subscribe((state) => {
      this.render(state.user !== null);
    });
  }

  disconnectedCallback(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  private render(isAuthenticated: boolean): void {
    const auth = getOrganizationLaunchpadAuth();
    const heading = this.getAttribute('heading') ?? 'Authentication Required';
    const message = this.getAttribute('message') ?? 'Sign in to access this part of the application.';

    this.root.innerHTML = `
      <style>${sheet}</style>
      ${
        isAuthenticated
          ? `<slot></slot>`
          : `
            <div class="card guard">
              <h2>${heading}</h2>
              <p class="message">${message}</p>
              <a href="${auth.config.loginPath}" class="button" data-login>Go to Sign In</a>
            </div>
          `
      }
    `;

    this.root.querySelector('[data-login]')?.addEventListener('click', (event) => {
      event.preventDefault();
      auth.navigate(auth.config.loginPath);
    });
  }
}

class OrganizationLaunchpadAuthCallbackElement extends HTMLElement {
  private readonly root = this.attachShadow({ mode: 'open' });

  connectedCallback(): void {
    void this.handle();
  }

  private async handle(): Promise<void> {
    const auth = getOrganizationLaunchpadAuth();
    const successPath = this.getAttribute('success-path') ?? auth.config.postLoginPath;
    const fallbackPath = this.getAttribute('fallback-path') ?? auth.config.loginPath;

    this.root.innerHTML = `
      <style>${sheet}</style>
      <div class="card">
        <h2>Completing sign in</h2>
        <p class="subtle">Finishing the Supabase callback and restoring the session.</p>
        <p class="error hidden" data-role="error"></p>
      </div>
    `;

    const errorNode = this.root.querySelector('[data-role="error"]') as HTMLParagraphElement | null;
    const result = await auth.finalizeAuthCallback(successPath);

    if (result.error) {
      if (errorNode) {
        errorNode.textContent = result.error;
        errorNode.classList.remove('hidden');
      }

      window.setTimeout(() => auth.navigate(fallbackPath), 1600);
    }
  }
}

export function defineOrganizationLaunchpadAuthElements(): void {
  if (!customElements.get('organization-launchpad-auth-form')) {
    customElements.define('organization-launchpad-auth-form', OrganizationLaunchpadAuthFormElement);
  }

  if (!customElements.get('organization-launchpad-auth-guard')) {
    customElements.define('organization-launchpad-auth-guard', OrganizationLaunchpadAuthGuardElement);
  }

  if (!customElements.get('organization-launchpad-auth-callback')) {
    customElements.define('organization-launchpad-auth-callback', OrganizationLaunchpadAuthCallbackElement);
  }
}
