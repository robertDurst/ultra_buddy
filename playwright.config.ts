import { defineConfig } from "@playwright/test";
import { randomBytes } from "node:crypto";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// The test server has its own account and database; it never changes your account.
process.env.ULTRA_TEST_DIR ??= mkdtempSync(join(tmpdir(), "ultra-buddy-e2e-"));
process.env.ULTRA_TEST_PASSWORD ??= randomBytes(18).toString("base64url");

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://localhost:3100",
    launchOptions: { executablePath: process.env.CHROMIUM_PATH || undefined },
  },
  webServer: {
    command: "npm run setup && npm run start -- --port 3100",
    url: "http://localhost:3100/sign-in",
    reuseExistingServer: false,
    env: {
      BETTER_AUTH_URL: "http://localhost:3100",
      BETTER_AUTH_SECRET: randomBytes(32).toString("hex"),
      DATABASE_PATH: join(process.env.ULTRA_TEST_DIR, "test.sqlite"),
      SEED_USERNAME: "runner",
      SEED_NAME: "Runner",
      SEED_PASSWORD: process.env.ULTRA_TEST_PASSWORD,
      ULTRA_BUDDY_EPHEMERAL_SETUP: "1",
    },
  },
});
