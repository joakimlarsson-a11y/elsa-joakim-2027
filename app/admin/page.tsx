import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin";
import { requestOrigin } from "@/lib/origin";
import { invitationLink, invitationMessage } from "@/lib/site";
import { createServiceClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
import CopyButtons from "./components/copy-buttons";
import DeleteGuestButton from "./components/delete-guest-button";
import InvitationControls from "./components/invitation-controls";
import NewInvitationForm from "./components/new-invitation-form";

export const dynamic = "force-dynamic";

type Guest = {
  id: string;
  name: string;
  attending: boolean | null;
  dietary_info: string | null;
  needs_bus: boolean;
  message: string | null;
};
type InvitationRow = {
  id: string;
  token: string;
  group_name: string;
  email: string | null;
  personal_note: string | null;
  status: "pending" | "sent" | "responded";
  created_at: string;
  guests: Guest[];
};
type OpenRsvp = { id: string | number; name: string; email: string; guests: string | null; attendance: string | null; bus: string | null; allergies: string | null; created_at: string };

type GuestRow = {
  key: string;
  source: "invitation" | "open";
  id: string;
  name: string;
  origin: string;
  detail: string | null;
  attending: boolean | null;
  bus: boolean | null;
  dietary: string | null;
  message: string | null;
};

const FILTERS = [
  { key: "alla", label: "Alla" },
  { key: "ej-skickade", label: "Inte skickade" },
  { key: "ej-svarat", label: "Inte svarat" }
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

const GUEST_FILTERS = [
  { key: "alla", label: "Alla" },
  { key: "kommer", label: "Kommer" },
  { key: "allergier", label: "Allergier & specialkost" }
] as const;
type GuestFilterKey = (typeof GUEST_FILTERS)[number]["key"];

function adminHref(filter: FilterKey, guestFilter: GuestFilterKey, hash: string) {
  const params = new URLSearchParams();
  if (filter !== "alla") params.set("filter", filter);
  if (guestFilter !== "alla") params.set("gaster", guestFilter);
  const query = params.toString();
  return `/admin${query ? `?${query}` : ""}#${hash}`;
}

function AnswerLabel({ attending }: { attending: boolean | null }) {
  return (
    <span className={attending === true ? "text-sea" : attending === false ? "text-red-800" : "text-ink/60"}>
      {attending === true ? "Ja" : attending === false ? "Nej" : "Väntar"}
    </span>
  );
}

const pillClass = (active: boolean) => `rounded-full px-4 py-2 text-sm font-semibold ${active ? "bg-sea text-white" : "border border-sea text-sea"}`;

const STATUS_LABEL: Record<InvitationRow["status"], string> = { pending: "Ej skickad", sent: "Skickad", responded: "Svarat" };
const STATUS_CLASS: Record<InvitationRow["status"], string> = { pending: "bg-white text-ink/70 border border-ink/20", sent: "bg-dusk text-sea", responded: "bg-foam text-ink" };

function StatCard({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-soft">
      <p className="eyebrow text-sea">{label}</p>
      <p className="mt-2 font-display text-5xl text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink/60">{hint}</p>}
    </div>
  );
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ filter?: string; gaster?: string }> }) {
  const admin = await getAdmin();
  if (!admin.ok) {
    if (!admin.email) redirect("/admin/login");
    return (
      <main className="mx-auto max-w-md px-6 py-24">
        <h1 className="font-display text-5xl text-ink">Ingen behörighet</h1>
        <p className="mt-5 leading-7 text-ink/70">{admin.email} är inte godkänd som administratör.</p>
        <form action={signOut} className="mt-8"><button type="submit" className="rounded-full border border-sea px-6 py-3 font-semibold text-sea">Logga ut</button></form>
      </main>
    );
  }

  const { filter: rawFilter, gaster: rawGuestFilter } = await searchParams;
  const filter: FilterKey = FILTERS.some((item) => item.key === rawFilter) ? (rawFilter as FilterKey) : "alla";
  const guestFilter: GuestFilterKey = GUEST_FILTERS.some((item) => item.key === rawGuestFilter) ? (rawGuestFilter as GuestFilterKey) : "alla";
  const origin = await requestOrigin();

  const { data, error } = await admin.supabase
    .from("invitations")
    .select("id, token, group_name, email, personal_note, status, created_at, guests(id, name, attending, dietary_info, needs_bus, message)")
    .order("created_at", { ascending: false });
  if (error) console.error("Load invitations failed:", error);
  const invitations = (data ?? []) as InvitationRow[];

  let openRsvps: OpenRsvp[] = [];
  const service = createServiceClient();
  if (service) {
    const { data: rsvpData, error: rsvpError } = await service
      .from("rsvps")
      .select("id, name, email, guests, attendance, bus, allergies, created_at")
      .order("created_at", { ascending: false });
    if (rsvpError) console.error("Load rsvps failed:", rsvpError);
    openRsvps = (rsvpData ?? []) as OpenRsvp[];
  }

  const invitedCount = invitations.reduce((sum, invitation) => sum + invitation.guests.length, 0);
  const guestRows: GuestRow[] = [
    ...invitations.flatMap((invitation) =>
      invitation.guests.map((guest): GuestRow => ({
        key: `invitation-${guest.id}`,
        source: "invitation",
        id: guest.id,
        name: guest.name,
        origin: invitation.group_name,
        detail: "Inbjudan",
        attending: guest.attending,
        bus: guest.attending === true ? guest.needs_bus : null,
        dietary: guest.attending === true ? guest.dietary_info : null,
        message: guest.message
      }))
    ),
    ...openRsvps.map((rsvp): GuestRow => ({
      key: `open-${rsvp.id}`,
      source: "open",
      id: String(rsvp.id),
      name: rsvp.name,
      origin: "Öppna formuläret",
      detail: [rsvp.email, rsvp.guests].filter(Boolean).join(" · ") || null,
      attending: rsvp.attendance ? rsvp.attendance === "Kommer" : true,
      bus: rsvp.bus === "Ja" ? true : rsvp.bus === "Nej" ? false : null,
      dietary: rsvp.allergies,
      message: null
    }))
  ].sort((a, b) => a.name.localeCompare(b.name, "sv"));

  const yes = guestRows.filter((guest) => guest.attending === true);
  const no = guestRows.filter((guest) => guest.attending === false);
  const waiting = guestRows.filter((guest) => guest.attending === null);
  const bus = yes.filter((guest) => guest.bus === true).length;
  const withDietary = yes.filter((guest) => guest.dietary);
  const invitationEmails = new Set(invitations.map((invitation) => invitation.email).filter(Boolean));
  const duplicates = openRsvps.filter((rsvp) => invitationEmails.has(rsvp.email?.toLowerCase()));
  const visibleGuests = guestFilter === "kommer" ? yes : guestFilter === "allergier" ? withDietary : guestRows;

  const visible = invitations.filter((invitation) =>
    filter === "ej-skickade" ? invitation.status === "pending" : filter === "ej-svarat" ? invitation.status !== "responded" : true
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 lg:px-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-sea">Elsa & Joakim · Admin</p>
          <h1 className="mt-3 font-display text-5xl text-ink">Gäster & OSA</h1>
        </div>
        <div className="flex items-center gap-4 text-sm text-ink/70">
          <span>{admin.email}</span>
          <form action={signOut}><button type="submit" className="font-semibold text-sea underline">Logga ut</button></form>
        </div>
      </header>

      {error && <p className="mt-6 rounded-lg bg-white p-4 text-sm font-semibold text-red-800" role="alert">Kunde inte läsa inbjudningarna. Kontrollera att SQL-migreringen är körd och att din e-post finns i is_wedding_admin().</p>}

      <section aria-label="Summering" className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Kommer" value={yes.length} hint={`varav ${openRsvps.length} via öppna formuläret`} />
        <StatCard label="Tackat nej" value={no.length} />
        <StatCard label="Väntar" value={waiting.length} hint={`${invitedCount} inbjudna i ${invitations.length} sällskap`} />
        <StatCard label="Buss" value={bus} />
        <StatCard label="Specialkost" value={withDietary.length} hint="allergier eller specialkost" />
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
              <Link key={item.key} href={adminHref(item.key, guestFilter, "list-title")} aria-current={filter === item.key ? "page" : undefined} className={pillClass(filter === item.key)}>{item.label}</Link>
            ))}
          </nav>
        </div>

        {visible.length === 0 ? (
          <p className="mt-6 rounded-2xl bg-shell p-6 text-ink/70">Inga sällskap att visa.</p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-soft">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-ink/10 bg-shell text-xs uppercase tracking-wider text-ink/70">
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
                      <ul className="space-y-1">
                        {invitation.guests.map((guest) => (
                          <li key={guest.id}><span className="font-semibold">{guest.name}</span> <AnswerLabel attending={guest.attending} /></li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-4"><span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CLASS[invitation.status]}`}>{STATUS_LABEL[invitation.status]}</span></td>
                    <td className="space-y-3 p-4">
                      <CopyButtons id={invitation.id} status={invitation.status} link={invitationLink(origin, invitation.token)} message={invitationMessage(origin, invitation.group_name, invitation.guests.map((guest) => guest.name), invitation.token)} />
                      <InvitationControls id={invitation.id} groupName={invitation.group_name} status={invitation.status} email={invitation.email} personalNote={invitation.personal_note} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="guests-title" className="mt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="guests-title" className="scroll-mt-8 font-display text-4xl text-ink">Gästlista</h2>
            <p className="mt-2 text-sm text-ink/70">Alla gäster från inbjudningar och från öppna formuläret.</p>
          </div>
          <nav aria-label="Filtrera gästlistan" className="flex flex-wrap gap-2">
            {GUEST_FILTERS.map((item) => (
              <Link key={item.key} href={adminHref(filter, item.key, "guests-title")} aria-current={guestFilter === item.key ? "page" : undefined} className={pillClass(guestFilter === item.key)}>{item.label}</Link>
            ))}
          </nav>
        </div>
        {!service && <p className="mt-4 rounded-lg bg-white p-4 text-sm text-ink" role="status">SUPABASE_SERVICE_ROLE_KEY saknas – anmälningar via öppna formuläret visas inte.</p>}
        {duplicates.length > 0 && (
          <p className="mt-4 rounded-lg bg-dusk p-4 text-sm text-ink" role="status">
            <strong>Möjliga dubbletter:</strong> {duplicates.map((rsvp) => `${rsvp.name} (${rsvp.email})`).join(", ")} har samma e-post som en inbjudan.
          </p>
        )}
        {visibleGuests.length === 0 ? (
          <p className="mt-6 rounded-2xl bg-shell p-6 text-ink/70">{guestFilter === "allergier" ? "Ingen som kommer har angett allergier eller specialkost." : "Inga gäster att visa."}</p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-soft">
            <table className="w-full min-w-[800px] text-left text-sm">
              <caption className="sr-only">Gästlista, {visibleGuests.length} personer</caption>
              <thead className="border-b border-ink/10 bg-shell text-xs uppercase tracking-wider text-ink/70">
                <tr>
                  <th scope="col" className="p-4">Namn</th>
                  <th scope="col" className="p-4">Sällskap</th>
                  <th scope="col" className="p-4">Kommer</th>
                  <th scope="col" className="p-4">Buss</th>
                  <th scope="col" className="p-4">Allergier & specialkost</th>
                  <th scope="col" className="p-4"><span className="sr-only">Åtgärder</span></th>
                </tr>
              </thead>
              <tbody>
                {visibleGuests.map((guest) => (
                  <tr key={guest.key} className="border-b border-ink/10 align-top last:border-0">
                    <th scope="row" className="p-4 font-semibold">
                      {guest.name}
                      {guest.message && <span className="mt-1 block font-normal italic text-ink/70">”{guest.message}”</span>}
                    </th>
                    <td className="p-4">{guest.origin}{guest.detail && <span className="block text-ink/60">{guest.detail}</span>}</td>
                    <td className="p-4"><AnswerLabel attending={guest.attending} /></td>
                    <td className="p-4">{guest.bus === null ? "–" : guest.bus ? "Ja" : "Nej"}</td>
                    <td className="p-4">{guest.dietary ?? "–"}</td>
                    <td className="p-4 text-right"><DeleteGuestButton source={guest.source} id={guest.id} name={guest.name} /></td>
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
