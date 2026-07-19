import { test, expect } from '@playwright/test';

test.use({ storageState: '.auth/admin.json' });

test.describe('Admin Dashboard Flows', () => {
  test('admin can view dashboard', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Verify the admin dashboard loaded
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('admin can view user list', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // Verify the users management page loaded
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('admin can view course management', async ({ page }) => {
    await page.goto('/admin/courses');
    await page.waitForLoadState('networkidle');

    // Verify the courses management page loaded
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('admin can view analytics', async ({ page }) => {
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');

    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('admin can view achievements management', async ({ page }) => {
    await page.goto('/admin/achievements');
    await page.waitForLoadState('networkidle');

    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });
});
