import type { Metadata } from "next";
import Link from "next/link";
import RSVPForm from "../components/rsvp-form";
import { UUID_PATTERN } from "@/lib/site";
import { createAnonClient } from "@/lib/supabase/server";
import InvitationRsvpForm from "./invitation-rsvp-form";
import type { Invitation } from "./types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "OSA | Elsa & Joakim",
  robots: { index: false, follow: false }
};

async function loadInvitation(token: string): Promise<Invitation | null> {
  if (!UUID_PATTERN.test(token)) return null;
  try {
    const { data, error } = await createAnonClient().rpc("get_invitation_by_token", { p_token: token });
    if (error) {
      console.error("get_invitation_by_token failed:", error);
      return null;
    }
    return (data as Invitation | null) ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function OsaPage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const { token: rawToken } = await searchParams;
  const token = typeof rawToken === "string" ? rawToken.trim() : "";
  const invitation = token ? await loadInvitation(token) : null;

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-3xl px-6 py-16 lg:py-24" aria-labelledby="rsvp-title">
        <Link href="/" className="text-sm font-semibold text-plum underline underline-offset-4">← Till startsidan</Link>
        <p className="eyebrow mt-10 text-plum">Svara senast 1 april 2027</p>
        {invitation ? (
          <>
            <h1 id="rsvp-title" className="mt-4 font-display text-5xl text-ink sm:text-6xl">Välkomna, {invitation.group_name}</h1>
            <p className="mt-5 max-w-xl leading-7 text-ink/70">Vi hoppas att ni vill fira med oss den 19 juni 2027. Svara för var och en i sällskapet nedan.</p>
            <div className="mt-10"><InvitationRsvpForm token={token} invitation={invitation} /></div>
          </>
        ) : (
          <>
            <h1 id="rsvp-title" className="mt-4 font-display text-6xl text-ink">OSA här</h1>
            {token && <p className="mt-5 max-w-xl rounded-lg bg-sky px-4 py-3 leading-7 text-ink" role="status">Vi kunde inte läsa inbjudningslänken. Kontrollera att hela länken kom med, eller fyll i formuläret nedan.</p>}
            <p className="mt-5 max-w-xl leading-7 text-ink/70">Fyll i formuläret nedan — en anmälan per sällskap räcker fint.</p>
            <div className="mt-10"><RSVPForm /></div>
          </>
        )}
      </section>
    </main>
  );
}
