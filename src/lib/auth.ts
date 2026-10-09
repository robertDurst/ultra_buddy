import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const SESSION_SECONDS = 60 * 60 * 8;

export function getAuthConfig() {
  // Keep the original environment names so existing deployments can reuse them.
  const secret = process.env.BETTER_AUTH_SECRET;
  const password = process.env.SEED_PASSWORD;
  const username = (process.env.SEED_USERNAME ?? "rob").trim().toLowerCase();
  if (!secret || secret.length < 32 || !password || password.length < 12 || password.length > 128 || !username || username.length > 30) {
    throw new Error("Configure BETTER_AUTH_SECRET (32+ characters), SEED_PASSWORD (12–128 characters), and SEED_USERNAME (1–30 characters).");
  }
  if (process.env.VERCEL && !process.env.BETTER_AUTH_URL) {
    throw new Error("Configure BETTER_AUTH_URL for this deployment.");
  }
  const origin = new URL(process.env.BETTER_AUTH_URL ?? "http://localhost:3000").origin;
  const secure = origin.startsWith("https://");
  if (process.env.VERCEL && !secure) throw new Error("BETTER_AUTH_URL must use HTTPS on Vercel.");
  return {
    username,
    password,
    name: process.env.SEED_NAME ?? username,
    origin,
    // Changing either the password or signing secret invalidates existing cookies.
    key: createHmac("sha256", secret).update(JSON.stringify(["ultra-buddy-session-v1", username, password])).digest(),
    cookieName: secure ? "__Host-ultra-buddy.session_token" : "ultra-buddy.session_token",
    cookieOptions: { httpOnly: true, secure, sameSite: "lax" as const, path: "/" },
  };
}

function equalSecret(input: string, expected: string) {
  return timingSafeEqual(createHash("sha256").update(input).digest(), createHash("sha256").update(expected).digest());
}

export function validCredentials(username: string, password: string) {
  const config = getAuthConfig();
  const userMatches = equalSecret(username.trim().toLowerCase(), config.username);
  const passwordMatches = equalSecret(password, config.password);
  return userMatches && passwordMatches;
}

export async function createSession() {
  const config = getAuthConfig();
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(config.username)
    .setIssuer(config.origin)
    .setAudience("ultra-buddy")
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .sign(config.key);
  (await cookies()).set(config.cookieName, token, { ...config.cookieOptions, maxAge: SESSION_SECONDS });
}

export async function getSession() {
  const config = getAuthConfig();
  const token = (await cookies()).get(config.cookieName)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, config.key, {
      algorithms: ["HS256"], issuer: config.origin, audience: "ultra-buddy",
      requiredClaims: ["exp", "iat", "sub"], maxTokenAge: `${SESSION_SECONDS}s`,
    });
    if (payload.sub !== config.username) return null;
    return { user: { id: config.username, name: config.name } };
  } catch {
    return null;
  }
}

export async function clearSession() {
  const config = getAuthConfig();
  (await cookies()).set(config.cookieName, "", { ...config.cookieOptions, maxAge: 0 });
}
