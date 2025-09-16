import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    // ['html'],
    ['list']
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'off',
  },
  timeout: 10000,
  globalSetup: require.resolve('./playwright.setup.ts'),
  globalTeardown: require.resolve('./playwright.teardown.ts'),
  webServer: [
    {
      command: 'PLAYWRIGHT_TEST=true next dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
    },
  ],
  // The main project for running UI tests.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});