import { notFound } from "next/navigation";
import { requestOrigin } from "@/lib/origin";
import AdminDashboard, { type InvitationRow, type OpenRsvp } from "../components/admin-dashboard";

export const dynamic = "force-dynamic";

const INVITATIONS: InvitationRow[] = [
  {
    id: "inv-1",
    token: "preview-svensson",
    group_name: "Familjen Svensson",
    email: "anna@example.com",
    personal_note: "Vi längtar efter att dansa med er igen!",
    status: "responded",
    created_at: "2026-10-01T10:00:00Z",
    guests: [
      { id: "g-1", name: "Anna Svensson", attending: true, dietary_info: "Vegetarian", needs_bus: true, message: "Vi ser fram emot det!" },
      { id: "g-2", name: "Erik Svensson", attending: true, dietary_info: null, needs_bus: true, message: null },
      { id: "g-3", name: "Lilla Svensson", attending: false, dietary_info: null, needs_bus: false, message: null }
    ]
  },
  {
    id: "inv-2",
    token: "preview-lindqvist",
    group_name: "Maja & Oskar",
    email: null,
    personal_note: null,
    status: "sent",
    created_at: "2026-10-02T10:00:00Z",
    guests: [
      { id: "g-4", name: "Maja Lindqvist", attending: null, dietary_info: null, needs_bus: false, message: null },
      { id: "g-5", name: "Oskar Lindqvist", attending: null, dietary_info: null, needs_bus: false, message: null }
    ]
  },
  {
    id: "inv-3",
    token: "preview-berg",
    group_name: "Faster Berit med ett riktigt långt sällskapsnamn för att testa radbrytning",
    email: "berit@example.com",
    personal_note: null,
    status: "pending",
    created_at: "2026-10-03T10:00:00Z",
    guests: [{ id: "g-6", name: "Berit Berg", attending: null, dietary_info: null, needs_bus: false, message: null }]
  }
];

const OPEN_RSVPS: OpenRsvp[] = [
  { id: 1, name: "Johan Ek", email: "johan@example.com", guests: "+1 Sara Ek", attendance: "Kommer", bus: "Nej", allergies: "Nötallergi", created_at: "2026-10-04T10:00:00Z" }
];

/** Dev-only admin preview with fixture data. Mutations will fail since there is no session. */
export default async function AdminPreviewPage({ searchParams }: { searchParams: Promise<{ filter?: string; gaster?: string }> }) {
  if (process.env.NODE_ENV !== "development") notFound();

  return (
    <AdminDashboard
      email="preview@localhost"
      origin={await requestOrigin()}
      invitations={INVITATIONS}
      openRsvps={OPEN_RSVPS}
      searchParams={await searchParams}
      loadError={false}
      openFormAvailable
      basePath="/admin/preview"
      preview
    />
  );
}
