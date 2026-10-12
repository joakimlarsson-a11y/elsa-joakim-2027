"use server";

import { headers } from "next/headers";
import { isAdminEmail } from "@/lib/admin";
import { clean, isEmail, SITE_URL } from "@/lib/site";
import { createSessionClient } from "@/lib/supabase/server";

export type LoginResult = { ok: true } | { ok: false; error: string };

export async function sendMagicLink(rawEmail: unknown): Promise<LoginResult> {
  const email = clean(rawEmail, 200).toLowerCase();
  if (!isEmail(email)) return { ok: false, error: "Ange en giltig e-postadress." };

  // Samma svar oavsett om adressen är godkänd, så att admin-adresserna inte kan gissas fram.
  if (!isAdminEmail(email)) return { ok: true };

  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
    const origin = host ? `${proto}://${host}` : SITE_URL;
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${origin}/auth/callback` }
    });
    if (error) {
      console.error("signInWithOtp failed:", error);
      return { ok: false, error: "Vi kunde inte skicka inloggningslänken. Försök igen om en stund." };
    }
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Inloggningen är inte konfigurerad." };
  }
  return { ok: true };
}
