import { defineConfig } from "@playwright/test";
import { randomBytes } from "node:crypto";

// The test server gets separate credentials, with no database or setup step.
process.env.ULTRA_TEST_PASSWORD ??= randomBytes(18).toString("base64url");
process.env.ULTRA_TEST_SECRET ??= randomBytes(32).toString("hex");

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://localhost:3100",
    launchOptions: { executablePath: process.env.CHROMIUM_PATH || undefined },
  },
  webServer: {
    command: "npm run start -- --port 3100",
    url: "http://localhost:3100/sign-in",
    reuseExistingServer: false,
    env: {
      BETTER_AUTH_URL: "http://localhost:3100",
      BETTER_AUTH_SECRET: process.env.ULTRA_TEST_SECRET,
      SEED_USERNAME: "runner",
      SEED_NAME: "Runner",
      SEED_PASSWORD: process.env.ULTRA_TEST_PASSWORD,
    },
  },
});
