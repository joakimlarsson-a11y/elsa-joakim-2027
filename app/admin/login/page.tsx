import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin";
import LoginForm from "./login-form";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  let alreadyAdmin = false;
  try {
    alreadyAdmin = (await getAdmin()).ok;
  } catch {
    // Supabase is not configured; show the form with its own error handling.
  }
  if (alreadyAdmin) redirect("/admin");

  return (
    <main className="mx-auto max-w-md px-6 py-24">
      <p className="eyebrow text-sea">Elsa & Joakim</p>
      <h1 className="mt-4 font-display text-5xl text-ink">Admin</h1>
      <p className="mt-5 leading-7 text-ink/70">Logga in med en länk som skickas till din e-post.</p>
      {error && <p className="mt-5 text-sm font-semibold text-red-800" role="alert">Inloggningslänken var ogiltig eller har gått ut. Begär en ny.</p>}
      <div className="mt-8"><LoginForm /></div>
    </main>
  );
}
