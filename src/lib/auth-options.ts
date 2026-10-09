import type { BetterAuthOptions } from "better-auth";
import { username } from "better-auth/plugins/username";
import { db } from "./db";

if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32) {
  throw new Error("Set BETTER_AUTH_SECRET (at least 32 characters), or run npm run setup.");
}

export const authOptions = {
  appName: "Ultra Buddy",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  database: db,
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    autoSignIn: false,
  },
  disabledPaths: ["/sign-up/email", "/is-username-available"],
  session: { expiresIn: 60 * 60 * 24 * 7 },
  rateLimit: {
    enabled: true,
    storage: "database",
    customRules: { "/sign-in/username": { window: 60, max: 5 } },
  },
  plugins: [username()],
} satisfies BetterAuthOptions;
