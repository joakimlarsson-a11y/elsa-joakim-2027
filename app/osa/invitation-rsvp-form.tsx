"use client";

import { FormEvent, useState, useTransition } from "react";
import { firstNames } from "@/lib/site";
import { inputClass, radioClass } from "../components/form-styles";
import RsvpSuccess from "../components/rsvp-success";
import { submitInvitationRsvp } from "./actions";
import type { Invitation } from "./types";

type GuestState = {
  id: string;
  name: string;
  attending: boolean | null;
  dietary_info: string;
  needs_bus: boolean | null;
  message: string;
};

export default function InvitationRsvpForm({ token, invitation }: { token: string; invitation: Invitation }) {
  const alreadyResponded = invitation.status === "responded";
  const solo = invitation.guests.length === 1;
  const [guests, setGuests] = useState<GuestState[]>(() =>
    invitation.guests.map((guest) => ({
      id: guest.id,
      name: guest.name,
      attending: guest.attending,
      dietary_info: guest.dietary_info ?? "",
      needs_bus: guest.attending ? guest.needs_bus : null,
      message: guest.message ?? ""
    }))
  );
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  function update(id: string, changes: Partial<Omit<GuestState, "id" | "name">>) {
    setGuests((current) => current.map((guest) => (guest.id === id ? { ...guest, ...changes } : guest)));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const responses = guests.map((guest) => ({
      id: guest.id,
      attending: guest.attending,
      dietary_info: guest.dietary_info,
      needs_bus: guest.needs_bus === true,
      message: guest.message
    }));
    startTransition(async () => {
      try {
        const result = await submitInvitationRsvp(token, responses, invitation.has_email ? "" : email);
        if (result.ok) setDone(true);
        else setError(result.error);
      } catch {
        setError("Något gick fel. Försök igen.");
      }
    });
  }

  if (done) {
    const coming = guests.filter((guest) => guest.attending);
    const comingNames = firstNames(coming.map((guest) => guest.name));
    const everyone = firstNames(guests.map((guest) => guest.name));
    const heading = coming.length > 0
      ? `Skål${comingNames ? `, ${comingNames}` : ""}! Vi ses 19 juni.`
      : `Vi kommer att sakna ${solo ? "dig" : "er"}${everyone ? `, ${everyone}` : ""}.`;
    return (
      <RsvpSuccess heading={heading} attending={coming.length > 0} action={<button type="button" onClick={() => setDone(false)} className="font-semibold text-sea underline underline-offset-4">Ändra svar</button>}>
        {!solo && (
          <ul className="space-y-1">
            {guests.map((guest) => <li key={guest.id}><strong>{guest.name}</strong> – {guest.attending ? "kommer" : "kan inte komma"}</li>)}
          </ul>
        )}
        <p>{solo ? "En bekräftelse är på väg till din e-post. Behöver du ändra något använder du bara samma länk igen." : "En bekräftelse är på väg till er e-post. Behöver ni ändra något använder ni bara samma länk igen."}</p>
      </RsvpSuccess>
    );
  }

  if (guests.length === 0) {
    return <p className="rounded-2xl bg-paper p-8 leading-7 text-ink/80">Inbjudan saknar gäster. Hör av dig till oss så hjälper vi dig.</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-8 rounded-2xl bg-paper p-6 shadow-soft sm:p-10">
      {alreadyResponded && <p className="leading-7 text-ink/75" role="status">{solo ? "Du har redan svarat – ditt tidigare svar är ifyllt nedan och kan ändras." : "Ni har redan svarat – ert tidigare svar är ifyllt nedan och kan ändras."}</p>}

      <ol className="space-y-6">
        {guests.map((guest) => {
          const prefix = `guest-${guest.id}`;
          return (
            <li key={guest.id}>
              <fieldset className="space-y-5 rounded-xl border border-ink/15 bg-white/60 p-5 sm:p-6">
                <legend className="px-1 font-display text-3xl">{guest.name}</legend>
                <fieldset className="space-y-3">
                  <legend className="text-sm font-semibold">{solo ? "Kommer du?" : `Kommer ${guest.name}?`}</legend>
                  <div className="flex flex-wrap gap-3">
                    <label className={radioClass}><input required name={`${prefix}-attending`} type="radio" checked={guest.attending === true} onChange={() => update(guest.id, { attending: true })} />Ja, gärna</label>
                    <label className={radioClass}><input required name={`${prefix}-attending`} type="radio" checked={guest.attending === false} onChange={() => update(guest.id, { attending: false })} />Nej, tyvärr</label>
                  </div>
                </fieldset>

                {guest.attending === true && (
                  <>
                    <label htmlFor={`${prefix}-diet`} className="block text-sm font-semibold">Allergier eller specialkost<span className="ml-2 font-normal text-ink/70">valfritt</span>
                      <textarea id={`${prefix}-diet`} rows={2} maxLength={1000} value={guest.dietary_info} onChange={(e) => update(guest.id, { dietary_info: e.target.value })} className={inputClass} />
                    </label>
                    <fieldset className="space-y-3">
                      <legend className="text-sm font-semibold">{solo ? "Vill du åka med bussen från kyrkan?" : `Vill ${guest.name.trim().split(/\s+/)[0]} åka med bussen från kyrkan?`}</legend>
                      <div className="flex flex-wrap gap-3">
                        <label className={radioClass}><input required name={`${prefix}-bus`} type="radio" checked={guest.needs_bus === true} onChange={() => update(guest.id, { needs_bus: true })} />Ja tack</label>
                        <label className={radioClass}><input required name={`${prefix}-bus`} type="radio" checked={guest.needs_bus === false} onChange={() => update(guest.id, { needs_bus: false })} />Nej tack</label>
                      </div>
                    </fieldset>
                  </>
                )}

                {guest.attending === false && (
                  <label htmlFor={`${prefix}-message`} className="block text-sm font-semibold">En hälsning till oss<span className="ml-2 font-normal text-ink/70">valfritt</span>
                    <textarea id={`${prefix}-message`} rows={3} maxLength={2000} value={guest.message} onChange={(e) => update(guest.id, { message: e.target.value })} className={inputClass} />
                  </label>
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>

      {!invitation.has_email && (
        <label htmlFor="invitation-email" className="block text-sm font-semibold">E-post
          <span id="invitation-email-hint" className="mt-1 block font-normal text-ink/75">Dit skickar vi bekräftelsen och hör av oss om något ändras.</span>
          <input id="invitation-email" required aria-describedby="invitation-email-hint" type="email" autoComplete="email" maxLength={200} value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </label>
      )}

      {error && <p className="text-sm font-semibold text-red-800" role="alert">{error}</p>}
      <button disabled={pending} type="submit" className="button-primary w-full rounded-full bg-ember px-7 py-3 font-semibold text-white disabled:cursor-wait disabled:opacity-60">{pending ? "Skickar…" : alreadyResponded ? (solo ? "Uppdatera mitt svar" : "Uppdatera vårt svar") : solo ? "Skicka mitt svar" : "Skicka vårt svar"}</button>
    </form>
  );
}
