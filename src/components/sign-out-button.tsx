"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function signOut() {
    setPending(true);
    setError("");
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("Sign out failed");
      window.location.replace("/sign-in");
    } catch {
      setError("Couldn’t sign out. Please try again.");
      setPending(false);
    }
  }
  return <>
    <button className="secondary" onClick={signOut} disabled={pending}>{pending ? "Signing out…" : "Sign out"}</button>
    {error && <p className="error" role="alert">{error}</p>}
  </>;
}
