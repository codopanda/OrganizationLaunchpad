import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display the app title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/OrganizationLaunchpad/);
  });
});

test.describe('Health endpoint', () => {
  test('should display health data from worker', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText(/Worker API/i)).toBeVisible({ timeout: 10000 });
  });
});
