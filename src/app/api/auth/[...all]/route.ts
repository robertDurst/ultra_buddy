import { clearSession, createSession, getAuthConfig, getSession, validCredentials } from "@/lib/auth";

export const runtime = "nodejs";

// Expose only the three operations this app needs. No public provisioning route.
const allowed = new Map([
  ["/api/auth/sign-in/username", "POST"],
  ["/api/auth/sign-out", "POST"],
  ["/api/auth/get-session", "GET"],
]);

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

async function handler(request: Request) {
  const path = new URL(request.url).pathname.replace(/\/$/, "");
  if (allowed.get(path) !== request.method) {
    return json({ message: "Not found" }, 404);
  }
  try {
    const config = getAuthConfig();
    if (request.method === "GET") return json(await getSession());
    if (request.headers.get("origin") !== config.origin) {
      return json({ message: "Invalid origin" }, 403);
    }
    if (path === "/api/auth/sign-out") {
      await clearSession();
      return json({ success: true });
    }
    if (!request.headers.get("content-type")?.includes("application/json")) {
      return json({ message: "Expected JSON" }, 415);
    }
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || !("username" in body) || !("password" in body)
      || typeof body.username !== "string" || typeof body.password !== "string"
      || body.username.length > 30 || body.password.length > 128) {
      return json({ message: "Invalid credentials" }, 400);
    }
    if (!validCredentials(body.username, body.password)) {
      return json({ message: "Incorrect username or password" }, 401);
    }
    await createSession();
    return json({ success: true });
  } catch {
    return json({ message: "Sign-in is temporarily unavailable. Check the server configuration." }, 503);
  }
}

export { handler as GET, handler as POST };
