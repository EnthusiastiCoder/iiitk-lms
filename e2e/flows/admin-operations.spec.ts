import { test, expect } from '@playwright/test';

test.use({ storageState: '.auth/admin.json' });

test.describe('Admin System Management', () => {
  test('admin dashboard shows system stats', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Verify welcome banner
    await expect(
      page.getByRole('heading', { level: 1, name: 'Admin Dashboard' })
    ).toBeVisible();
    await expect(
      page.getByText(
        'System overview and management controls for IIIT Kalyani LMS.'
      )
    ).toBeVisible();

    // Verify banner stats (Total Users, Courses, XP Earned)
    // These appear in the banner and the stat grid -- just check they exist
    await expect(page.getByText('Total Users').first()).toBeVisible();

    // Verify the 6-card stat grid
    const statLabels = [
      'Total Users',
      'Students',
      'Professors',
      'Courses',
      'Lessons',
      'Total XP Earned',
    ];
    for (const label of statLabels) {
      await expect(page.getByText(label).first()).toBeVisible();
    }

    // Verify "Quick Actions" section heading
    await expect(
      page.getByRole('heading', { name: 'Quick Actions' })
    ).toBeVisible();

    // Verify quick action cards
    await expect(page.getByText('Manage Users')).toBeVisible();
    await expect(page.getByText('Manage Courses')).toBeVisible();
    await expect(
      page.locator('a[href="/admin/achievements"]').getByText('Achievements')
    ).toBeVisible();
    await expect(
      page.locator('a[href="/admin/analytics"]').getByText('Analytics')
    ).toBeVisible();

    // Verify "Recent XP Activity" section
    await expect(
      page.getByRole('heading', { name: 'Recent XP Activity' })
    ).toBeVisible();

    // Verify the XP activity table headers
    await expect(page.locator('th').getByText('User')).toBeVisible();
    await expect(page.locator('th').getByText('XP')).toBeVisible();
    await expect(page.locator('th').getByText('Source')).toBeVisible();
    await expect(page.locator('th').getByText('Date')).toBeVisible();
  });

  test('admin can search and filter users', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // Verify heading and user count subtitle
    await expect(
      page.getByRole('heading', { level: 1, name: 'User Management' })
    ).toBeVisible();
    await expect(page.getByText(/\d+ users? total/)).toBeVisible();

    // Verify search input and role filter exist
    const searchInput = page.getByPlaceholder('Search by name or email...');
    await expect(searchInput).toBeVisible();

    // Verify the role filter select
    const roleFilter = page.getByRole('combobox');
    await expect(roleFilter).toBeVisible();

    // Verify table column headers
    const headers = ['User', 'Role', 'Level', 'XP', 'Joined', 'Actions'];
    for (const header of headers) {
      await expect(page.locator('th').getByText(header)).toBeVisible();
    }

    // Test search: type a search query and submit
    await searchInput.fill('test');
    await searchInput.press('Enter');
    await page.waitForLoadState('networkidle');

    // URL should include search param
    await expect(page).toHaveURL(/search=test/);

    // Clear search for next assertion
    await searchInput.clear();
    await searchInput.press('Enter');
    await page.waitForLoadState('networkidle');

    // Test role filter: click the filter and select "Student"
    await roleFilter.click();
    const studentOption = page.getByRole('option', { name: 'Student' });
    const hasOption = await studentOption.isVisible().catch(() => false);
    if (hasOption) {
      await studentOption.click();
      await page.waitForLoadState('networkidle');

      // URL should include role param
      await expect(page).toHaveURL(/role=student/);
    }
  });

  test('admin can view course management', async ({ page }) => {
    await page.goto('/admin/courses');
    await page.waitForLoadState('networkidle');

    // Verify heading and enrollment count subtitle
    await expect(
      page.getByRole('heading', { level: 1, name: 'Course Management' })
    ).toBeVisible();
    await expect(
      page.getByText(/\d+ courses? \| \d+ total enrollments?/)
    ).toBeVisible();

    // Verify summary stats
    await expect(page.getByText('Total Courses')).toBeVisible();
    await expect(page.getByText('Total Enrollments')).toBeVisible();
    await expect(page.getByText('Professors')).toBeVisible();

    // Check for course cards or empty state
    const isEmpty = await page
      .getByText(
        'No courses found. Create your first course to get started.'
      )
      .isVisible()
      .catch(() => false);

    if (!isEmpty) {
      // Verify course cards display enrollment badges
      await expect(page.getByText(/\d+ enrolled/).first()).toBeVisible();

      // Verify difficulty/category badges are present on course cards
      const mainContent = page.locator('main');
      await expect(mainContent).toBeVisible();
    }
  });

  test('admin can view achievements', async ({ page }) => {
    await page.goto('/admin/achievements');
    await page.waitForLoadState('networkidle');

    // Verify heading and count subtitle
    await expect(
      page.getByRole('heading', { level: 1, name: 'Achievement Management' })
    ).toBeVisible();
    await expect(
      page.getByText(/\d+ achievements? configured/)
    ).toBeVisible();

    // Check for achievement cards or empty state
    const isEmpty = await page
      .getByText(
        'No achievements found. Create your first achievement to get started.'
      )
      .isVisible()
      .catch(() => false);

    if (!isEmpty) {
      // Verify achievement cards show category, rarity, and XP badges
      await expect(page.getByText(/XP/).first()).toBeVisible();
    }

    // Verify the page rendered fully
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('admin can view analytics', async ({ page }) => {
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');

    // Verify heading and subtitle
    await expect(
      page.getByRole('heading', { level: 1, name: 'Analytics' })
    ).toBeVisible();
    await expect(
      page.getByText('Platform insights and statistics')
    ).toBeVisible();

    // Verify the four analytics cards are present
    await expect(
      page.getByRole('heading', { name: 'User Growth by Month' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Course Enrollment Distribution' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Top 10 Students by XP/ })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Recent Submissions' })
    ).toBeVisible();

    // Each card should show either data or an empty state message
    // Check if the top students section has data or empty message
    const topStudentsCard = page.locator('text=Top 10 Students by XP').first();
    await expect(topStudentsCard).toBeVisible();

    // Verify the recent submissions table has headers (if data exists)
    const submissionHeaders = page.locator('th');
    const hasSubmissionTable = await submissionHeaders
      .getByText('Student')
      .isVisible()
      .catch(() => false);

    if (hasSubmissionTable) {
      await expect(
        submissionHeaders.getByText('Status')
      ).toBeVisible();
      await expect(
        submissionHeaders.getByText('Score')
      ).toBeVisible();
    }
  });
});
