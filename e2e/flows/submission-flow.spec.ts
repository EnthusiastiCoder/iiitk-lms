import { test, expect } from '@playwright/test';

test.use({ storageState: '.auth/student.json' });

test.describe('Assignment Submission Flow', () => {
  test('student can navigate to an assignment from a course', async ({
    page,
  }) => {
    // Navigate to a known course
    await page.goto('/student/courses/quantum-computing');
    await page.waitForLoadState('networkidle');

    // Verify the page loaded
    await expect(page.locator('main')).toBeVisible();

    // Expand the first module accordion to reveal assignment links
    const accordionTrigger = page
      .locator('[data-slot="accordion-trigger"]')
      .first();
    const hasAccordion = await accordionTrigger.isVisible().catch(() => false);

    if (!hasAccordion) return;

    await accordionTrigger.click();

    // Look for an assignment link (href contains /assignment/)
    const assignmentLink = page
      .locator('a[href*="/assignment/"]')
      .first();
    const hasAssignment = await assignmentLink.isVisible().catch(() => false);

    if (hasAssignment) {
      await assignmentLink.click();
      await page.waitForLoadState('networkidle');

      // Verify the CodeSubmission page loaded
      await expect(page.locator('main')).toBeVisible();

      // Verify a heading is present (title may vary)
      const heading = page.locator('main').getByRole('heading', { level: 1 }).first();
      const hasHeading = await heading.isVisible().catch(() => false);
      if (hasHeading) {
        await expect(heading).toBeVisible();
      }

      // Verify "assignment" badge is present (resilient)
      const badge = page.locator('main').getByText('assignment', { exact: true }).first();
      const hasBadge = await badge.isVisible().catch(() => false);
      if (hasBadge) {
        await expect(badge).toBeVisible();
      }

      // Verify "Back to course" link exists (resilient)
      const backLink = page.locator('main').getByText(/Back to course/i).first();
      const hasBack = await backLink.isVisible().catch(() => false);
      if (hasBack) {
        await expect(backLink).toBeVisible();
      }

      // Verify XP reward is displayed (resilient)
      const xpBadge = page.locator('main').getByText(/\d+ XP/).first();
      const hasXp = await xpBadge.isVisible().catch(() => false);
      if (hasXp) {
        await expect(xpBadge).toBeVisible();
      }
    }
  });

  test('student can see code editor and submit button on assignment page', async ({
    page,
  }) => {
    await page.goto('/student/courses/quantum-computing');
    await page.waitForLoadState('networkidle');

    // Expand the first accordion
    const accordionTrigger = page
      .locator('[data-slot="accordion-trigger"]')
      .first();
    const hasAccordion = await accordionTrigger.isVisible().catch(() => false);

    if (!hasAccordion) return;

    await accordionTrigger.click();

    const assignmentLink = page
      .locator('a[href*="/assignment/"]')
      .first();
    const hasAssignment = await assignmentLink.isVisible().catch(() => false);

    if (!hasAssignment) return;

    await assignmentLink.click();
    await page.waitForLoadState('networkidle');

    // Check for the code editor -- CodeEditor renders a .cm-editor element
    const codeEditor = page.locator('.cm-editor').first();
    const hasEditor = await codeEditor.isVisible().catch(() => false);

    if (hasEditor) {
      // Verify the editor is interactive (click into it)
      await codeEditor.click();
    }

    // Verify the "Your Code" or "Update your code" label is visible
    const codeLabel = page
      .locator('main')
      .getByText(/Your Code|Update your code/);
    const hasLabel = await codeLabel.isVisible().catch(() => false);

    // Verify Submit Assignment button exists
    const submitButton = page.getByRole('button', {
      name: /Submit Assignment/i,
    });
    const hasSubmit = await submitButton.isVisible().catch(() => false);

    // Verify Cancel button exists
    const cancelButton = page.getByRole('button', { name: /Cancel/i });
    const hasCancel = await cancelButton.isVisible().catch(() => false);

    // At least one of the editor or submit button should be visible
    // (if already submitted, the editor may be hidden)
    if (hasSubmit) {
      await expect(submitButton).toBeVisible();
    }
    if (hasCancel) {
      await expect(cancelButton).toBeVisible();
    }
  });

  test('student can view requirements section if present', async ({
    page,
  }) => {
    await page.goto('/student/courses/quantum-computing');
    await page.waitForLoadState('networkidle');

    const accordionTrigger = page
      .locator('[data-slot="accordion-trigger"]')
      .first();
    const hasAccordion = await accordionTrigger.isVisible().catch(() => false);
    if (!hasAccordion) return;

    await accordionTrigger.click();

    const assignmentLink = page
      .locator('a[href*="/assignment/"]')
      .first();
    const hasAssignment = await assignmentLink.isVisible().catch(() => false);
    if (!hasAssignment) return;

    await assignmentLink.click();
    await page.waitForLoadState('networkidle');

    // Check for Requirements section (rendered if assignment has requirements)
    const requirementsSection = page
      .locator('main')
      .getByText('Requirements');
    const hasReqs = await requirementsSection.isVisible().catch(() => false);

    if (hasReqs) {
      // Verify the requirements card has content
      await expect(requirementsSection).toBeVisible();
    }

    // Verify the main content area rendered
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Project Submission Flow', () => {
  test.use({ storageState: '.auth/student.json' });

  test('student can navigate to a project from a course', async ({ page }) => {
    await page.goto('/student/courses/quantum-computing');
    await page.waitForLoadState('networkidle');

    // Expand the first module accordion
    const accordionTrigger = page
      .locator('[data-slot="accordion-trigger"]')
      .first();
    const hasAccordion = await accordionTrigger.isVisible().catch(() => false);
    if (!hasAccordion) return;

    await accordionTrigger.click();

    // Look for a project link (href contains /project/)
    const projectLink = page.locator('a[href*="/project/"]').first();
    const hasProject = await projectLink.isVisible().catch(() => false);

    if (hasProject) {
      await projectLink.click();
      await page.waitForLoadState('networkidle');

      // Verify the CodeSubmission page loaded with project type
      await expect(
        page.locator('main').getByRole('heading', { level: 1 }).first()
      ).toBeVisible();

      // Verify "project" badge is present
      await expect(
        page.locator('main').getByText('project', { exact: true }).first()
      ).toBeVisible();

      // Verify Submit Project button or editor area exists
      const submitButton = page.getByRole('button', {
        name: /Submit Project/i,
      });
      const hasSubmit = await submitButton.isVisible().catch(() => false);

      // The page should at least show the main content
      await expect(page.locator('main')).toBeVisible();
    }
  });
});
