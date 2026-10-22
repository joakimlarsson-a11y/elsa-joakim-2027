import { Resend } from "resend";
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

type EmailContent = { to: string; subject: string; html: string; text: string };

function wrapHtml(subject: string, html: string) {
  return `<!DOCTYPE html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head><body style="margin:0;padding:24px 16px;background:#ffffff">
<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#1d2140;line-height:1.6">
  <p style="letter-spacing:2px;text-transform:uppercase;color:#44336d;font-size:12px">19 juni 2027</p>
  ${html}
  <p>Varma hälsningar,<br>Elsa &amp; Joakim</p>
</div></body></html>`;
}

function resendClient() {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) console.error("Missing RESEND_API_KEY; skipping email.");
  return resendKey ? new Resend(resendKey) : null;
}

/** Skickar ett mejl med gemensam avsändare, svarsadress och HTML-ram. */
export async function sendEmail(content: EmailContent) {
  await sendEmails([content]);
}

/** Skickar flera mejl i ett anrop, så att Resends anropsgräns inte slår till för stora sällskap. */
export async function sendEmails(contents: EmailContent[]) {
  const resend = resendClient();
  if (!resend || contents.length === 0) return;
  const emails = contents.map(({ to, subject, html, text }) => ({ from: FROM, replyTo: REPLY_TO, to, subject, text, html: wrapHtml(subject, html) }));
  const { error } = emails.length === 1 ? await resend.emails.send(emails[0]) : await resend.batch.send(emails);
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
