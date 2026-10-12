import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin";
import { invitationLink, invitationMessage } from "@/lib/site";
import { createServiceClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
import CopyButtons from "./components/copy-buttons";
import InvitationControls from "./components/invitation-controls";
import NewInvitationForm from "./components/new-invitation-form";

export const dynamic = "force-dynamic";

type Guest = {
  id: string;
  name: string;
  attending: boolean | null;
  dietary_info: string | null;
  needs_bus: boolean;
  song_request: string | null;
  message: string | null;
};
type InvitationRow = {
  id: string;
  token: string;
  group_name: string;
  email: string | null;
  status: "pending" | "sent" | "responded";
  created_at: string;
  guests: Guest[];
};
type OpenRsvp = { name: string; email: string; guests: string | null; bus: string | null; allergies: string | null; created_at: string };

const FILTERS = [
  { key: "alla", label: "Alla" },
  { key: "ej-skickade", label: "Inte skickade" },
  { key: "ej-svarat", label: "Inte svarat" }
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

const STATUS_LABEL: Record<InvitationRow["status"], string> = { pending: "Ej skickad", sent: "Skickad", responded: "Svarat" };
const STATUS_CLASS: Record<InvitationRow["status"], string> = { pending: "bg-white text-ink/70 border border-ink/20", sent: "bg-lavender text-plum", responded: "bg-sky text-ink" };

function StatCard({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-soft">
      <p className="eyebrow text-plum">{label}</p>
      <p className="mt-2 font-display text-5xl text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink/60">{hint}</p>}
    </div>
  );
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const admin = await getAdmin();
  if (!admin.ok) {
    if (!admin.email) redirect("/admin/login");
    return (
      <main className="mx-auto max-w-md px-6 py-24">
        <h1 className="font-display text-5xl text-ink">Ingen behörighet</h1>
        <p className="mt-5 leading-7 text-ink/70">{admin.email} är inte godkänd som administratör.</p>
        <form action={signOut} className="mt-8"><button type="submit" className="rounded-full border border-plum px-6 py-3 font-semibold text-plum">Logga ut</button></form>
      </main>
    );
  }

  const { filter: rawFilter } = await searchParams;
  const filter: FilterKey = FILTERS.some((item) => item.key === rawFilter) ? (rawFilter as FilterKey) : "alla";

  const { data, error } = await admin.supabase
    .from("invitations")
    .select("id, token, group_name, email, status, created_at, guests(id, name, attending, dietary_info, needs_bus, song_request, message)")
    .order("created_at", { ascending: false });
  if (error) console.error("Load invitations failed:", error);
  const invitations = (data ?? []) as InvitationRow[];

  let openRsvps: OpenRsvp[] = [];
  const service = createServiceClient();
  if (service) {
    const { data: rsvpData, error: rsvpError } = await service
      .from("rsvps")
      .select("name, email, guests, bus, allergies, created_at")
      .order("created_at", { ascending: false });
    if (rsvpError) console.error("Load rsvps failed:", rsvpError);
    openRsvps = (rsvpData ?? []) as OpenRsvp[];
  }

  const guests = invitations.flatMap((invitation) => invitation.guests);
  const yes = guests.filter((guest) => guest.attending === true);
  const no = guests.filter((guest) => guest.attending === false);
  const waiting = guests.filter((guest) => guest.attending === null);
  const bus = yes.filter((guest) => guest.needs_bus).length + openRsvps.filter((rsvp) => rsvp.bus === "Ja").length;
  const invitationEmails = new Set(invitations.map((invitation) => invitation.email).filter(Boolean));
  const duplicates = openRsvps.filter((rsvp) => invitationEmails.has(rsvp.email?.toLowerCase()));

  const visible = invitations.filter((invitation) =>
    filter === "ej-skickade" ? invitation.status === "pending" : filter === "ej-svarat" ? invitation.status !== "responded" : true
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 lg:px-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-plum">Elsa & Joakim · Admin</p>
          <h1 className="mt-3 font-display text-5xl text-ink">Gäster & OSA</h1>
        </div>
        <div className="flex items-center gap-4 text-sm text-ink/70">
          <span>{admin.email}</span>
          <form action={signOut}><button type="submit" className="font-semibold text-plum underline">Logga ut</button></form>
        </div>
      </header>

      {error && <p className="mt-6 rounded-lg bg-white p-4 text-sm font-semibold text-red-800" role="alert">Kunde inte läsa inbjudningarna. Kontrollera att SQL-migreringen är körd och att din e-post finns i is_wedding_admin().</p>}

      <section aria-label="Summering" className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Inbjudna" value={guests.length} hint={`${invitations.length} sällskap`} />
        <StatCard label="Tackat ja" value={yes.length} hint="via inbjudan" />
        <StatCard label="Tackat nej" value={no.length} />
        <StatCard label="Väntar" value={waiting.length} />
        <StatCard label="Öppna formuläret" value={openRsvps.length} hint="anmälda via startsidan" />
        <StatCard label="Buss" value={bus} hint="inbjudan + öppna formuläret" />
      </section>

      <section aria-labelledby="new-title" className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <h2 id="new-title" className="font-display text-4xl text-ink">Nytt sällskap</h2>
          <p className="mt-4 leading-7 text-ink/70">Efter att sällskapet sparats kopierar ni länken eller ett färdigt meddelande och skickar det själva via SMS, Messenger eller liknande. Sällskapet markeras som skickat när ni kopierar.</p>
        </div>
        <NewInvitationForm />
      </section>

      <section aria-labelledby="list-title" className="mt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="list-title" className="font-display text-4xl text-ink">Sällskap</h2>
          <nav aria-label="Filter" className="flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <Link key={item.key} href={item.key === "alla" ? "/admin" : `/admin?filter=${item.key}`} aria-current={filter === item.key ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${filter === item.key ? "bg-plum text-white" : "border border-plum text-plum"}`}>{item.label}</Link>
            ))}
          </nav>
        </div>

        {visible.length === 0 ? (
          <p className="mt-6 rounded-2xl bg-mist p-6 text-ink/70">Inga sällskap att visa.</p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-soft">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-ink/10 bg-mist text-xs uppercase tracking-wider text-ink/70">
                <tr>
                  <th scope="col" className="p-4">Sällskap</th>
                  <th scope="col" className="p-4">Gäster</th>
                  <th scope="col" className="p-4">Status</th>
                  <th scope="col" className="p-4">Inbjudan</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((invitation) => (
                  <tr key={invitation.id} className="border-b border-ink/10 align-top last:border-0">
                    <td className="p-4">
                      <p className="font-semibold text-ink">{invitation.group_name}</p>
                      <p className="mt-1 text-ink/60">{invitation.email ?? <em>Ingen e-post</em>}</p>
                    </td>
                    <td className="p-4">
                      <ul className="space-y-2">
                        {invitation.guests.map((guest) => (
                          <li key={guest.id}>
                            <span className="font-semibold">{guest.name}</span>{" "}
                            <span className={guest.attending === true ? "text-plum" : guest.attending === false ? "text-red-800" : "text-ink/50"}>
                              {guest.attending === true ? "Ja" : guest.attending === false ? "Nej" : "Väntar"}
                            </span>
                            {guest.attending === true && <span className="text-ink/70"> · Buss: {guest.needs_bus ? "Ja" : "Nej"}</span>}
                            {guest.dietary_info && <span className="block text-ink/70">Kost: {guest.dietary_info}</span>}
                            {guest.song_request && <span className="block text-ink/70">Låt: {guest.song_request}</span>}
                            {guest.message && <span className="block italic text-ink/70">”{guest.message}”</span>}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-4"><span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CLASS[invitation.status]}`}>{STATUS_LABEL[invitation.status]}</span></td>
                    <td className="space-y-3 p-4">
                      <CopyButtons id={invitation.id} status={invitation.status} link={invitationLink(invitation.token)} message={invitationMessage(invitation.group_name, invitation.token)} />
                      <InvitationControls id={invitation.id} groupName={invitation.group_name} status={invitation.status} email={invitation.email} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="open-title" className="mt-16">
        <h2 id="open-title" className="font-display text-4xl text-ink">Anmälda via öppna formuläret</h2>
        {duplicates.length > 0 && (
          <p className="mt-4 rounded-lg bg-lavender p-4 text-sm text-ink" role="status">
            <strong>Möjliga dubbletter:</strong> {duplicates.map((rsvp) => `${rsvp.name} (${rsvp.email})`).join(", ")} har samma e-post som en inbjudan.
          </p>
        )}
        {openRsvps.length === 0 ? (
          <p className="mt-6 rounded-2xl bg-mist p-6 text-ink/70">{service ? "Inga anmälningar via öppna formuläret." : "SUPABASE_SERVICE_ROLE_KEY saknas – kan inte läsa öppna anmälningar."}</p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-soft">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-ink/10 bg-mist text-xs uppercase tracking-wider text-ink/70">
                <tr><th scope="col" className="p-4">Namn</th><th scope="col" className="p-4">E-post</th><th scope="col" className="p-4">Buss</th><th scope="col" className="p-4">Kost</th><th scope="col" className="p-4">Anmäld</th></tr>
              </thead>
              <tbody>
                {openRsvps.map((rsvp, index) => (
                  <tr key={`${rsvp.email}-${index}`} className="border-b border-ink/10 align-top last:border-0">
                    <td className="p-4"><span className="font-semibold">{rsvp.name}</span>{rsvp.guests && <span className="block text-ink/60">{rsvp.guests}</span>}</td>
                    <td className="p-4">{rsvp.email}</td>
                    <td className="p-4">{rsvp.bus ?? "–"}</td>
                    <td className="p-4">{rsvp.allergies ?? "–"}</td>
                    <td className="whitespace-nowrap p-4">{new Date(rsvp.created_at).toLocaleDateString("sv-SE")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
