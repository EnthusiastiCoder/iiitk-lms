import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  timeout: 60000,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on',
    screenshot: 'on',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: 'setup/*.ts' },
    { name: 'student-flows', testMatch: 'student/*.spec.ts', dependencies: ['setup'] },
    { name: 'professor-flows', testMatch: 'professor/*.spec.ts', dependencies: ['setup'] },
    { name: 'admin-flows', testMatch: 'admin/*.spec.ts', dependencies: ['setup'] },
    { name: 'journey-flows', testMatch: ['flows/student-journey.spec.ts', 'flows/professor-management.spec.ts', 'flows/admin-operations.spec.ts', 'flows/cross-role.spec.ts'], dependencies: ['setup'] },
    { name: 'interactive-flows', testMatch: 'flows/*-flow.spec.ts', dependencies: ['setup'] },
  ],
  webServer: [
    {
      command: 'npm run dev -w @lms/api',
      port: 4000,
      reuseExistingServer: true,
      cwd: '../..',
    },
    {
      command: 'npm run dev',
      port: 3000,
      reuseExistingServer: true,
    },
  ],
});
