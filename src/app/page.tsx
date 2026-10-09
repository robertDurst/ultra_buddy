import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  return (
    <section className="card welcome">
      <p className="eyebrow">ULTRA BUDDY</p>
      <h1>Hello, {session.user.name}.</h1>
      <p className="description">You’re signed in.</p>
      <SignOutButton />
    </section>
  );
}
