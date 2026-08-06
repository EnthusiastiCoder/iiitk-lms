import { test as setup, expect } from '@playwright/test';

setup('authenticate student', async ({ page }) => {
  await page.goto('/auth/login');
  await page.fill('input[name="email"]', process.env.E2E_STUDENT_EMAIL!);
  await page.fill('input[name="password"]', process.env.E2E_STUDENT_PASSWORD!);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/student**', { timeout: 60000 });
  await expect(page).not.toHaveURL(/\/auth\//);
  await page.context().storageState({ path: '.auth/student.json' });
});

setup('authenticate professor', async ({ page }) => {
  await page.goto('/auth/login');
  await page.fill('input[name="email"]', process.env.E2E_PROFESSOR_EMAIL!);
  await page.fill('input[name="password"]', process.env.E2E_PROFESSOR_PASSWORD!);
  await page.click('button[type="submit"]');
  // Professor may redirect to /professor or /student depending on middleware config
  await page.waitForURL(/\/(professor|student)/, { timeout: 15000 });
  await expect(page).not.toHaveURL(/\/auth\//);
  await page.context().storageState({ path: '.auth/professor.json' });
});

setup('authenticate admin', async ({ page }) => {
  await page.goto('/auth/login');
  await page.fill('input[name="email"]', process.env.E2E_ADMIN_EMAIL!);
  await page.fill('input[name="password"]', process.env.E2E_ADMIN_PASSWORD!);
  await page.click('button[type="submit"]');
  // Admin may redirect to /admin or /student depending on middleware config
  await page.waitForURL(/\/(admin|student)/, { timeout: 15000 });
  await expect(page).not.toHaveURL(/\/auth\//);
  await page.context().storageState({ path: '.auth/admin.json' });
});
