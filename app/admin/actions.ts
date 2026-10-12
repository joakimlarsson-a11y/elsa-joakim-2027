"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { clean, invitationLink, invitationMessage, isEmail, UUID_PATTERN } from "@/lib/site";
import { createSessionClient } from "@/lib/supabase/server";

const MAX_GUESTS = 30;

export type ActionResult = { ok: true } | { ok: false; error: string };
export type CreateResult =
  | { ok: true; id: string; groupName: string; link: string; message: string }
  | { ok: false; error: string };

function validId(id: unknown): id is string {
  return typeof id === "string" && UUID_PATTERN.test(id);
}

export async function createInvitation(input: { groupName?: unknown; email?: unknown; guestNames?: unknown }): Promise<CreateResult> {
  const { supabase } = await requireAdmin();

  const groupName = clean(input.groupName, 200);
  const email = clean(input.email, 200).toLowerCase();
  const names = (typeof input.guestNames === "string" ? input.guestNames : "")
    .split(/[,\n]/)
    .map((name) => name.trim().slice(0, 120))
    .filter(Boolean);

  if (!groupName) return { ok: false, error: "Ange ett sällskapsnamn." };
  if (email && !isEmail(email)) return { ok: false, error: "Kontrollera e-postadressen." };
  if (names.length === 0) return { ok: false, error: "Ange minst en gäst." };
  if (names.length > MAX_GUESTS) return { ok: false, error: `Max ${MAX_GUESTS} gäster per sällskap.` };

  const { data: invitation, error } = await supabase
    .from("invitations")
    .insert({ group_name: groupName, email: email || null })
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
  return { ok: true, id: invitation.id, groupName, link: invitationLink(invitation.token), message: invitationMessage(groupName, invitation.token) };
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

export async function signOut() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
