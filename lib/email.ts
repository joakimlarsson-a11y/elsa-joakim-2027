import { Resend } from "resend";
import { escapeHtml, soloFirstName } from "./site";

export type ConfirmationGuest = {
  name: string;
  attending: boolean;
  dietary_info: string | null;
  needs_bus: boolean;
};

type ConfirmationInput = { to: string; groupName: string; guests: ConfirmationGuest[]; editLink: string };

export async function sendInvitationConfirmation({ to, groupName, guests, editLink }: ConfirmationInput) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error("Missing RESEND_API_KEY; skipping confirmation email.");
    return;
  }

  const summary = guests
    .map((guest) => {
      const details = guest.attending
        ? `Kommer<br>Busstransport: ${guest.needs_bus ? "Ja" : "Nej"}${guest.dietary_info ? `<br>Specialkost: ${escapeHtml(guest.dietary_info)}` : ""}`
        : "Kan tyvärr inte komma";
      return `<li><strong>${escapeHtml(guest.name)}</strong><br>${details}</li>`;
    })
    .join("");
  const anyAttending = guests.some((guest) => guest.attending);
  const solo = soloFirstName(guests.map((guest) => guest.name));
  const text = solo
    ? {
        subject: "Tack för din OSA!",
        name: solo,
        intro: anyAttending ? "Vi har tagit emot ditt svar och längtar efter att fira med dig." : "Vi har tagit emot ditt svar. Tack för att du hörde av dig. Vi kommer att sakna dig.",
        summaryTitle: "Ditt svar",
        editHint: "Har något ändrats? Du kan uppdatera ditt svar fram till 1 april 2027.",
        editButton: "Ändra mitt svar"
      }
    : {
        subject: "Tack för er OSA!",
        name: groupName,
        intro: anyAttending ? "Vi har tagit emot ert svar och längtar efter att fira med er." : "Vi har tagit emot ert svar. Tack för att ni hörde av er. Vi kommer att sakna er.",
        summaryTitle: "Ert svar",
        editHint: "Har något ändrats? Ni kan uppdatera ert svar fram till 1 april 2027.",
        editButton: "Ändra vårt svar"
      };
  const safeLink = escapeHtml(editLink);

  await new Resend(resendKey).emails.send({
    from: "Elsa & Joakim <osa@elsajoakim2027.se>",
    to,
    subject: text.subject,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#1d2140;line-height:1.6">
      <p style="letter-spacing:2px;text-transform:uppercase;color:#44336d;font-size:12px">19 juni 2027</p>
      <h1 style="font-family:Georgia,serif;font-size:42px;font-weight:500">Tack, ${escapeHtml(text.name)}!</h1>
      <p>${text.intro}</p>
      <div style="background:#f5f3fa;border-radius:12px;padding:20px;margin:24px 0">
        <strong>${text.summaryTitle}</strong><ul style="margin-bottom:0;padding-left:20px">${summary}</ul>
      </div>
      ${anyAttending ? `<p><strong>Praktiskt:</strong> Ceremonin börjar 14:00 i Ölmevalla Kyrka. Buss till Långedrags Värdshus avgår 16:00, mingel börjar 16:30 och middag 18:30.</p>` : ""}
      <p>${text.editHint}</p>
      <p style="margin:24px 0"><a href="${safeLink}" style="display:inline-block;background:#44336d;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 28px;border-radius:999px">${text.editButton}</a></p>
      <p style="font-size:13px;color:#555">Fungerar inte knappen? Kopiera länken: <a href="${safeLink}" style="color:#44336d">${safeLink}</a></p>
      <p>Varma hälsningar,<br>Elsa & Joakim</p>
    </div>`
  });
}
