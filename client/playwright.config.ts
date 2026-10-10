import { defineConfig, devices } from '@playwright/test';

const playwrightPort = process.env.PLAYWRIGHT_PORT || '4000';
const appUrl = `http://127.0.0.1:${playwrightPort}`;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: appUrl,
    screenshot: 'only-on-failure',
    timezoneId: 'UTC',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  webServer: {
    command: process.env.PLAYWRIGHT_SKIP_BUILD
      ? `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3999 pnpm exec next start -p ${playwrightPort}`
      : `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3999 pnpm build && pnpm exec next start -p ${playwrightPort}`,
    url: `${appUrl}/events`,
    reuseExistingServer: !process.env.CI && process.env.PLAYWRIGHT_REUSE_SERVER === '1',
    timeout: 180_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
