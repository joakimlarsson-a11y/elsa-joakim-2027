import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin";
import { requestOrigin } from "@/lib/origin";
import { createServiceClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
import AdminDashboard, { type InvitationRow, type OpenRsvp } from "./components/admin-dashboard";

export const dynamic = "force-dynamic";

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

  return (
    <AdminDashboard
      email={admin.email}
      origin={origin}
      invitations={invitations}
      openRsvps={openRsvps}
      searchParams={await searchParams}
      loadError={!!error}
      openFormAvailable={!!service}
      basePath="/admin"
    />
  );
}
