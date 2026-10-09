import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignInForm } from "@/components/sign-in-form";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function SignIn() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/");

  return (
    <section className="card">
      <p className="eyebrow">WELCOME BACK</p>
      <h1>Sign in.</h1>
      <p className="description">Your next step starts here.</p>
      <SignInForm />
    </section>
  );
}
