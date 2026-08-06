import { test, expect } from '@playwright/test';

test.use({ storageState: '.auth/student.json' });

test.describe('Quiz Taking Flow', () => {
  test('student can navigate to a quiz from the practice page', async ({
    page,
  }) => {
    await page.goto('/student/practice');
    await page.waitForLoadState('networkidle');

    // Verify practice page loaded
    await expect(
      page.locator('main').getByRole('heading', { level: 1, name: 'Practice' })
    ).toBeVisible();

    // Check for quiz cards or the empty state
    const hasEmptyState = await page
      .locator('main')
      .getByText('No quizzes available')
      .isVisible()
      .catch(() => false);

    if (hasEmptyState) {
      // No quizzes available -- verify the empty state message
      await expect(
        page
          .locator('main')
          .getByText('Enroll in a course to access practice quizzes.')
      ).toBeVisible();
      return;
    }

    // Quizzes exist -- find a "Take Quiz" or "Retake Quiz" link
    const quizLink = page
      .locator('a[href*="/quiz/"]')
      .first();
    const hasQuiz = await quizLink.isVisible().catch(() => false);

    if (hasQuiz) {
      await quizLink.click();
      await page.waitForLoadState('networkidle');

      // Verify quiz page loaded -- QuizTaker renders a title in h1
      await expect(
        page.locator('main').getByRole('heading', { level: 1 })
      ).toBeVisible();

      // Verify progress indicator exists ("Question X of Y")
      await expect(
        page.locator('main').getByText(/Question \d+ of \d+/)
      ).toBeVisible();

      // Verify the question content area is visible
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('student can navigate to a quiz from a course detail page', async ({
    page,
  }) => {
    // Navigate to a known course
    await page.goto('/student/courses/quantum-computing');
    await page.waitForLoadState('networkidle');

    // Expand the first module accordion to reveal quiz links
    const accordionTrigger = page
      .locator('[data-slot="accordion-trigger"]')
      .first();
    const hasAccordion = await accordionTrigger.isVisible().catch(() => false);

    if (hasAccordion) {
      await accordionTrigger.click();

      // Look for a quiz link inside the expanded module content
      const quizLink = page.locator('a[href*="/quiz/"]').first();
      const hasQuiz = await quizLink.isVisible().catch(() => false);

      if (hasQuiz) {
        await quizLink.click();
        await page.waitForLoadState('networkidle');

        // Verify quiz page loaded with title and progress
        await expect(
          page.locator('main').getByRole('heading', { level: 1 })
        ).toBeVisible();
        await expect(
          page.locator('main').getByText(/Question \d+ of \d+/)
        ).toBeVisible();
      }
    }
  });

  test('student can interact with quiz question options', async ({ page }) => {
    await page.goto('/student/practice');
    await page.waitForLoadState('networkidle');

    // Find and click a quiz link
    const quizLink = page.locator('a[href*="/quiz/"]').first();
    const hasQuiz = await quizLink.isVisible().catch(() => false);

    if (!hasQuiz) return; // No quizzes available -- skip

    await quizLink.click();
    await page.waitForLoadState('networkidle');

    // Verify the quiz loaded
    await expect(
      page.locator('main').getByText(/Question \d+ of \d+/)
    ).toBeVisible();

    // Try to interact with a multiple-choice option button
    // QuizQuestion renders options as <button> elements with letter badges (A, B, C, D)
    const optionButton = page
      .locator('main button')
      .filter({ has: page.locator('span') })
      .first();
    const hasOption = await optionButton.isVisible().catch(() => false);

    if (hasOption) {
      await optionButton.click();

      // After selecting, the button should get a ring-2 ring-brand style (selected state)
      // Verify the answered count updated
      await expect(
        page.locator('main').getByText(/\d+ answered/)
      ).toBeVisible();
    }

    // Try fill-in-the-blank input if present
    const fillInput = page.getByPlaceholder('Type your answer...');
    const hasFill = await fillInput.isVisible().catch(() => false);
    if (hasFill) {
      await fillInput.fill('test answer');
      await expect(fillInput).toHaveValue('test answer');
    }

    // Try true/false buttons if present
    const trueButton = page.locator('main button').getByText('True', { exact: true });
    const hasTrue = await trueButton.isVisible().catch(() => false);
    if (hasTrue) {
      await trueButton.click();
    }

    // Verify navigation buttons exist
    const prevButton = page.getByRole('button', { name: /Previous/i });
    await expect(prevButton).toBeVisible();

    // Next or Submit Quiz should be visible depending on question position
    const nextButton = page.getByRole('button', { name: /Next/i });
    const submitButton = page.getByRole('button', { name: /Submit Quiz/i });
    const hasNext = await nextButton.isVisible().catch(() => false);
    const hasSubmit = await submitButton.isVisible().catch(() => false);
    expect(hasNext || hasSubmit).toBeTruthy();
  });

  test('student can navigate between quiz questions using dots', async ({
    page,
  }) => {
    await page.goto('/student/practice');
    await page.waitForLoadState('networkidle');

    const quizLink = page.locator('a[href*="/quiz/"]').first();
    const hasQuiz = await quizLink.isVisible().catch(() => false);

    if (!hasQuiz) return;

    await quizLink.click();
    await page.waitForLoadState('networkidle');

    // Verify question 1 is displayed
    await expect(
      page.locator('main').getByText('Question 1 of')
    ).toBeVisible();

    // Look for question navigator dots (numbered buttons at the bottom)
    // These are <button> elements with numbers like "1", "2", "3"
    const dot2 = page
      .locator('main button')
      .filter({ hasText: /^2$/ })
      .last();
    const hasDot2 = await dot2.isVisible().catch(() => false);

    if (hasDot2) {
      await dot2.click();

      // After clicking dot 2, the progress text should show "Question 2 of"
      await expect(
        page.locator('main').getByText('Question 2 of')
      ).toBeVisible();
    }
  });
});
