import { randomBytes } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";
import nextEnv from "@next/env";
import { betterAuth } from "better-auth";
import { getMigrations } from "better-auth/db/migration";

if (!existsSync(".env.local") && process.env.ULTRA_BUDDY_EPHEMERAL_SETUP !== "1") {
  const settings = {
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? randomBytes(32).toString("hex"),
    DATABASE_PATH: process.env.DATABASE_PATH ?? "./data/ultra-buddy.sqlite",
    SEED_USERNAME: process.env.SEED_USERNAME ?? "rob",
    SEED_NAME: process.env.SEED_NAME ?? "Rob",
    SEED_PASSWORD: process.env.SEED_PASSWORD ?? randomBytes(18).toString("base64url"),
  };
  writeFileSync(".env.local", Object.entries(settings).map(([key, value]) => `${key}=${JSON.stringify(value)}`).join("\n") + "\n", { mode: 0o600, flag: "wx" });
}

nextEnv.loadEnvConfig(process.cwd());
const { authOptions } = await import("../src/lib/auth-options");
const { db } = await import("../src/lib/db");

await (await getMigrations(authOptions)).runMigrations();
const existing = db.prepare('SELECT id FROM "user" LIMIT 1').get();
if (existing) {
  console.log("Database ready. Existing account preserved.");
} else {
  const password = process.env.SEED_PASSWORD;
  if (!password || password.length < 12) throw new Error("Set SEED_PASSWORD to at least 12 characters in .env.local.");
  // This provisioning instance exists only in this local command, never in an HTTP route.
  const provisioner = betterAuth({
    ...authOptions,
    emailAndPassword: { ...authOptions.emailAndPassword, enabled: true, disableSignUp: false, autoSignIn: false },
    disabledPaths: [],
  });
  await provisioner.api.signUpEmail({ body: {
    email: "owner@ultra-buddy.invalid",
    name: process.env.SEED_NAME ?? "Rob",
    username: process.env.SEED_USERNAME ?? "rob",
    password,
  } });
  console.log(`Account created. Username: ${process.env.SEED_USERNAME ?? "rob"}`);
  console.log("Your password is saved as SEED_PASSWORD in .env.local.");
}
db.close();
