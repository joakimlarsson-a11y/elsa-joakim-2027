"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { requestOrigin } from "@/lib/origin";
import { clean, invitationLink, invitationMessage, isEmail, parseGuestNames, UUID_PATTERN } from "@/lib/site";
import { createServiceClient, createSessionClient } from "@/lib/supabase/server";

const MAX_GUESTS = 30;

export type ActionResult = { ok: true } | { ok: false; error: string };
export type CreateResult =
  | { ok: true; id: string; groupName: string; link: string; message: string }
  | { ok: false; error: string };

function validId(id: unknown): id is string {
  return typeof id === "string" && UUID_PATTERN.test(id);
}

export async function createInvitation(input: { groupName?: unknown; email?: unknown; guestNames?: unknown; personalNote?: unknown }): Promise<CreateResult> {
  const { supabase } = await requireAdmin();

  const groupName = clean(input.groupName, 200);
  const email = clean(input.email, 200).toLowerCase();
  const personalNote = clean(input.personalNote, 500);
  const names = parseGuestNames(input.guestNames);

  if (!groupName) return { ok: false, error: "Ange ett sällskapsnamn." };
  if (email && !isEmail(email)) return { ok: false, error: "Kontrollera e-postadressen." };
  if (names.length === 0) return { ok: false, error: "Ange minst en gäst." };
  if (names.length > MAX_GUESTS) return { ok: false, error: `Max ${MAX_GUESTS} gäster per sällskap.` };

  const { data: invitation, error } = await supabase
    .from("invitations")
    .insert({ group_name: groupName, email: email || null, ...(personalNote ? { personal_note: personalNote } : {}) })
    .select("id, token")
    .single();
  if (error || !invitation) {
    console.error("Create invitation failed:", error);
    return { ok: false, error: "Kunde inte spara sällskapet." };
  }

  const { error: guestError } = await supabase.from("guests").insert(names.map((name) => ({ invitation_id: invitation.id, name })));
  if (guestError) {
    console.error("Create guests failed:", guestError);
    await supabase.from("invitations").delete().eq("id", invitation.id);
    return { ok: false, error: "Kunde inte spara gästerna." };
  }

  revalidatePath("/admin");
  const origin = await requestOrigin();
  return { ok: true, id: invitation.id, groupName, link: invitationLink(origin, invitation.token), message: invitationMessage(origin, groupName, names, invitation.token) };
}

export async function setInvitationSent(id: unknown, sent: boolean): Promise<ActionResult> {
  if (!validId(id)) return { ok: false, error: "Ogiltigt sällskap." };
  const { supabase } = await requireAdmin();
  // Ett besvarat sällskap behåller alltid status 'responded'.
  const { error } = await supabase
    .from("invitations")
    .update({ status: sent ? "sent" : "pending" })
    .eq("id", id)
    .eq("status", sent ? "pending" : "sent");
  if (error) {
    console.error("Update status failed:", error);
    return { ok: false, error: "Kunde inte uppdatera status." };
  }
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateInvitationEmail(id: unknown, rawEmail: unknown): Promise<ActionResult> {
  if (!validId(id)) return { ok: false, error: "Ogiltigt sällskap." };
  const email = clean(rawEmail, 200).toLowerCase();
  if (email && !isEmail(email)) return { ok: false, error: "Kontrollera e-postadressen." };
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("invitations").update({ email: email || null }).eq("id", id);
  if (error) {
    console.error("Update email failed:", error);
    return { ok: false, error: "Kunde inte spara e-postadressen." };
  }
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateInvitationNote(id: unknown, rawNote: unknown): Promise<ActionResult> {
  if (!validId(id)) return { ok: false, error: "Ogiltigt sällskap." };
  const note = clean(rawNote, 500);
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("invitations").update({ personal_note: note || null }).eq("id", id);
  if (error) {
    console.error("Update personal note failed:", error);
    return { ok: false, error: "Kunde inte spara hälsningen. Har migreringen för personal_note körts?" };
  }
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteInvitation(id: unknown): Promise<ActionResult> {
  if (!validId(id)) return { ok: false, error: "Ogiltigt sällskap." };
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("invitations").delete().eq("id", id);
  if (error) {
    console.error("Delete invitation failed:", error);
    return { ok: false, error: "Kunde inte ta bort sällskapet." };
  }
  revalidatePath("/admin");
  return { ok: true };
}

export type GuestSource = "invitation" | "open";

export async function deleteGuest(source: unknown, id: unknown): Promise<ActionResult> {
  if (source === "invitation") {
    if (!validId(id)) return { ok: false, error: "Ogiltig gäst." };
    const { supabase } = await requireAdmin();
    const { data: guest, error } = await supabase.from("guests").delete().eq("id", id).select("invitation_id").single();
    if (error || !guest) {
      console.error("Delete guest failed:", error);
      return { ok: false, error: "Kunde inte ta bort gästen." };
    }

    const { data: remaining, error: remainingError } = await supabase.from("guests").select("attending").eq("invitation_id", guest.invitation_id);
    if (remainingError) console.error("Load remaining guests failed:", remainingError);
    else if (remaining.length === 0) await supabase.from("invitations").delete().eq("id", guest.invitation_id);
    else if (remaining.every((row) => row.attending !== null)) {
      // Den borttagna gästen kan ha varit den enda som inte svarat.
      await supabase.from("invitations").update({ status: "responded" }).eq("id", guest.invitation_id);
    }
  } else if (source === "open") {
    if (typeof id !== "string" || !(UUID_PATTERN.test(id) || /^\d{1,18}$/.test(id))) return { ok: false, error: "Ogiltig anmälan." };
    await requireAdmin();
    const service = createServiceClient();
    if (!service) return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY saknas." };
    const { error } = await service.from("rsvps").delete().eq("id", id);
    if (error) {
      console.error("Delete rsvp failed:", error);
      return { ok: false, error: "Kunde inte ta bort anmälan." };
    }
  } else {
    return { ok: false, error: "Ogiltig gäst." };
  }

  revalidatePath("/admin");
  return { ok: true };
}

export async function signOut() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
