import Link from "next/link";
import { signOut } from "../actions";
import GuestTable, { type GuestRow } from "./guest-table";

export type Guest = {
  id: string;
  name: string;
  attending: boolean | null;
  dietary_info: string | null;
  needs_bus: boolean;
  message: string | null;
};
export type InvitationRow = {
  id: string;
  token: string;
  group_name: string;
  email: string | null;
  personal_note: string | null;
  status: "pending" | "sent" | "responded";
  created_at: string;
  guests: Guest[];
};
export type OpenRsvp = { id: string | number; name: string; email: string; guests: string | null; attendance: string | null; bus: string | null; allergies: string | null; created_at: string };

const GUEST_FILTERS = [
  { key: "alla", label: "Alla" },
  { key: "kommer", label: "Kommer" },
  { key: "allergier", label: "Allergier & specialkost" }
] as const;
type GuestFilterKey = (typeof GUEST_FILTERS)[number]["key"];

function adminHref(basePath: string, guestFilter: GuestFilterKey, hash: string) {
  const params = new URLSearchParams();
  if (guestFilter !== "alla") params.set("gaster", guestFilter);
  const query = params.toString();
  return `${basePath}${query ? `?${query}` : ""}#${hash}`;
}

const pillClass = (active: boolean) => `rounded-full px-4 py-2 text-sm font-semibold ${active ? "bg-sea text-white" : "border border-sea text-sea"}`;

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 rounded-xl bg-white px-3 py-2.5 shadow-soft sm:px-4 sm:py-3">
      <dt className="text-xs font-semibold text-sea sm:font-bold sm:uppercase sm:tracking-[.14em]">{label}</dt>
      <dd className="mt-0.5 font-display text-3xl leading-tight text-ink sm:text-4xl">{value}</dd>
    </div>
  );
}

type AdminDashboardProps = {
  email: string;
  origin: string;
  invitations: InvitationRow[];
  openRsvps: OpenRsvp[];
  searchParams: { filter?: string; gaster?: string };
  loadError: boolean;
  openFormAvailable: boolean;
  basePath: string;
  preview?: boolean;
};

export default function AdminDashboard({ email, invitations, openRsvps, searchParams, loadError, openFormAvailable, basePath, preview = false }: AdminDashboardProps) {
  const { gaster: rawGuestFilter } = searchParams;
  const guestFilter: GuestFilterKey = GUEST_FILTERS.some((item) => item.key === rawGuestFilter) ? (rawGuestFilter as GuestFilterKey) : "alla";

  type UnorderedRow = Omit<GuestRow, "order"> & { createdAt: string; tiebreak: number };
  const unorderedRows: UnorderedRow[] = [
    ...invitations.flatMap((invitation) =>
      invitation.guests.map((guest, index): UnorderedRow => ({
        key: `invitation-${guest.id}`,
        source: "invitation",
        id: guest.id,
        name: guest.name,
        origin: invitation.group_name,
        detail: "Inbjudan",
        attending: guest.attending,
        bus: guest.attending === true ? guest.needs_bus : null,
        dietary: guest.attending === true ? guest.dietary_info : null,
        message: guest.message,
        createdAt: invitation.created_at,
        tiebreak: index
      }))
    ),
    ...openRsvps.map((rsvp): UnorderedRow => ({
      key: `open-${rsvp.id}`,
      source: "open",
      id: String(rsvp.id),
      name: rsvp.name,
      origin: "Öppna formuläret",
      detail: [rsvp.email, rsvp.guests].filter(Boolean).join(" · ") || null,
      attending: rsvp.attendance ? rsvp.attendance === "Kommer" : true,
      bus: rsvp.bus === "Ja" ? true : rsvp.bus === "Nej" ? false : null,
      dietary: rsvp.allergies,
      message: null,
      createdAt: rsvp.created_at,
      tiebreak: Number(rsvp.id) || 0
    }))
  ];

  // Signup order: oldest first, ties (same submission) broken by id / position in the invitation.
  const guestRows: GuestRow[] = [...unorderedRows]
    .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt) || a.tiebreak - b.tiebreak)
    .map(({ createdAt: _createdAt, tiebreak: _tiebreak, ...row }, index) => ({ ...row, order: index + 1 }));

  const yes = guestRows.filter((guest) => guest.attending === true);
  const bus = yes.filter((guest) => guest.bus === true).length;
  const withDietary = yes.filter((guest) => guest.dietary);
  const invitationEmails = new Set(invitations.map((invitation) => invitation.email).filter(Boolean));
  const duplicates = openRsvps.filter((rsvp) => invitationEmails.has(rsvp.email?.toLowerCase()));
  const visibleGuests = guestFilter === "kommer" ? yes : guestFilter === "allergier" ? withDietary : guestRows;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 lg:px-10">
      <header>
        <p className="eyebrow text-sea">Elsa & Joakim · Admin</p>
        <h1 className="mt-3 font-display text-5xl text-ink">Gäster & OSA</h1>
      </header>

      {loadError && <p className="mt-6 rounded-lg bg-white p-4 text-sm font-semibold text-red-800" role="alert">Kunde inte läsa inbjudningarna. Kontrollera att SQL-migreringen är körd och att din e-post finns i is_wedding_admin().</p>}

      <dl aria-label="Summering" className="mt-8 grid max-w-xl grid-cols-3 gap-2 sm:gap-3">
        <StatCard label="Kommer" value={yes.length} />
        <StatCard label="Buss" value={bus} />
        <StatCard label="Specialkost" value={withDietary.length} />
      </dl>

      <section aria-labelledby="guests-title" className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="guests-title" className="scroll-mt-8 font-display text-4xl text-ink">Gästlista</h2>
          <nav aria-label="Filtrera gästlistan" className="flex flex-wrap gap-2">
            {GUEST_FILTERS.map((item) => (
              <Link key={item.key} href={adminHref(basePath, item.key, "guests-title")} aria-current={guestFilter === item.key ? "page" : undefined} className={pillClass(guestFilter === item.key)}>{item.label}</Link>
            ))}
          </nav>
        </div>
        {!openFormAvailable && <p className="mt-4 rounded-lg bg-white p-4 text-sm text-ink" role="status">SUPABASE_SERVICE_ROLE_KEY saknas, så anmälningar via öppna formuläret visas inte.</p>}
        {duplicates.length > 0 && (
          <p className="mt-4 rounded-lg bg-dusk p-4 text-sm text-ink" role="status">
            <strong>Möjliga dubbletter:</strong> {duplicates.map((rsvp) => `${rsvp.name} (${rsvp.email})`).join(", ")} har samma e-post som en inbjudan.
          </p>
        )}
        <GuestTable
          key={guestFilter}
          guests={visibleGuests}
          emptyMessage={guestFilter === "allergier" ? "Ingen som kommer har angett allergier eller specialkost." : "Inga gäster att visa."}
        />
      </section>

      <footer className="mt-16 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-ink/10 pt-6 text-sm text-ink/70">
        <span className="break-all">{email}</span>
        {preview ? (
          <span className="rounded-full bg-dusk px-3 py-1 font-semibold text-sea">Förhandsvisning med testdata</span>
        ) : (
          <form action={signOut}><button type="submit" className="font-semibold text-sea underline">Logga ut</button></form>
        )}
      </footer>
    </main>
  );
}
