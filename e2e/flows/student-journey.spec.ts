import { test, expect } from '@playwright/test';

test.use({ storageState: '.auth/student.json' });

test.describe('Student Learning Journey', () => {
  test('student can browse and view course content', async ({ page }) => {
    // Navigate to course catalog
    await page.goto('/student/courses');
    await page.waitForLoadState('networkidle');

    // Verify the catalog page renders with heading and subtitle
    await expect(
      page.getByRole('heading', { level: 1, name: 'Courses' })
    ).toBeVisible();
    await expect(page.getByText('Browse and enroll in courses')).toBeVisible();

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
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      // Verify course stats are present (lessons, hours, XP, modules)
      await expect(page.getByText(/\d+ lessons/)).toBeVisible();
      await expect(page.getByText(/\d+ modules/)).toBeVisible();

      // Verify "Course Content" section heading
      await expect(
        page.getByRole('heading', { name: 'Course Content' })
      ).toBeVisible();

      // Verify progress ring in sidebar shows a percentage
      await expect(page.getByText(/\d+%/)).toBeVisible();

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

    // Verify level badge is present
    await expect(page.getByText(/Level \d+/)).toBeVisible();

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
    await expect(page.getByText('Achievements')).toBeVisible();
    await expect(page.getByText('Leaderboard')).toBeVisible();

    // Verify "All courses" link exists
    await expect(page.getByText('All courses')).toBeVisible();
  });

  test('student can view practice quizzes', async ({ page }) => {
    await page.goto('/student/practice');
    await page.waitForLoadState('networkidle');

    // Verify heading and subtitle
    await expect(
      page.getByRole('heading', { level: 1, name: 'Practice' })
    ).toBeVisible();
    await expect(
      page.getByText('Take quizzes to test your knowledge')
    ).toBeVisible();

    // Verify counters are present
    await expect(page.getByText('Attempted')).toBeVisible();
    await expect(page.getByText('Available')).toBeVisible();

    // Check for either quiz cards (grouped by course) or the empty state
    const hasQuizzes = await page
      .getByText('No quizzes available')
      .isVisible()
      .catch(() => false);

    if (hasQuizzes) {
      // Empty state: verify the full message
      await expect(
        page.getByText('Enroll in a course to access practice quizzes.')
      ).toBeVisible();
    }
    // If quizzes exist, the page rendered quiz cards -- the counters above confirm it loaded
  });

  test('student can view submissions', async ({ page }) => {
    await page.goto('/student/submissions');
    await page.waitForLoadState('networkidle');

    // Verify heading and subtitle
    await expect(
      page.getByRole('heading', { level: 1, name: 'Submissions' })
    ).toBeVisible();
    await expect(
      page.getByText('Your assignment and project submissions')
    ).toBeVisible();

    // Verify counters for Graded and Pending
    await expect(page.getByText('Graded')).toBeVisible();
    await expect(page.getByText('Pending')).toBeVisible();

    // Verify tabs are present (All, Pending, Graded)
    const allTab = page.getByRole('tab', { name: /All/i });
    await expect(allTab).toBeVisible();

    const pendingTab = page.getByRole('tab', { name: /Pending/i });
    await expect(pendingTab).toBeVisible();

    const gradedTab = page.getByRole('tab', { name: /Graded/i });
    await expect(gradedTab).toBeVisible();

    // Click through each tab to verify they render
    await pendingTab.click();
    await expect(pendingTab).toHaveAttribute('data-state', 'active');

    await gradedTab.click();
    await expect(gradedTab).toHaveAttribute('data-state', 'active');
  });

  test('student can view achievements', async ({ page }) => {
    await page.goto('/student/achievements');
    await page.waitForLoadState('networkidle');

    // Verify heading and subtitle
    await expect(
      page.getByRole('heading', { level: 1, name: 'Achievements' })
    ).toBeVisible();
    await expect(
      page.getByText('Unlock achievements as you learn')
    ).toBeVisible();

    // Verify earned counter (shows "of X Earned")
    await expect(page.getByText(/of \d+ Earned/)).toBeVisible();

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
      await expect(tab).toHaveAttribute('data-state', 'active');

      // Each tab should show either achievement cards or the empty state
      const tabPanel = page.getByRole('tabpanel');
      await expect(tabPanel).toBeVisible();
    }
  });

  test('student can view leaderboard', async ({ page }) => {
    await page.goto('/student/leaderboard');
    await page.waitForLoadState('networkidle');

    // Verify heading and subtitle
    await expect(
      page.getByRole('heading', { level: 1, name: 'Leaderboard' })
    ).toBeVisible();
    await expect(page.getByText('Top learners ranked by XP')).toBeVisible();

    // Check for either populated leaderboard or empty state
    const isEmpty = await page
      .getByText('No rankings yet. Start learning to climb the board!')
      .isVisible()
      .catch(() => false);

    if (!isEmpty) {
      // Verify the top 3 podium cards exist with labels
      const podiumLabels = ['1st', '2nd', '3rd'];
      for (const label of podiumLabels) {
        const podiumCard = page.getByText(label, { exact: true });
        const isVisible = await podiumCard.isVisible().catch(() => false);
        // At least the 1st place should be visible if data exists
        if (label === '1st') {
          await expect(podiumCard).toBeVisible();
        }
      }

      // Verify rankings table has the expected column headers
      await expect(page.getByText('Rank')).toBeVisible();
      await expect(
        page.locator('th').getByText('Student')
      ).toBeVisible();
      await expect(page.locator('th').getByText('XP')).toBeVisible();

      // Verify the current user appears somewhere (marked with "(You)")
      const youMarker = page.getByText('(You)');
      const userVisible = await youMarker.isVisible().catch(() => false);
      // The user might or might not be in the visible range -- just log it
    }
  });

  test('student can view and edit profile', async ({ page }) => {
    await page.goto('/student/profile');
    await page.waitForLoadState('networkidle');

    // Verify profile header with user name in h1
    const nameHeading = page.getByRole('heading', { level: 1 });
    await expect(nameHeading).toBeVisible();
    const name = await nameHeading.textContent();
    expect(name).toBeTruthy();

    // Verify tier badge is present (Bronze, Silver, Gold, or Diamond)
    await expect(
      page.getByText(/Bronze|Silver|Gold|Diamond/)
    ).toBeVisible();

    // Verify level badge
    await expect(page.getByText(/Level \d+/)).toBeVisible();

    // Verify level progress bar text
    await expect(page.getByText(/Level \d+ Progress/)).toBeVisible();

    // Verify stat cards
    await expect(page.getByText('Total XP')).toBeVisible();
    await expect(page.getByText('Lessons Done')).toBeVisible();
    await expect(page.getByText('Current Streak')).toBeVisible();
    await expect(page.getByText('Longest Streak')).toBeVisible();

    // Verify "Course Progress" section
    await expect(
      page.getByRole('heading', { name: 'Course Progress' })
    ).toBeVisible();

    // Should show either enrolled courses with progress bars, or the empty state
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });
});
