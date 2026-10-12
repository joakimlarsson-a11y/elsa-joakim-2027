"use client";

import { FormEvent, useState, useTransition } from "react";
import { deleteInvitation, setInvitationSent, updateInvitationEmail, updateInvitationNote } from "../actions";

type Props = { id: string; groupName: string; status: string; email: string | null; personalNote: string | null };

export default function InvitationControls({ id, groupName, status, email, personalNote }: Props) {
  const [editing, setEditing] = useState<"email" | "note" | null>(null);
  const [value, setValue] = useState(email ?? "");
  const [note, setNote] = useState(personalNote ?? "");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ ok: boolean; error?: string }>, onSuccess?: () => void) {
    setError("");
    startTransition(async () => {
      const result = await action();
      if (result.ok) onSuccess?.();
      else setError(result.error || "Något gick fel.");
    });
  }

  function saveEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    run(() => updateInvitationEmail(id, value), () => setEditing(null));
  }

  function saveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    run(() => updateInvitationNote(id, note), () => setEditing(null));
  }

  const linkClass = "text-sm font-semibold text-sea underline disabled:opacity-50";
  return (
    <div className="space-y-2">
      {editing === "note" ? (
        <form onSubmit={saveNote} className="space-y-2">
          <label className="block text-sm font-semibold" htmlFor={`note-${id}`}>Personlig hälsning till {groupName}</label>
          <textarea id={`note-${id}`} rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} className="w-full rounded-lg border border-ink/50 bg-white px-3 py-2 text-sm" />
          <div className="flex gap-3">
            <button disabled={pending} type="submit" className={linkClass}>Spara</button>
            <button type="button" onClick={() => { setEditing(null); setNote(personalNote ?? ""); }} className={linkClass}>Avbryt</button>
          </div>
        </form>
      ) : editing === "email" ? (
        <form onSubmit={saveEmail} className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor={`email-${id}`}>E-post för {groupName}</label>
          <input id={`email-${id}`} type="email" maxLength={200} value={value} onChange={(e) => setValue(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-ink/50 bg-white px-3 py-2 text-sm" />
          <button disabled={pending} type="submit" className={linkClass}>Spara</button>
          <button type="button" onClick={() => { setEditing(null); setValue(email ?? ""); }} className={linkClass}>Avbryt</button>
        </form>
      ) : (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <button type="button" onClick={() => setEditing("email")} className={linkClass}>{email ? "Ändra e-post" : "Lägg till e-post"}</button>
          <button type="button" onClick={() => setEditing("note")} className={linkClass}>{personalNote ? "Ändra hälsning" : "Lägg till hälsning"}</button>
          {status === "pending" && <button disabled={pending} type="button" onClick={() => run(() => setInvitationSent(id, true))} className={linkClass}>Markera som skickad</button>}
          {status === "sent" && <button disabled={pending} type="button" onClick={() => run(() => setInvitationSent(id, false))} className={linkClass}>Ångra skickad</button>}
          <button disabled={pending} type="button" onClick={() => { if (window.confirm(`Ta bort ${groupName} och alla deras svar?`)) run(() => deleteInvitation(id)); }} className="text-sm font-semibold text-red-800 underline disabled:opacity-50">Ta bort</button>
        </div>
      )}
      {error && <p className="text-sm font-semibold text-red-800" role="alert">{error}</p>}
    </div>
  );
}
