import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  // One worker: the specs share one seeded customer and product stock, so running the desktop and
  // mobile projects concurrently merges their carts (observed: a single qty-2 order).
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 7"] } },
  ],
  // This project's own dev server — assumes the backend (BACKEND_CONTRACT.md) is already
  // running separately, since these are integration-style E2E tests against real data, not
  // mocked. See NOTES.md Section 17 for what could and couldn't be run this session.
  // Only start the local dev server when no external target is given (E2E_BASE_URL points at an
  // already-running sandbox build — see NOTES.md "Running E2E safely").
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 60_000,
      },
});
