import { auth } from "@/lib/auth";

export const runtime = "nodejs";

// Expose only the three operations this app needs. No public provisioning route.
const allowed = new Map([
  ["/api/auth/sign-in/username", "POST"],
  ["/api/auth/sign-out", "POST"],
  ["/api/auth/get-session", "GET"],
]);

async function handler(request: Request) {
  const path = new URL(request.url).pathname.replace(/\/$/, "");
  if (allowed.get(path) !== request.method) {
    return Response.json({ message: "Not found" }, { status: 404 });
  }
  const response = await auth.handler(request);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export { handler as GET, handler as POST };
