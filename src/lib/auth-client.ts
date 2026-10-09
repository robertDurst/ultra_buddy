"use client";

async function post(path: string, data: object = {}) {
  const response = await fetch(`/api/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(data),
  });
  return { error: response.ok ? null : { status: response.status } };
}

export const authClient = {
  signIn: { username: (credentials: { username: string; password: string }) => post("sign-in/username", credentials) },
  signOut: () => post("sign-out"),
};
