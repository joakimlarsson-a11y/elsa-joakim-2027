import { Resend } from "resend";
import { escapeHtml } from "./site";

export type ConfirmationGuest = {
  name: string;
  attending: boolean;
  dietary_info: string | null;
  needs_bus: boolean;
  song_request: string | null;
};

export async function sendInvitationConfirmation(to: string, groupName: string, guests: ConfirmationGuest[]) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error("Missing RESEND_API_KEY; skipping confirmation email.");
    return;
  }

  const summary = guests
    .map((guest) => {
      const details = guest.attending
        ? `Kommer<br>Busstransport: ${guest.needs_bus ? "Ja" : "Nej"}${guest.dietary_info ? `<br>Specialkost: ${escapeHtml(guest.dietary_info)}` : ""}${guest.song_request ? `<br>Låtönskemål: ${escapeHtml(guest.song_request)}` : ""}`
        : "Kan tyvärr inte komma";
      return `<li><strong>${escapeHtml(guest.name)}</strong><br>${details}</li>`;
    })
    .join("");
  const anyAttending = guests.some((guest) => guest.attending);

  await new Resend(resendKey).emails.send({
    from: "Elsa & Joakim <onboarding@resend.dev>",
    to,
    subject: "Tack för er OSA – Elsa & Joakim",
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#1d2140;line-height:1.6">
      <p style="letter-spacing:2px;text-transform:uppercase;color:#44336d;font-size:12px">19 juni 2027</p>
      <h1 style="font-family:Georgia,serif;font-size:42px;font-weight:500">Tack, ${escapeHtml(groupName)}!</h1>
      <p>${anyAttending ? "Vi har tagit emot ert svar och längtar efter att fira med er." : "Vi har tagit emot ert svar. Tack för att ni hörde av er – ni kommer att saknas."}</p>
      <div style="background:#f5f3fa;border-radius:12px;padding:20px;margin:24px 0">
        <strong>Ert svar</strong><ul style="margin-bottom:0;padding-left:20px">${summary}</ul>
      </div>
      ${anyAttending ? `<p><strong>Praktiskt:</strong> Vigseln börjar 14:00 i Ölmevalla Kyrka. Buss till Långedrags Värdshus avgår 16:00, mingel börjar 16:30 och middag 18:30.</p>` : ""}
      <p>Behöver ni ändra något? Använd samma länk som i inbjudan.</p>
      <p>Varma hälsningar,<br>Elsa & Joakim</p>
    </div>`
  });
}
