import { test, expect } from '@playwright/test';

test.use({ storageState: '.auth/professor.json' });

test.describe('Professor Dashboard Flows', () => {
  test('professor can view dashboard', async ({ page }) => {
    await page.goto('/professor');
    await page.waitForLoadState('networkidle');

    // Verify the dashboard page loaded
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible();

    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('professor can view student roster', async ({ page }) => {
    await page.goto('/professor/students');
    await page.waitForLoadState('networkidle');

    // Verify the students page loaded
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('professor can view grading center', async ({ page }) => {
    await page.goto('/professor/grading');
    await page.waitForLoadState('networkidle');

    // Verify the grading page loaded
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('professor can view courses', async ({ page }) => {
    await page.goto('/professor/courses');
    await page.waitForLoadState('networkidle');

    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('professor can view profile', async ({ page }) => {
    await page.goto('/professor/profile');
    await page.waitForLoadState('networkidle');

    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });
});
