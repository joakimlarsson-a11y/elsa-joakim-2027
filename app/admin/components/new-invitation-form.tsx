"use client";

import { FormEvent, useState, useTransition } from "react";
import { inputClass } from "../../components/form-styles";
import { createInvitation, type CreateResult } from "../actions";
import CopyButtons from "./copy-buttons";

type Created = Extract<CreateResult, { ok: true }>;

export default function NewInvitationForm() {
  const [groupName, setGroupName] = useState("");
  const [email, setEmail] = useState("");
  const [guestNames, setGuestNames] = useState("");
  const [error, setError] = useState("");
  const [created, setCreated] = useState<Created | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await createInvitation({ groupName, email, guestNames });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCreated(result);
      setGroupName("");
      setEmail("");
      setGuestNames("");
    });
  }

  return (
    <div className="space-y-6">
      {created && (
        <div className="rounded-2xl bg-sky p-6" role="status">
          <p className="eyebrow text-plum">Sällskapet är sparat</p>
          <p className="mt-2 font-display text-2xl">{created.groupName}</p>
          <p className="mt-2 break-all text-sm text-ink/75">{created.link}</p>
          <div className="mt-4"><CopyButtons id={created.id} status="pending" link={created.link} message={created.message} /></div>
        </div>
      )}
      <form onSubmit={submit} className="space-y-5 rounded-2xl bg-mist p-6 sm:p-8">
        <label htmlFor="new-group" className="block text-sm font-semibold">Sällskapsnamn
          <input id="new-group" required maxLength={200} placeholder="Familjen Svensson" value={groupName} onChange={(e) => setGroupName(e.target.value)} className={inputClass} />
        </label>
        <label htmlFor="new-guests" className="block text-sm font-semibold">Gäster<span className="ml-2 font-normal text-ink/70">separera med komma</span>
          <textarea id="new-guests" required rows={2} placeholder="Anna Svensson, Erik Svensson" value={guestNames} onChange={(e) => setGuestNames(e.target.value)} className={inputClass} />
        </label>
        <label htmlFor="new-email" className="block text-sm font-semibold">E-post<span className="ml-2 font-normal text-ink/70">valfritt – används för bekräftelse efter svar</span>
          <input id="new-email" type="email" maxLength={200} value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </label>
        {error && <p className="text-sm font-semibold text-red-800" role="alert">{error}</p>}
        <button disabled={pending} type="submit" className="button-primary rounded-full bg-plum px-7 py-3 font-semibold text-white disabled:cursor-wait disabled:opacity-60">{pending ? "Sparar…" : "Lägg till sällskap"}</button>
      </form>
    </div>
  );
}
