import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load .env so specs and readers can use process.env (see util/dbReader.ts).
dotenv.config();

export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["line"], ["allure-playwright"], ["./utils/CustomReporter.ts"]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    /* Media for the custom report. 'on' captures for every test, pass or fail.
       For a real suite prefer 'only-on-failure' / 'retain-on-failure'. */
    screenshot: 'on',
    video: 'on',
    trace: 'on',
    headless: false,
    /* Full HD. The project below re-applies it after the device spread, because
       devices['Desktop Chrome'] carries its own 1280x720 viewport and
       project-level `use` wins over this config-level `use`. */
    viewport: { width: 1920, height: 1080 },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    }]

});
