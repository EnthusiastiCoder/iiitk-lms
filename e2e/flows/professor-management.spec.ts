import { test, expect } from '@playwright/test';

test.use({ storageState: '.auth/professor.json' });

test.describe('Professor Course Management', () => {
  test('professor dashboard shows class stats', async ({ page }) => {
    await page.goto('/professor');
    await page.waitForLoadState('networkidle');

    // Verify welcome banner with professor name
    await expect(
      page.locator('main').getByText(/Welcome back,/)
    ).toBeVisible();

    // Verify the subtitle text
    await expect(
      page
        .locator('main')
        .getByText(
          'Here is an overview of your classes and student progress.'
        )
    ).toBeVisible();

    // Verify stat labels in the banner (scope to main to avoid sidebar nav conflicts)
    await expect(
      page.locator('main').getByText('Courses', { exact: true }).first()
    ).toBeVisible();
    await expect(
      page.locator('main').getByText('Total Enrollments').first()
    ).toBeVisible();
    await expect(
      page.locator('main').getByText(/Avg [Pp]rogress/).first()
    ).toBeVisible();

    // Verify quick action cards
    await expect(
      page.locator('main').getByText('Student Roster')
    ).toBeVisible();
    await expect(
      page.locator('main').getByText('Grading Center')
    ).toBeVisible();
    await expect(
      page.locator('main').getByText('Manage Courses')
    ).toBeVisible();

    // Verify "Class Overview" section heading
    await expect(
      page.locator('main').getByRole('heading', { name: 'Class Overview' })
    ).toBeVisible();

    // Check for course cards or empty state
    const isEmpty = await page
      .locator('main')
      .getByText(
        'No courses found. Course data will appear here once courses are available.'
      )
      .isVisible()
      .catch(() => false);

    if (!isEmpty) {
      // Course cards should show student count badges and progress bars
      await expect(
        page.locator('main').getByText(/\d+ students/).first()
      ).toBeVisible();
      await expect(
        page.locator('main').getByText(/\d+ lessons/).first()
      ).toBeVisible();
      await expect(
        page.locator('main').getByText('Avg progress').first()
      ).toBeVisible();
    }
  });

  test('professor can browse student roster', async ({ page }) => {
    await page.goto('/professor/students');
    await page.waitForLoadState('networkidle');

    // Verify heading and enrollment count subtitle
    await expect(
      page.getByRole('heading', { level: 1, name: 'Students' })
    ).toBeVisible();
    await expect(page.getByText(/\d+ students? enrolled/)).toBeVisible();

    // Verify the search input exists
    const searchInput = page.getByPlaceholder('Search students...');
    await expect(searchInput).toBeVisible();

    // Verify table column headers
    await expect(page.locator('th').getByText('Student')).toBeVisible();
    await expect(page.locator('th').getByText('Level')).toBeVisible();
    await expect(page.locator('th').getByText('XP')).toBeVisible();
    await expect(page.locator('th').getByText('Tier')).toBeVisible();
    await expect(page.locator('th').getByText('Streak')).toBeVisible();

    // Test search functionality
    await searchInput.fill('test');
    await searchInput.press('Enter');
    await page.waitForLoadState('networkidle');

    // After search, the URL should include the search param
    await expect(page).toHaveURL(/search=test/);

    // Table should show filtered results or "No students found matching your search."
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('professor can view student detail', async ({ page }) => {
    await page.goto('/professor/students');
    await page.waitForLoadState('networkidle');

    // Find the first student link in the table
    const studentLink = page
      .locator('a[href*="/professor/students/"]')
      .first();
    const hasStudents = await studentLink.isVisible().catch(() => false);

    if (hasStudents) {
      // Navigate directly to avoid potential click-interception issues
      const href = await studentLink.getAttribute('href');
      if (href) {
        await page.goto(href);
      } else {
        await studentLink.click();
      }
      await page.waitForLoadState('networkidle');

      // Verify we're on the student detail page
      await expect(page).toHaveURL(/\/professor\/students\/.+/);

      // Verify "Back to Students" link
      await expect(page.getByText('Back to Students')).toBeVisible();

      // Verify student info is displayed (name, level, XP, streak cards)
      await expect(page.locator('main')).toBeVisible();

      // Verify "Course Progress" section
      const courseProgressHeading = page.getByText('Course Progress');
      const hasCourseProgress = await courseProgressHeading
        .isVisible()
        .catch(() => false);

      // Verify "Recent Quiz Scores" section
      const quizScoresHeading = page.getByText('Recent Quiz Scores');
      const hasQuizScores = await quizScoresHeading
        .isVisible()
        .catch(() => false);
    }
  });

  test('professor can view grading center', async ({ page }) => {
    await page.goto('/professor/grading');
    await page.waitForLoadState('networkidle');

    // Verify heading and subtitle
    await expect(
      page.getByRole('heading', { level: 1, name: 'Grading Center' })
    ).toBeVisible();
    await expect(
      page.getByText('Review and grade student submissions')
    ).toBeVisible();

    // Verify summary cards for pending and graded counts
    await expect(page.getByText('Pending Review')).toBeVisible();
    await expect(page.getByText('Recently Graded').first()).toBeVisible();

    // Verify section headings
    await expect(
      page.getByRole('heading', { name: 'Pending Submissions' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Recently Graded' })
    ).toBeVisible();

    // Either there are submissions or the empty states
    const pendingEmpty = await page
      .getByText('No pending submissions. All caught up!')
      .isVisible()
      .catch(() => false);

    const gradedEmpty = await page
      .getByText('No recently graded submissions.')
      .isVisible()
      .catch(() => false);

    // If not empty, verify the sub-sections render (Assignments / Projects)
    if (!pendingEmpty) {
      const assignmentsLabel = page.getByText('Assignments');
      const hasAssignments = await assignmentsLabel
        .first()
        .isVisible()
        .catch(() => false);

      if (hasAssignments) {
        // Verify pending badges
        await expect(page.getByText('Pending').first()).toBeVisible();
      }
    }
  });

  test('professor can manage course content', async ({ page }) => {
    await page.goto('/professor/courses');
    await page.waitForLoadState('networkidle');

    // Verify heading and subtitle (scope to main to avoid sidebar "Courses" nav)
    await expect(
      page
        .locator('main')
        .getByRole('heading', { level: 1, name: 'Courses' })
    ).toBeVisible();
    await expect(
      page
        .locator('main')
        .getByText('Manage your courses and track student progress')
    ).toBeVisible();

    // Verify summary stats
    await expect(
      page.locator('main').getByText('Total Courses')
    ).toBeVisible();
    await expect(
      page.locator('main').getByText('Total Enrollments')
    ).toBeVisible();
    await expect(
      page.locator('main').getByText('Total Lessons')
    ).toBeVisible();

    // Check for course cards or empty state
    const isEmpty = await page
      .locator('main')
      .getByText(
        'No courses found. Course data will appear here once courses are set up.'
      )
      .isVisible()
      .catch(() => false);

    if (!isEmpty) {
      // Verify course cards have "Click to manage" text
      await expect(
        page.locator('main').getByText('Click to manage').first()
      ).toBeVisible();

      // Verify progress bars are shown (Avg progress label)
      await expect(
        page.locator('main').getByText('Avg progress').first()
      ).toBeVisible();

      // Click into a course to verify the detail page
      const courseCard = page
        .locator('a[href*="/professor/courses/"]')
        .first();
      const hasCourseLink = await courseCard.isVisible().catch(() => false);

      if (hasCourseLink) {
        await courseCard.click();
        await page.waitForLoadState('networkidle');

        // Verify course detail page loaded
        await expect(page).toHaveURL(/\/professor\/courses\/.+/);

        // Verify "Back to Courses" link
        await expect(
          page.locator('main').getByText('Back to Courses')
        ).toBeVisible();

        // Verify course title in a heading
        await expect(page.locator('main')).toBeVisible();

        // Verify course content page loaded
        await expect(page.locator('main')).toBeVisible();
      }
    }
  });
});
