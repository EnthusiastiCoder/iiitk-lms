import { test, expect } from '@playwright/test';

test.describe('Cross-Role Access Control', () => {
  test('student cannot access admin pages', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: '.auth/student.json',
    });
    const page = await context.newPage();

    // Students should be redirected away from /admin
    // The admin layout checks profile.role !== "admin" and redirects to /student
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Should NOT stay on an admin page -- redirected to /student
    await expect(page).not.toHaveURL(/\/admin/);

    await context.close();
  });

  test('student can access professor pages (demo mode)', async ({
    browser,
  }) => {
    // Note: The professor layout allows any authenticated user for demo purposes.
    // This test documents the current behavior (no role guard on professor pages).
    const context = await browser.newContext({
      storageState: '.auth/student.json',
    });
    const page = await context.newPage();

    await page.goto('/professor');
    await page.waitForLoadState('networkidle');

    // Since the professor layout has no role check, the student should stay
    // on the professor page (or at minimum not be sent to /auth)
    await expect(page).not.toHaveURL(/\/auth/);

    await context.close();
  });

  test('professor can access professor pages', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: '.auth/professor.json',
    });
    const page = await context.newPage();

    await page.goto('/professor');
    await page.waitForLoadState('networkidle');

    // Should stay on professor page, not be redirected to auth
    await expect(page).not.toHaveURL(/\/auth/);

    // Verify the dashboard actually rendered
    await expect(
      page.getByRole('heading', { level: 1, name: /Welcome back,/ })
    ).toBeVisible();

    await context.close();
  });

  test('admin can access admin pages', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: '.auth/admin.json',
    });
    const page = await context.newPage();

    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Should stay on admin page
    await expect(page).not.toHaveURL(/\/auth/);
    await expect(page).toHaveURL(/\/admin/);

    // Verify the dashboard actually rendered
    await expect(
      page.getByRole('heading', { level: 1, name: 'Admin Dashboard' })
    ).toBeVisible();

    await context.close();
  });

  test('unauthenticated user is redirected to login', async ({ browser }) => {
    // Create a context with no stored auth state
    const context = await browser.newContext();
    const page = await context.newPage();

    // Try accessing a protected student page
    await page.goto('/student');
    await page.waitForLoadState('networkidle');

    // Should be redirected to the login page
    await expect(page).toHaveURL(/\/auth\/login/);

    await context.close();
  });

  test('admin can also access student pages', async ({ browser }) => {
    // The student layout only checks for authentication, not role
    const context = await browser.newContext({
      storageState: '.auth/admin.json',
    });
    const page = await context.newPage();

    await page.goto('/student');
    await page.waitForLoadState('networkidle');

    // Should not be redirected to auth
    await expect(page).not.toHaveURL(/\/auth/);

    // The student dashboard should render (greeting visible)
    await expect(
      page.getByText(/Good (morning|afternoon|evening),/)
    ).toBeVisible();

    await context.close();
  });
});
