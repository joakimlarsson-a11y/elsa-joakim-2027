"use client";

import { FormEvent, useState, useTransition } from "react";
import { inputClass } from "../../components/form-styles";
import { sendMagicLink } from "./actions";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await sendMagicLink(email);
      if (result.ok) setSent(true);
      else setError(result.error);
    });
  }

  if (sent) {
    return <div className="rounded-2xl bg-foam p-8" role="status"><p className="eyebrow text-sea">Kolla din inkorg</p><p className="mt-3 leading-7 text-ink/80">Om adressen är godkänd har vi skickat en inloggningslänk till <strong>{email}</strong>.</p></div>;
  }

  return (
    <form onSubmit={submit} className="space-y-6 rounded-2xl bg-shell p-6 sm:p-10">
      <label htmlFor="admin-email" className="block text-sm font-semibold">E-post
        <input id="admin-email" required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
      </label>
      {error && <p className="text-sm font-semibold text-red-800" role="alert">{error}</p>}
      <button disabled={pending} type="submit" className="button-primary w-full rounded-full bg-sea px-7 py-3 font-semibold text-white disabled:cursor-wait disabled:opacity-60">{pending ? "Skickar…" : "Skicka inloggningslänk"}</button>
    </form>
  );
}
