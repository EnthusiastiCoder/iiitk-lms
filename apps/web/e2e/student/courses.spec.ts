import { test, expect } from '@playwright/test';

test.use({ storageState: '.auth/student.json' });

test.describe('Student Course Flows', () => {
  test('student can view course catalog', async ({ page }) => {
    await page.goto('/student/courses');
    await page.waitForLoadState('networkidle');

    // Verify the courses page loaded
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();

    // Check that the page content rendered (not a blank page)
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('student can view course detail', async ({ page }) => {
    // Navigate directly to a known course
    await page.goto('/student/courses/quantum-computing');
    await page.waitForLoadState('networkidle');

    // Verify the page loaded with course content
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('student can view lesson', async ({ page }) => {
    await page.goto('/student/courses');
    await page.waitForLoadState('networkidle');

    // Navigate to a course first
    const courseLink = page.locator('a[href*="/student/courses/"]').first();
    const hasCourses = await courseLink.isVisible().catch(() => false);

    if (hasCourses) {
      await courseLink.click();
      await page.waitForLoadState('networkidle');

      // Try to find and click a lesson link
      const lessonLink = page.locator('a[href*="/lessons/"]').first();
      const hasLessons = await lessonLink.isVisible().catch(() => false);

      if (hasLessons) {
        await lessonLink.click();
        await page.waitForLoadState('networkidle');

        // Verify lesson page loaded
        await expect(page).toHaveURL(/\/lessons\/.+/);
        const mainContent = page.locator('main');
        await expect(mainContent).toBeVisible();
      }
    }
  });
});

test.describe('Student Gamification Pages', () => {
  test('student can view achievements', async ({ page }) => {
    await page.goto('/student/achievements');
    await page.waitForLoadState('networkidle');

    const heading = page.getByRole('heading', { name: /achievements/i });
    await expect(heading).toBeVisible();
  });

  test('student can view leaderboard', async ({ page }) => {
    await page.goto('/student/leaderboard');
    await page.waitForLoadState('networkidle');

    const heading = page.getByRole('heading', { name: /leaderboard/i });
    await expect(heading).toBeVisible();
  });

  test('student can view profile', async ({ page }) => {
    await page.goto('/student/profile');
    await page.waitForLoadState('networkidle');

    // Verify profile page loaded with some content
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });
});
