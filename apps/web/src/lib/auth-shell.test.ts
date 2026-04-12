import { describe, expect, it } from 'vitest';
import {
  OrganizationLaunchpadAuth,
  defineOrganizationLaunchpadAuthElements,
} from '@shared/auth';

describe('OrganizationLaunchpad auth shell', () => {
  it('defines portable auth custom elements', () => {
    defineOrganizationLaunchpadAuthElements();

    expect(customElements.get('organization-launchpad-auth-form')).toBeTruthy();
    expect(customElements.get('organization-launchpad-auth-guard')).toBeTruthy();
    expect(customElements.get('organization-launchpad-auth-callback')).toBeTruthy();
  });

  it('reports not configured when Supabase env is missing', async () => {
    const auth = new OrganizationLaunchpadAuth({
      supabaseUrl: '',
      supabaseAnonKey: '',
    });

    auth.init();

    const signInResult = await auth.signIn({
      email: 'user@example.com',
      password: 'password123',
    });

    expect(auth.isConfigured).toBe(false);
    expect(signInResult.error?.message).toMatch(/not configured/i);
  });

  it('exposes sensible default auth routes', () => {
    const auth = new OrganizationLaunchpadAuth({
      supabaseUrl: '',
      supabaseAnonKey: '',
    });

    expect(auth.config.loginPath).toBe('/login');
    expect(auth.config.signupPath).toBe('/signup');
    expect(auth.config.callbackPath).toBe('/auth/callback');
    expect(auth.config.postLoginPath).toBe('/dashboard');
    expect(auth.config.postLogoutPath).toBe('/');
  });
});
