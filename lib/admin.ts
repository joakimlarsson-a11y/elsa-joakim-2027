import { redirect } from "next/navigation";
import { createSessionClient } from "./supabase/server";

export function adminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined) {
  return !!email && adminEmails().includes(email.trim().toLowerCase());
}

type AdminResult =
  | { ok: true; email: string; supabase: Awaited<ReturnType<typeof createSessionClient>> }
  | { ok: false; email: string | null };

export async function getAdmin(): Promise<AdminResult> {
  const supabase = await createSessionClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email ?? null;
  if (!email || !isAdminEmail(email)) return { ok: false, email };
  return { ok: true, email, supabase };
}

/** For Server Actions: throws/redirects unless the caller is an approved admin. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin.ok) redirect("/admin/login");
  return admin;
}
