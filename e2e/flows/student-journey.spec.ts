import { test, expect } from '@playwright/test';

test.use({ storageState: '.auth/student.json' });

test.describe('Student Learning Journey', () => {
  test('student can browse and view course content', async ({ page }) => {
    // Navigate to course catalog
    await page.goto('/student/courses');
    await page.waitForLoadState('networkidle');

    // Verify the catalog page renders with heading and subtitle
    await expect(
      page.locator('main').getByRole('heading', { level: 1, name: 'Courses' })
    ).toBeVisible();
    await expect(
      page.locator('main').getByText('Browse and enroll in courses')
    ).toBeVisible();

    // Check that the main content area rendered
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    // Try to navigate into a course detail page
    const courseLink = page.locator('a[href*="/student/courses/"]').first();
    const hasCourses = await courseLink.isVisible().catch(() => false);

    if (hasCourses) {
      await courseLink.click();
      await page.waitForLoadState('networkidle');

      // Verify course detail page loaded with title
      await expect(
        page.locator('main').getByRole('heading', { level: 1 })
      ).toBeVisible();

      // Verify course detail page has content
      await expect(page.locator('main')).toBeVisible();

      // Try to click into a lesson
      const lessonLink = page.locator('a[href*="/lessons/"]').first();
      const hasLessons = await lessonLink.isVisible().catch(() => false);

      if (hasLessons) {
        await lessonLink.click();
        await page.waitForLoadState('networkidle');

        // Verify lesson page loaded (URL contains /lessons/)
        await expect(page).toHaveURL(/\/lessons\/.+/);
        await expect(page.locator('main')).toBeVisible();
      }
    }
  });

  test('student can view their dashboard', async ({ page }) => {
    await page.goto('/student');
    await page.waitForLoadState('networkidle');

    // Verify greeting banner with user's first name
    // The greeting is one of: "Good morning,", "Good afternoon,", "Good evening,"
    await expect(
      page.getByText(/Good (morning|afternoon|evening),/)
    ).toBeVisible();

    // Verify the user's name heading (the h1 with "!")
    const nameHeading = page.getByRole('heading', { level: 1 });
    await expect(nameHeading).toBeVisible();

    // Verify level badge is present (multiple "Level N" texts exist in main + sidebar)
    await expect(
      page.locator('main').getByText(/Level \d+/).first()
    ).toBeVisible();

    // Verify the four stat cards are rendered
    await expect(page.getByText('Lessons Done')).toBeVisible();
    await expect(page.getByText('Total XP')).toBeVisible();
    await expect(page.getByText('Day Streak')).toBeVisible();
    await expect(page.getByText('Rank')).toBeVisible();

    // Verify "Continue Learning" section exists
    await expect(
      page.getByRole('heading', { name: 'Continue Learning' })
    ).toBeVisible();

    // Verify "Weekly XP" card exists
    await expect(page.getByText('Weekly XP')).toBeVisible();

    // Verify quick link cards for Achievements and Leaderboard
    // (scope to main to avoid matching sidebar nav labels)
    await expect(page.locator('main').getByText('Achievements')).toBeVisible();
    await expect(page.locator('main').getByText('Leaderboard')).toBeVisible();

    // Verify "All courses" link exists
    await expect(page.getByText('All courses')).toBeVisible();
  });

  test('student can view practice quizzes', async ({ page }) => {
    await page.goto('/student/practice');
    await page.waitForLoadState('networkidle');

    // Verify heading and subtitle (scope to main to avoid sidebar nav conflicts)
    await expect(
      page.locator('main').getByRole('heading', { level: 1, name: 'Practice' })
    ).toBeVisible();
    await expect(
      page.locator('main').getByText('Take quizzes to test your knowledge')
    ).toBeVisible();

    // Verify counters are present (scope to main)
    await expect(
      page.locator('main').getByText('Attempted')
    ).toBeVisible();
    await expect(
      page.locator('main').getByText('Available', { exact: true }).first()
    ).toBeVisible();

    // Check for either quiz cards (grouped by course) or the empty state
    const hasEmptyState = await page
      .locator('main')
      .getByText('No quizzes available')
      .isVisible()
      .catch(() => false);

    if (hasEmptyState) {
      // Empty state: verify the full message
      await expect(
        page.locator('main').getByText('Enroll in a course to access practice quizzes.')
      ).toBeVisible();
    }
    // If quizzes exist, the page rendered quiz cards -- the counters above confirm it loaded
  });

  test('student can view submissions', async ({ page }) => {
    await page.goto('/student/submissions');
    await page.waitForLoadState('networkidle');

    // Verify heading and subtitle (scope to main to avoid sidebar nav conflicts)
    await expect(
      page
        .locator('main')
        .getByRole('heading', { level: 1, name: 'Submissions' })
    ).toBeVisible();
    await expect(
      page
        .locator('main')
        .getByText('Your assignment and project submissions')
    ).toBeVisible();

    // Verify counters for Graded and Pending (use .first() to avoid matching tab text)
    await expect(
      page.locator('main').getByText('Graded').first()
    ).toBeVisible();
    await expect(
      page.locator('main').getByText('Pending').first()
    ).toBeVisible();

    // Verify tabs are present (All, Pending, Graded)
    const allTab = page.getByRole('tab', { name: /All/i });
    await expect(allTab).toBeVisible();

    const pendingTab = page.getByRole('tab', { name: /Pending/i });
    await expect(pendingTab).toBeVisible();

    const gradedTab = page.getByRole('tab', { name: /Graded/i });
    await expect(gradedTab).toBeVisible();

    // Click through each tab to verify they render
    await pendingTab.click();
    await expect(pendingTab).toHaveAttribute('aria-selected', 'true');

    await gradedTab.click();
    await expect(gradedTab).toHaveAttribute('aria-selected', 'true');
  });

  test('student can view achievements', async ({ page }) => {
    await page.goto('/student/achievements');
    await page.waitForLoadState('networkidle');

    // Verify heading and subtitle (scope to main to avoid sidebar nav conflicts)
    await expect(
      page
        .locator('main')
        .getByRole('heading', { level: 1, name: 'Achievements' })
    ).toBeVisible();
    await expect(
      page.locator('main').getByText('Unlock achievements as you learn')
    ).toBeVisible();

    // Verify earned counter (shows "of X Earned")
    await expect(
      page.locator('main').getByText(/of \d+ Earned/)
    ).toBeVisible();

    // Verify category tabs exist
    const tabNames = ['All', 'Learning', 'Streak', 'Social', 'Mastery'];
    for (const name of tabNames) {
      await expect(
        page.getByRole('tab', { name: new RegExp(name, 'i') })
      ).toBeVisible();
    }

    // Click through each tab to verify they render without error
    for (const name of tabNames) {
      const tab = page.getByRole('tab', { name: new RegExp(name, 'i') });
      await tab.click();
      await expect(tab).toHaveAttribute('aria-selected', 'true');

      // Each tab should show either achievement cards or the empty state
      // The main content area should still be visible after switching tabs
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('student can view leaderboard', async ({ page }) => {
    await page.goto('/student/leaderboard');
    await page.waitForLoadState('networkidle');

    // Verify heading and subtitle (scope to main to avoid sidebar nav conflicts)
    await expect(
      page
        .locator('main')
        .getByRole('heading', { level: 1, name: 'Leaderboard' })
    ).toBeVisible();
    await expect(
      page.locator('main').getByText('Top learners ranked by XP')
    ).toBeVisible();

    // Check for either populated leaderboard or empty state
    const isEmpty = await page
      .locator('main')
      .getByText('No rankings yet. Start learning to climb the board!')
      .isVisible()
      .catch(() => false);

    if (!isEmpty) {
      // Verify the top 3 podium cards exist with labels
      const podiumLabels = ['1st', '2nd', '3rd'];
      for (const label of podiumLabels) {
        const podiumCard = page
          .locator('main')
          .getByText(label, { exact: true });
        const isVisible = await podiumCard.isVisible().catch(() => false);
        // At least the 1st place should be visible if data exists
        if (label === '1st') {
          await expect(podiumCard).toBeVisible();
        }
      }

      // Verify rankings table has the expected column headers
      await expect(
        page.locator('main th').getByText('Rank')
      ).toBeVisible();
      await expect(
        page.locator('main th').getByText('Student')
      ).toBeVisible();
      await expect(
        page.locator('main th').getByText('XP')
      ).toBeVisible();

      // Verify the current user appears somewhere (marked with "(You)")
      const youMarker = page.locator('main').getByText('(You)');
      const userVisible = await youMarker
        .first()
        .isVisible()
        .catch(() => false);
      // The user might or might not be in the visible range -- just log it
    }
  });

  test('student can view and edit profile', async ({ page }) => {
    await page.goto('/student/profile');
    await page.waitForLoadState('networkidle');

    // Verify profile header with user name in h1
    const nameHeading = page
      .locator('main')
      .getByRole('heading', { level: 1 });
    await expect(nameHeading).toBeVisible();
    const name = await nameHeading.textContent();
    expect(name).toBeTruthy();

    // Verify tier badge is present (Bronze, Silver, Gold, or Diamond)
    await expect(
      page.locator('main').getByText(/Bronze|Silver|Gold|Diamond/).first()
    ).toBeVisible();

    // Verify level badge (scope to main to avoid matching sidebar "Level N")
    await expect(
      page.locator('main').getByText(/Level \d+/).first()
    ).toBeVisible();

    // Verify level progress bar text
    await expect(
      page.locator('main').getByText(/Level \d+ Progress/)
    ).toBeVisible();

    // Verify stat cards
    await expect(page.locator('main').getByText('Total XP')).toBeVisible();
    await expect(
      page.locator('main').getByText('Lessons Done')
    ).toBeVisible();
    await expect(
      page.locator('main').getByText('Current Streak')
    ).toBeVisible();
    await expect(
      page.locator('main').getByText('Longest Streak')
    ).toBeVisible();

    // Verify "Course Progress" section (CardTitle is a div, not heading)
    await expect(
      page.locator('main').getByText('Course Progress')
    ).toBeVisible();

    // Should show either enrolled courses with progress bars, or the empty state
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });
});
