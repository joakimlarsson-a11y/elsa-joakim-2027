import { Resend } from "resend";
import { adminEmails } from "./admin";
import { escapeHtml, SITE_URL, soloFirstName, WEDDING } from "./site";

const FROM = "Elsa & Joakim <osa@elsajoakim2027.se>";
const REPLY_TO = "osa@elsajoakim2027.se";
const SCHEDULE_URL = `${SITE_URL}/#dagen`;

export type ConfirmationGuest = {
  name: string;
  attending: boolean;
  dietary_info: string | null;
  needs_bus: boolean;
};

type EmailContent = { to: string | string[]; subject: string; html: string; text: string; signOff?: boolean };

/** Skickar ett mejl med gemensam avsändare, svarsadress och HTML-ram. */
export async function sendEmail({ to, subject, html, text, signOff = true }: EmailContent) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error("Missing RESEND_API_KEY; skipping email.");
    return;
  }
  const { error } = await new Resend(resendKey).emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject,
    text,
    html: `<!DOCTYPE html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head><body style="margin:0;padding:24px 16px;background:#ffffff">
<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#1d2140;line-height:1.6">
  <p style="letter-spacing:2px;text-transform:uppercase;color:#44336d;font-size:12px">19 juni 2027</p>
  ${html}
  ${signOff ? "<p>Varma hälsningar,<br>Elsa &amp; Joakim</p>" : ""}
</div></body></html>`
  });
  if (error) throw new Error(`Resend failed: ${error.message}`);
}

/** Länk till dagens schema på sajten, för den som kommer. */
export function scheduleLinkHtml() {
  return `<p>Tider, platser och praktisk information hittar du på <a href="${SCHEDULE_URL}" style="color:#44336d">elsajoakim2027.se</a>.</p>`;
}

export function scheduleLinkText() {
  return `Tider, platser och praktisk information: ${SCHEDULE_URL}`;
}

type ConfirmationInput = { to: string; groupName: string; guests: ConfirmationGuest[]; editLink: string };

export async function sendInvitationConfirmation({ to, groupName, guests, editLink }: ConfirmationInput) {
  const anyAttending = guests.some((guest) => guest.attending);
  const solo = soloFirstName(guests.map((guest) => guest.name));
  const copy = solo
    ? {
        subject: "Tack för din OSA!",
        name: solo,
        intro: anyAttending ? "Vi har tagit emot ditt svar och längtar efter att fira med dig." : "Vi har tagit emot ditt svar. Tack för att du hörde av dig. Vi kommer att sakna dig.",
        summaryTitle: "Ditt svar",
        editHint: `Har något ändrats? Du kan uppdatera ditt svar fram till ${WEDDING.rsvpBy}.`,
        editButton: "Ändra mitt svar"
      }
    : {
        subject: "Tack för er OSA!",
        name: groupName,
        intro: anyAttending ? "Vi har tagit emot ert svar och längtar efter att fira med er." : "Vi har tagit emot ert svar. Tack för att ni hörde av er. Vi kommer att sakna er.",
        summaryTitle: "Ert svar",
        editHint: `Har något ändrats? Ni kan uppdatera ert svar fram till ${WEDDING.rsvpBy}.`,
        editButton: "Ändra vårt svar"
      };

  const details = (guest: ConfirmationGuest) =>
    guest.attending
      ? ["Kommer", `Busstransport: ${guest.needs_bus ? "Ja" : "Nej"}`, ...(guest.dietary_info ? [`Specialkost: ${guest.dietary_info}`] : [])]
      : ["Kan tyvärr inte komma"];

  const summaryHtml = guests
    .map((guest) => `<li><strong>${escapeHtml(guest.name)}</strong><br>${details(guest).map(escapeHtml).join("<br>")}</li>`)
    .join("");
  const summaryText = guests.map((guest) => `- ${guest.name}: ${details(guest).join(", ")}`).join("\n");
  const safeLink = escapeHtml(editLink);

  await sendEmail({
    to,
    subject: copy.subject,
    html: `<h1 style="font-family:Georgia,serif;font-size:42px;font-weight:500">Tack, ${escapeHtml(copy.name)}!</h1>
  <p>${copy.intro}</p>
  <div style="background:#f5f3fa;border-radius:12px;padding:20px;margin:24px 0">
    <strong>${copy.summaryTitle}</strong><ul style="margin-bottom:0;padding-left:20px">${summaryHtml}</ul>
  </div>
  ${anyAttending ? scheduleLinkHtml() : ""}
  <p>${copy.editHint}</p>
  <p style="margin:24px 0"><a href="${safeLink}" style="display:inline-block;background:#44336d;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 28px;border-radius:999px">${copy.editButton}</a></p>
  <p style="font-size:13px;color:#555">Fungerar inte knappen? Kopiera länken: <a href="${safeLink}" style="color:#44336d">${safeLink}</a></p>`,
    text: [
      `Tack, ${copy.name}!`,
      copy.intro,
      `${copy.summaryTitle}:\n${summaryText}`,
      ...(anyAttending ? [scheduleLinkText()] : []),
      `${copy.editHint}\n${copy.editButton}: ${editLink}`,
      "Varma hälsningar,\nElsa & Joakim"
    ].join("\n\n")
  });
}

export type AdminNotificationGuest = { name: string; attending: boolean; details: string[] };

type AdminNotificationInput = { groupName: string; contactEmail: string | null; guests: AdminNotificationGuest[] };

/** Meddelar admins (ADMIN_EMAILS) att en gäst har OSA:at. */
export async function sendAdminRsvpNotification({ groupName, contactEmail, guests }: AdminNotificationInput) {
  const to = adminEmails();
  if (to.length === 0) {
    console.error("Missing ADMIN_EMAILS; skipping admin notification.");
    return;
  }
  const attendingCount = guests.filter((guest) => guest.attending).length;
  const subject = `Ny OSA: ${groupName} (${attendingCount} av ${guests.length} kommer)`;
  const adminUrl = `${SITE_URL}/admin`;
  const summaryHtml = guests
    .map((guest) => `<li><strong>${escapeHtml(guest.name)}</strong><br>${guest.details.map(escapeHtml).join("<br>")}</li>`)
    .join("");
  const summaryText = guests.map((guest) => `- ${guest.name}: ${guest.details.join(", ")}`).join("\n");

  await sendEmail({
    to,
    subject,
    signOff: false,
    html: `<h1 style="font-family:Georgia,serif;font-size:32px;font-weight:500">Ny OSA från ${escapeHtml(groupName)}</h1>
  ${contactEmail ? `<p>E-post: <a href="mailto:${escapeHtml(contactEmail)}" style="color:#44336d">${escapeHtml(contactEmail)}</a></p>` : ""}
  <div style="background:#f5f3fa;border-radius:12px;padding:20px;margin:24px 0">
    <strong>Svar</strong><ul style="margin-bottom:0;padding-left:20px">${summaryHtml}</ul>
  </div>
  <p><a href="${adminUrl}" style="color:#44336d">Öppna adminsidan</a></p>`,
    text: [`Ny OSA från ${groupName}`, ...(contactEmail ? [`E-post: ${contactEmail}`] : []), `Svar:\n${summaryText}`, `Adminsidan: ${adminUrl}`].join("\n\n")
  });
}
