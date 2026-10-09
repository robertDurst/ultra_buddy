import { test, expect } from "@playwright/test";

test("sign-in, persistence, and sign-out protect the greeting", async ({ page, context }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByRole("heading", { name: "Sign in." })).toBeVisible();

  await page.getByLabel("Username").fill("runner");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Incorrect username or password." })).toBeVisible();
  await expect(page).toHaveURL(/\/sign-in$/);

  await page.getByLabel("Password").fill(process.env.ULTRA_TEST_PASSWORD!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Hello, Runner." })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Hello, Runner." })).toBeVisible();
  await page.goto("/sign-in");
  await expect(page).toHaveURL("http://localhost:3100/");

  const sessionCookie = (await context.cookies()).find(cookie => cookie.name.includes("session_token"));
  expect(sessionCookie?.httpOnly).toBe(true);
  expect(sessionCookie?.sameSite).toBe("Lax");

  const crossOrigin = await page.request.post("/api/auth/sign-out", {
    headers: { origin: "https://untrusted.example" }, data: {},
  });
  expect(crossOrigin.status()).toBe(403);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Hello, Runner." })).toBeVisible();

  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/sign-in$/);
  await page.goto("/");
  await expect(page).toHaveURL(/\/sign-in$/);

  // Even replaying the old cookie cannot restore a revoked session.
  await context.addCookies([sessionCookie!]);
  await page.goto("/");
  await expect(page).toHaveURL(/\/sign-in$/);
});

test("signup and unused auth operations are unavailable", async ({ request, page }) => {
  for (const path of ["sign-up/email", "update-user", "sign-in/email", "is-username-available"]) {
    const response = await request.post(`/api/auth/${path}`, {
      headers: { origin: "http://localhost:3100" },
      data: { email: "intruder@example.com", name: "Intruder", username: "intruder", password: "not-a-real-password" },
    });
    expect(response.status()).toBe(404);
  }
  const session = await request.get("/api/auth/get-session");
  expect(await session.json()).toBeNull();
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/sign-in");
  await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/sign-in-mobile.png" });
});
