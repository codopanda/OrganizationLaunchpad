import { test, expect } from '@playwright/test';

test.describe('Reference App', () => {
  test('renders the landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/OrganizationLaunchpad/);
    await expect(page.getByText(/Portable auth shell/i)).toBeVisible();
  });

  test('renders the shared login and signup routes', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();

    await page.goto('/signup');
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
  });

  test('protects the dashboard when signed out', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Dashboard Access')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Go to Sign In' })).toBeVisible();
  });

  test('renders the auth callback screen', async ({ page }) => {
    await page.goto('/auth/callback');
    await expect(page.getByText(/Completing sign in/i)).toBeVisible();
  });
});
