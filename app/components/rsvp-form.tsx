"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { inputClass, radioClass } from "./form-styles";
import RsvpSuccess from "./rsvp-success";

type Status = "idle" | "loading" | "success" | "error";
type Bus = "" | "Ja" | "Nej";
type Person = { id: number; name: string; email: string; allergies: string; bus: Bus };

const MAX_PERSONS = 10;

const emptyPerson = (id: number): Person => ({ id, name: "", email: "", allergies: "", bus: "" });

export default function RSVPForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [persons, setPersons] = useState<Person[]>(() => [emptyPerson(0)]);
  const [sentNames, setSentNames] = useState("");
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
      const first = persons.map((person) => person.name.trim().split(/\s+/)[0]).filter(Boolean);
      setSentNames(first.length > 1 ? `${first.slice(0, -1).join(", ")} & ${first[first.length - 1]}` : first[0] ?? "");
      setStatus("success");
      setPersons([emptyPerson(nextId.current++)]);
    } catch (submitError) {
      setStatus("error");
      setError(submitError instanceof Error ? submitError.message : "Något gick fel. Försök igen.");
    }
  }

  if (status === "success") {
    return (
      <RsvpSuccess heading={sentNames ? `Skål, ${sentNames}!` : "Skål!"} attending action={<button type="button" onClick={() => setStatus("idle")} className="btn-quiet text-ink">Anmäl ett sällskap till</button>}>
        <p>Vi ses den 19 juni. En bekräftelse är på väg till er e-post.</p>
      </RsvpSuccess>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-8 bg-paper p-6 sm:p-10">
      <p className="leading-7 text-ink/80">Fyll i uppgifter för varje person som ska komma. E-post behövs för alla – då kan vi skicka en bekräftelse och nå er om något ändras.</p>

      <ol className="space-y-6">
        {persons.map((person, index) => {
          const prefix = `person-${person.id}`;
          const label = index === 0 ? "Person 1 (du)" : `Person ${index + 1}`;
          return (
            <li key={person.id}>
              <fieldset className="space-y-5 border border-ink/15 p-5 sm:p-6">
                <legend className="px-1 font-display text-3xl">{label}</legend>
                <label htmlFor={`${prefix}-name`} className="block text-sm font-medium">Namn
                  <input id={`${prefix}-name`} required type="text" autoComplete={index === 0 ? "name" : "off"} value={person.name} onChange={(e) => update(person.id, { name: e.target.value })} className={inputClass} />
                </label>
                <label htmlFor={`${prefix}-email`} className="block text-sm font-medium">E-post
                  {index > 0 && <span id={`${prefix}-email-hint`} className="mt-1 block font-normal text-ink/75">Barn utan egen e-post – ange förälderns.</span>}
                  <input id={`${prefix}-email`} required type="email" autoComplete={index === 0 ? "email" : "off"} aria-describedby={index > 0 ? `${prefix}-email-hint` : undefined} value={person.email} onChange={(e) => update(person.id, { email: e.target.value })} className={inputClass} />
                </label>
                <label htmlFor={`${prefix}-allergies`} className="block text-sm font-medium">Allergier eller specialkost<span className="ml-2 font-normal text-ink/70">valfritt</span>
                  <textarea id={`${prefix}-allergies`} rows={2} value={person.allergies} onChange={(e) => update(person.id, { allergies: e.target.value })} className={inputClass} />
                </label>
                <fieldset className="space-y-3">
                  <legend className="text-sm font-medium">{index === 0 ? "Vill du åka med bussen från kyrkan?" : `Vill ${person.name.trim().split(/\s+/)[0] || "personen"} åka med bussen från kyrkan?`}</legend>
                  <div className="flex flex-wrap gap-3">
                    <label className={radioClass}><input required name={`${prefix}-bus`} type="radio" value="Ja" checked={person.bus === "Ja"} onChange={() => update(person.id, { bus: "Ja" })} />Ja tack</label>
                    <label className={radioClass}><input required name={`${prefix}-bus`} type="radio" value="Nej" checked={person.bus === "Nej"} onChange={() => update(person.id, { bus: "Nej" })} />Nej tack</label>
                  </div>
                </fieldset>
                {index > 0 && <button type="button" onClick={() => removePerson(person.id)} className="text-sm text-ink underline decoration-1 underline-offset-4">Ta bort {person.name.trim() || label.toLowerCase()}</button>}
              </fieldset>
            </li>
          );
        })}
      </ol>

      {persons.length < MAX_PERSONS && <button ref={addButtonRef} type="button" onClick={addPerson} className="btn border border-ink text-ink hover:bg-ink hover:text-paper">+ Lägg till person</button>}

      {status === "error" && <p className="text-sm font-medium text-red-800" role="alert">{error}</p>}
      <button disabled={status === "loading"} type="submit" className="btn btn-primary w-full disabled:cursor-wait disabled:opacity-60">{status === "loading" ? "Skickar…" : "Skicka min OSA"}</button>
    </form>
  );
}
