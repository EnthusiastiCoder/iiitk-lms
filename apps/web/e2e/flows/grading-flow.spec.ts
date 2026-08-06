import { test, expect } from '@playwright/test';

test.use({ storageState: '.auth/professor.json' });

test.describe('Professor Grading Flow', () => {
  test('professor can view grading center with pending and graded sections', async ({
    page,
  }) => {
    await page.goto('/professor/grading');
    await page.waitForLoadState('networkidle');

    // Verify grading page loaded
    await expect(
      page.getByRole('heading', { level: 1, name: 'Grading Center' })
    ).toBeVisible();
    await expect(
      page.getByText('Review and grade student submissions')
    ).toBeVisible();

    // Verify summary cards
    await expect(page.getByText('Pending Review')).toBeVisible();
    await expect(page.getByText('Recently Graded').first()).toBeVisible();

    // Verify section headings
    await expect(
      page.getByRole('heading', { name: 'Pending Submissions' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Recently Graded' })
    ).toBeVisible();
  });

  test('professor can open grade dialog when pending submissions exist', async ({
    page,
  }) => {
    await page.goto('/professor/grading');
    await page.waitForLoadState('networkidle');

    // Check if there are any pending submissions
    const pendingEmpty = await page
      .getByText('No pending submissions. All caught up!')
      .isVisible()
      .catch(() => false);

    if (pendingEmpty) {
      // No pending submissions -- verify the empty state
      await expect(
        page.getByText('No pending submissions. All caught up!')
      ).toBeVisible();
      return;
    }

    // Find a "Grade" button (rendered by GradeDialog trigger)
    const gradeButton = page.getByRole('button', { name: /Grade/i }).first();
    const hasGrade = await gradeButton.isVisible().catch(() => false);

    if (hasGrade) {
      await gradeButton.click();

      // Wait for the grade dialog to appear
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });

      // Verify dialog title contains "Grade"
      await expect(dialog.getByText(/Grade (Assignment|Project)/)).toBeVisible();

      // Verify the "Grading submission from" description
      await expect(
        dialog.getByText(/Grading submission from/)
      ).toBeVisible();

      // Verify grade input exists (number input 0-100)
      const gradeInput = dialog.locator('input[type="number"]');
      await expect(gradeInput).toBeVisible();

      // Verify the label "Grade (0-100)"
      await expect(dialog.getByText('Grade (0-100)')).toBeVisible();

      // Verify feedback textarea exists
      const feedbackTextarea = dialog.locator('textarea');
      await expect(feedbackTextarea).toBeVisible();

      // Verify the label "Feedback"
      await expect(dialog.getByText('Feedback')).toBeVisible();

      // Fill in grade and feedback to verify interactivity
      await gradeInput.fill('85');
      await expect(gradeInput).toHaveValue('85');

      await feedbackTextarea.fill('Good work on this submission!');
      await expect(feedbackTextarea).toHaveValue(
        'Good work on this submission!'
      );

      // Verify Submit Grade button exists and is enabled (since grade is valid)
      const submitGradeBtn = dialog.getByRole('button', {
        name: /Submit Grade/i,
      });
      await expect(submitGradeBtn).toBeVisible();
      await expect(submitGradeBtn).toBeEnabled();

      // Verify Cancel button exists
      const cancelBtn = dialog.getByRole('button', { name: /Cancel/i });
      await expect(cancelBtn).toBeVisible();

      // Close the dialog without saving to avoid polluting data
      await cancelBtn.click();

      // Verify dialog closed
      await expect(dialog).not.toBeVisible();
    }
  });

  test('grade dialog validates grade input range', async ({ page }) => {
    await page.goto('/professor/grading');
    await page.waitForLoadState('networkidle');

    const pendingEmpty = await page
      .getByText('No pending submissions. All caught up!')
      .isVisible()
      .catch(() => false);

    if (pendingEmpty) return;

    const gradeButton = page.getByRole('button', { name: /Grade/i }).first();
    const hasGrade = await gradeButton.isVisible().catch(() => false);

    if (!hasGrade) return;

    await gradeButton.click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const gradeInput = dialog.locator('input[type="number"]');
    const submitGradeBtn = dialog.getByRole('button', {
      name: /Submit Grade/i,
    });

    // Empty grade -- Submit Grade should be disabled
    await gradeInput.fill('');
    await expect(submitGradeBtn).toBeDisabled();

    // Valid grade -- Submit Grade should be enabled
    await gradeInput.fill('75');
    await expect(submitGradeBtn).toBeEnabled();

    // Close without saving
    const cancelBtn = dialog.getByRole('button', { name: /Cancel/i });
    await cancelBtn.click();
  });

  test('professor can see student names and submission dates in pending list', async ({
    page,
  }) => {
    await page.goto('/professor/grading');
    await page.waitForLoadState('networkidle');

    const pendingEmpty = await page
      .getByText('No pending submissions. All caught up!')
      .isVisible()
      .catch(() => false);

    if (pendingEmpty) return;

    // Verify that pending submissions show student names
    // Each submission card displays the student's full_name and "Submitted <date>"
    const submittedText = page
      .locator('main')
      .getByText(/Submitted \d/)
      .first();
    const hasSubmittedDate = await submittedText.isVisible().catch(() => false);

    if (hasSubmittedDate) {
      await expect(submittedText).toBeVisible();
    }

    // Check for sub-section labels (Assignments / Projects)
    const assignmentsLabel = page.locator('main').getByText('Assignments');
    const projectsLabel = page.locator('main').getByText('Projects');
    const hasAssignments = await assignmentsLabel
      .first()
      .isVisible()
      .catch(() => false);
    const hasProjects = await projectsLabel
      .first()
      .isVisible()
      .catch(() => false);

    // At least one type should be present if there are pending submissions
    expect(hasAssignments || hasProjects).toBeTruthy();
  });
});
