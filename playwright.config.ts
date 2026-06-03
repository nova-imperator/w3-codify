import { defineConfig, devices } from "@playwright/test";

/**
 * E2E smoke tests (BUILD_SPEC §14). Point at a running app via
 * PLAYWRIGHT_BASE_URL (defaults to localhost:3000). The runner is responsible
 * for having the app + DB available (locally: `pnpm start` with the RDS tunnel).
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    actionTimeout: 15_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
