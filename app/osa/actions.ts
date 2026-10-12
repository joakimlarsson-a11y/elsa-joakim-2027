"use server";

import { sendInvitationConfirmation } from "@/lib/email";
import { requestOrigin } from "@/lib/origin";
import { clean, invitationLink, isEmail, UUID_PATTERN } from "@/lib/site";
import { createAnonClient, createServiceClient } from "@/lib/supabase/server";
import { loadInvitation } from "./load-invitation";
import type { GuestResponse } from "./types";

const MAX_GUESTS = 30;

export type SubmitResult = { ok: true } | { ok: false; error: string };

export async function submitInvitationRsvp(token: unknown, rawResponses: unknown, rawEmail: unknown): Promise<SubmitResult> {
  if (typeof token !== "string" || !UUID_PATTERN.test(token)) return { ok: false, error: "Länken är inte giltig." };
  if (!Array.isArray(rawResponses) || rawResponses.length === 0 || rawResponses.length > MAX_GUESTS) {
    return { ok: false, error: "Svara för alla i sällskapet." };
  }

  const responses: GuestResponse[] = [];
  for (const raw of rawResponses as Record<string, unknown>[]) {
    if (typeof raw?.id !== "string" || !UUID_PATTERN.test(raw.id) || typeof raw.attending !== "boolean") {
      return { ok: false, error: "Svara ja eller nej för alla i sällskapet." };
    }
    const attending = raw.attending;
    responses.push({
      id: raw.id,
      attending,
      dietary_info: attending ? clean(raw.dietary_info, 1000) : "",
      needs_bus: attending && raw.needs_bus === true,
      message: attending ? "" : clean(raw.message, 2000)
    });
  }

  const email = clean(rawEmail, 200).toLowerCase();
  if (email && !isEmail(email)) return { ok: false, error: "Kontrollera e-postadressen." };
  if (!email) {
    const invitation = await loadInvitation(token);
    if (invitation && !invitation.has_email) return { ok: false, error: "Fyll i en e-postadress så att vi kan skicka bekräftelsen." };
  }

  let supabase;
  try {
    supabase = createAnonClient();
  } catch (error) {
    console.error(error);
    return { ok: false, error: "OSA är tillfälligt stängd. Försök igen senare." };
  }

  const { data, error } = await supabase.rpc("submit_rsvp", { p_token: token, p_responses: responses, p_email: email || null });
  if (error) {
    console.error("submit_rsvp failed:", error);
    const known = error.code === "22023" && error.message ? error.message : null;
    return { ok: false, error: known || "Vi kunde inte spara ert svar. Försök igen." };
  }
  if (data !== true) return { ok: false, error: "Länken är inte giltig." };

  try {
    const service = createServiceClient();
    if (service) {
      const { data: invitation } = await service
        .from("invitations")
        .select("group_name, email, guests(name, attending, dietary_info, needs_bus)")
        .eq("token", token)
        .single();
      if (invitation?.email) {
        await sendInvitationConfirmation({
          to: invitation.email,
          groupName: invitation.group_name,
          guests: (invitation.guests ?? []).map((guest) => ({ ...guest, attending: guest.attending === true })),
          editLink: `${invitationLink(await requestOrigin(), token)}#osa`
        });
      }
    }
  } catch (mailError) {
    console.error("Confirmation email failed:", mailError);
  }

  return { ok: true };
}
