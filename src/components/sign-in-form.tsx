"use client";

import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";

export function SignInForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      const result = await authClient.signIn.username({
        username: String(data.get("username")).trim(),
        password: String(data.get("password")),
      });
      if (result.error) {
        setError(result.error.status === 429
          ? "Too many attempts. Try again in a minute."
          : "Incorrect username or password.");
        setPending(false);
        return;
      }
      window.location.replace("/");
    } catch {
      setError("Couldn’t connect. Please try again.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} aria-busy={pending}>
      <label htmlFor="username">Username</label>
      <input id="username" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={30} required />
      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" autoComplete="current-password" maxLength={128} required />
      {error && <p className="error" role="alert">{error}</p>}
      <button type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
