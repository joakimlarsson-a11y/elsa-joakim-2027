"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { inputClass, radioClass } from "./form-styles";

type Status = "idle" | "loading" | "success" | "error";
type Bus = "" | "Ja" | "Nej";
type Person = { id: number; name: string; email: string; allergies: string; bus: Bus };

const MAX_PERSONS = 10;

const emptyPerson = (id: number): Person => ({ id, name: "", email: "", allergies: "", bus: "" });

export default function RSVPForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [persons, setPersons] = useState<Person[]>(() => [emptyPerson(0)]);
  const nextId = useRef(1);
  const [focusTarget, setFocusTarget] = useState<number | "add" | null>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (focusTarget === null) return;
    if (focusTarget === "add") addButtonRef.current?.focus();
    else document.getElementById(`person-${focusTarget}-name`)?.focus();
    setFocusTarget(null);
  }, [focusTarget]);

  function update(id: number, changes: Partial<Omit<Person, "id">>) {
    setPersons((current) => current.map((person) => (person.id === id ? { ...person, ...changes } : person)));
  }

  function addPerson() {
    const person = emptyPerson(nextId.current++);
    setPersons((current) => [...current, person]);
    setFocusTarget(person.id);
  }

  function removePerson(id: number) {
    setPersons((current) => current.filter((person) => person.id !== id));
    setFocusTarget("add");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const body = { persons: persons.map(({ name, email, allergies, bus }) => ({ name, email, allergies, bus })) };
      const response = await fetch("/api/rsvp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Något gick fel.");
      setStatus("success");
      setPersons([emptyPerson(nextId.current++)]);
    } catch (submitError) {
      setStatus("error");
      setError(submitError instanceof Error ? submitError.message : "Något gick fel. Försök igen.");
    }
  }

  if (status === "success") return <div className="rounded-2xl bg-sky p-8" role="status"><p className="eyebrow text-plum">Tack för ditt svar</p><h3 className="mt-3 font-display text-4xl">Vi ses på vår stora dag!</h3><p className="mt-3 leading-7 text-ink/75">En bekräftelse har skickats till din e-post.</p></div>;

  return (
    <form onSubmit={submit} className="space-y-8 rounded-2xl bg-mist p-6 sm:p-10">
      <p className="leading-7 text-ink/75">Fyll i uppgifter för varje person som ska komma. Lägg till fler personer om ni är flera i sällskapet.</p>

      <ol className="space-y-6">
        {persons.map((person, index) => {
          const prefix = `person-${person.id}`;
          const label = index === 0 ? "Person 1 (du)" : `Person ${index + 1}`;
          return (
            <li key={person.id}>
              <fieldset className="space-y-5 rounded-xl border border-ink/15 bg-white/60 p-5 sm:p-6">
                <legend className="px-1 font-display text-3xl">{label}</legend>
                <label htmlFor={`${prefix}-name`} className="block text-sm font-semibold">Namn
                  <input id={`${prefix}-name`} required type="text" autoComplete={index === 0 ? "name" : "off"} value={person.name} onChange={(e) => update(person.id, { name: e.target.value })} className={inputClass} />
                </label>
                <label htmlFor={`${prefix}-email`} className="block text-sm font-semibold">E-post
                  <input id={`${prefix}-email`} required type="email" autoComplete={index === 0 ? "email" : "off"} value={person.email} onChange={(e) => update(person.id, { email: e.target.value })} className={inputClass} />
                </label>
                <label htmlFor={`${prefix}-allergies`} className="block text-sm font-semibold">Allergier eller specialkost<span className="ml-2 font-normal text-ink/70">valfritt</span>
                  <textarea id={`${prefix}-allergies`} rows={2} value={person.allergies} onChange={(e) => update(person.id, { allergies: e.target.value })} className={inputClass} />
                </label>
                <fieldset className="space-y-3">
                  <legend className="text-sm font-semibold">Vill åka med bussen?</legend>
                  <div className="flex flex-wrap gap-3">
                    <label className={radioClass}><input required name={`${prefix}-bus`} type="radio" value="Ja" checked={person.bus === "Ja"} onChange={() => update(person.id, { bus: "Ja" })} />Ja tack</label>
                    <label className={radioClass}><input required name={`${prefix}-bus`} type="radio" value="Nej" checked={person.bus === "Nej"} onChange={() => update(person.id, { bus: "Nej" })} />Nej tack</label>
                  </div>
                </fieldset>
                {index > 0 && <button type="button" onClick={() => removePerson(person.id)} className="text-sm font-semibold text-plum underline">Ta bort {person.name.trim() || label.toLowerCase()}</button>}
              </fieldset>
            </li>
          );
        })}
      </ol>

      {persons.length < MAX_PERSONS && <button ref={addButtonRef} type="button" onClick={addPerson} className="rounded-full border border-plum px-6 py-3 font-semibold text-plum">+ Lägg till person</button>}

      {status === "error" && <p className="text-sm font-semibold text-red-800" role="alert">{error}</p>}
      <button disabled={status === "loading"} type="submit" className="button-primary w-full rounded-full bg-plum px-7 py-3 font-semibold text-white disabled:cursor-wait disabled:opacity-60">{status === "loading" ? "Skickar…" : "Skicka min OSA"}</button>
    </form>
  );
}
