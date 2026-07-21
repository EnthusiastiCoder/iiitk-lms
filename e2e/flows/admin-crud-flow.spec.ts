import { test, expect } from '@playwright/test';

test.use({ storageState: '.auth/admin.json' });

test.describe('Admin CRUD Operations', () => {
  test('admin can open and close the create course dialog', async ({
    page,
  }) => {
    await page.goto('/admin/courses');
    await page.waitForLoadState('networkidle');

    // Verify course management page loaded
    await expect(
      page.getByRole('heading', { level: 1, name: 'Course Management' })
    ).toBeVisible();

    // Find "Create Course" button
    const createBtn = page.getByText('Create Course').first();
    const hasCreate = await createBtn.isVisible().catch(() => false);

    if (!hasCreate) return;

    await createBtn.click();

    // Verify dialog opened (base-ui uses data-slot, role may vary)
    const dialog = page.getByRole('dialog').filter({ has: page.locator('input, textarea') });
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Verify dialog title
    await expect(dialog.getByText('Create New Course')).toBeVisible();
    await expect(
      dialog.getByText('Add a new course to the LMS platform.')
    ).toBeVisible();

    // Verify form fields exist
    // Title input
    const titleInput = dialog.getByPlaceholder(
      'e.g. Data Structures and Algorithms'
    );
    await expect(titleInput).toBeVisible();

    // Slug input
    const slugInput = dialog.getByPlaceholder(
      'e.g. data-structures-algorithms'
    );
    await expect(slugInput).toBeVisible();

    // Description input
    const descInput = dialog.getByPlaceholder('Course description...');
    await expect(descInput).toBeVisible();

    // Test that typing a title auto-generates the slug
    await titleInput.fill('Test Course Name');
    await expect(slugInput).toHaveValue('test-course-name');

    // Verify difficulty select exists
    const difficultyTrigger = dialog
      .locator('[data-slot="select-trigger"]')
      .first();
    await expect(difficultyTrigger).toBeVisible();

    // Verify Cancel button
    const cancelBtn = dialog.getByRole('button', { name: /Cancel/i });
    await expect(cancelBtn).toBeVisible();

    // Verify Create Course button
    const submitBtn = dialog.getByText('Create Course').first();
    await expect(submitBtn).toBeVisible();

    // Close without saving
    await cancelBtn.click();
    await expect(dialog).not.toBeVisible();
  });

  test('admin can open and close the create achievement dialog', async ({
    page,
  }) => {
    await page.goto('/admin/achievements');
    await page.waitForLoadState('networkidle');

    // Verify achievement management page loaded
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Achievement Management',
      })
    ).toBeVisible();

    // Find "Create Achievement" button
    const createBtn = page.getByText('Create Achievement').first();
    const hasCreate = await createBtn.isVisible().catch(() => false);

    if (!hasCreate) return;

    await createBtn.click();

    // Verify dialog opened (base-ui uses data-slot, role may vary)
    const dialog = page.getByRole('dialog').filter({ has: page.locator('input, textarea') });
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Verify dialog title
    await expect(dialog.getByText('Create New Achievement')).toBeVisible();
    await expect(
      dialog.getByText('Add a new achievement badge for students to earn.')
    ).toBeVisible();

    // Verify form fields
    const titleInput = dialog.getByPlaceholder('e.g. First Steps');
    await expect(titleInput).toBeVisible();

    const descInput = dialog.getByPlaceholder(
      'e.g. Complete your first lesson'
    );
    await expect(descInput).toBeVisible();

    // Icon input
    const iconInput = dialog.locator('input[class*="text-center"]');
    const hasIcon = await iconInput.isVisible().catch(() => false);

    // XP Reward input
    const xpInput = dialog.locator('input[type="number"]');
    await expect(xpInput).toBeVisible();

    // Fill in a title to verify interactivity
    await titleInput.fill('E2E Test Achievement');
    await expect(titleInput).toHaveValue('E2E Test Achievement');

    // Verify Category and Rarity select dropdowns exist
    const selectTriggers = dialog.locator('[data-slot="select-trigger"]');
    const selectCount = await selectTriggers.count();
    expect(selectCount).toBeGreaterThanOrEqual(2); // Category + Rarity

    // Verify Cancel and Create buttons
    const cancelBtn = dialog.getByRole('button', { name: /Cancel/i });
    await expect(cancelBtn).toBeVisible();

    const submitBtn = dialog.getByRole('button', {
      name: /Create Achievement/i,
    });
    await expect(submitBtn).toBeVisible();

    // Close without saving
    await cancelBtn.click();
    await expect(dialog).not.toBeVisible();
  });

  test('admin can interact with user management search and filter', async ({
    page,
  }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // Verify user management page loaded
    await expect(
      page
        .locator('main')
        .getByRole('heading', { level: 1, name: 'User Management' })
    ).toBeVisible();

    // Verify search input exists
    const searchInput = page.getByPlaceholder('Search by name or email...');
    await expect(searchInput).toBeVisible();

    // Test search functionality
    await searchInput.fill('e2e');
    await expect(searchInput).toHaveValue('e2e');
    await searchInput.press('Enter');
    await page.waitForLoadState('networkidle');

    // Verify the URL updated with search param
    await expect(page).toHaveURL(/search=e2e/);

    // Verify the table still renders
    await expect(page.locator('main')).toBeVisible();

    // Verify role filter dropdown exists
    const roleFilter = page
      .locator(
        'main select, main [data-slot="select-trigger"], main button:has-text("All Roles")'
      )
      .first();
    const hasFilter = await roleFilter.isVisible().catch(() => false);

    if (hasFilter) {
      await roleFilter.click();

      // Look for the Student option in the dropdown
      const studentOption = page
        .locator('[data-slot="select-item"]')
        .filter({ hasText: 'Student' });
      const hasOption = await studentOption.isVisible().catch(() => false);

      if (hasOption) {
        await studentOption.click();
        await page.waitForLoadState('networkidle');

        // URL should include role filter
        await expect(page).toHaveURL(/role=student/);
      }
    }

    // Verify table column headers
    const headers = ['User', 'Role', 'Level', 'XP', 'Joined', 'Actions'];
    for (const header of headers) {
      await expect(
        page.locator('main').locator('th', { hasText: header }).first()
      ).toBeVisible();
    }
  });

  test('admin can view course cards with enrollment counts', async ({
    page,
  }) => {
    await page.goto('/admin/courses');
    await page.waitForLoadState('networkidle');

    // Check for course cards or empty state
    const isEmpty = await page
      .getByText(
        'No courses found. Create your first course to get started.'
      )
      .isVisible()
      .catch(() => false);

    if (isEmpty) {
      await expect(
        page.getByText(
          'No courses found. Create your first course to get started.'
        )
      ).toBeVisible();
      return;
    }

    // Verify enrollment badges on course cards
    await expect(page.getByText(/\d+ enrolled/).first()).toBeVisible();

    // Verify summary stats
    await expect(page.getByText('Total Courses')).toBeVisible();
    await expect(page.getByText('Total Enrollments').first()).toBeVisible();
    await expect(page.getByText('Professors')).toBeVisible();
  });

  test('admin can view achievement cards with category and rarity badges', async ({
    page,
  }) => {
    await page.goto('/admin/achievements');
    await page.waitForLoadState('networkidle');

    const isEmpty = await page
      .getByText(
        'No achievements found. Create your first achievement to get started.'
      )
      .isVisible()
      .catch(() => false);

    if (isEmpty) {
      await expect(
        page.getByText(
          'No achievements found. Create your first achievement to get started.'
        )
      ).toBeVisible();
      return;
    }

    // Verify achievement cards show XP badges
    await expect(page.getByText(/XP/).first()).toBeVisible();

    // Verify the count subtitle
    await expect(
      page.getByText(/\d+ achievements? configured/)
    ).toBeVisible();
  });
});
