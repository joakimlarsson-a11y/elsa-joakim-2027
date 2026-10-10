"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function RSVPForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/rsvp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Något gick fel.");
      setStatus("success");
      form.reset();
    } catch (submitError) {
      setStatus("error");
      setError(submitError instanceof Error ? submitError.message : "Något gick fel. Försök igen.");
    }
  }

  if (status === "success") return <div className="rounded-2xl bg-sky p-8" role="status"><p className="eyebrow text-plum">Tack för ditt svar</p><h3 className="mt-3 font-display text-4xl">Vi ses på vår stora dag!</h3><p className="mt-3 leading-7 text-ink/75">En bekräftelse har skickats till din e-post.</p></div>;

  return (
    <form onSubmit={submit} className="space-y-8 rounded-2xl bg-mist p-6 sm:p-10">
      <fieldset className="space-y-5"><legend className="font-display text-3xl">Om dig</legend><div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-semibold">Namn<input required name="name" type="text" autoComplete="name" className="mt-2 w-full rounded-lg border border-ink/20 bg-white px-4 py-3 font-normal" /></label><label className="block text-sm font-semibold">E-post<input required name="email" type="email" autoComplete="email" className="mt-2 w-full rounded-lg border border-ink/20 bg-white px-4 py-3 font-normal" /></label></div><label className="block text-sm font-semibold">Medföljande gäster (namn)<span className="ml-2 font-normal text-ink/55">valfritt</span><input name="guests" type="text" className="mt-2 w-full rounded-lg border border-ink/20 bg-white px-4 py-3 font-normal" /></label></fieldset>
      <fieldset className="space-y-4"><legend className="font-display text-3xl">Deltagande</legend><div className="flex flex-wrap gap-3"><label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-ink/20 bg-white px-4"><input required name="attendance" type="radio" value="Kommer" />Kommer gärna</label><label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-ink/20 bg-white px-4"><input required name="attendance" type="radio" value="Kan ej komma" />Kan tyvärr inte komma</label></div></fieldset>
      <fieldset className="space-y-5"><legend className="font-display text-3xl">Busstransport</legend><div className="flex gap-3"><label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-ink/20 bg-white px-4"><input required name="bus" type="radio" value="Ja" />Ja tack</label><label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-ink/20 bg-white px-4"><input required name="bus" type="radio" value="Nej" />Nej tack</label></div><label className="block max-w-xs text-sm font-semibold">Antal bussplatser<span className="ml-2 font-normal text-ink/55">om du åker med</span><input name="bus_seats" type="number" min="0" max="20" defaultValue="0" className="mt-2 w-full rounded-lg border border-ink/20 bg-white px-4 py-3 font-normal" /></label></fieldset>
      <label className="block text-sm font-semibold">Allergier eller specialkost<span className="ml-2 font-normal text-ink/55">valfritt</span><textarea name="allergies" rows={3} className="mt-2 w-full rounded-lg border border-ink/20 bg-white px-4 py-3 font-normal" /></label>
      {status === "error" && <p className="text-sm font-semibold text-red-800" role="alert">{error}</p>}
      <button disabled={status === "loading"} type="submit" className="button-primary w-full rounded-full bg-plum px-7 py-3 font-semibold text-white disabled:cursor-wait disabled:opacity-60">{status === "loading" ? "Skickar…" : "Skicka min OSA"}</button>
    </form>
  );
}
