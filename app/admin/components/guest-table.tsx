"use client";

import { useId, useMemo, useState } from "react";
import DeleteGuestButton from "./delete-guest-button";

export type GuestRow = {
  key: string;
  /** 1-based signup order (oldest first). */
  order: number;
  source: "invitation" | "open";
  id: string;
  name: string;
  origin: string;
  detail: string | null;
  attending: boolean | null;
  bus: boolean | null;
  dietary: string | null;
  message: string | null;
};

type SortKey = "order" | "name" | "origin" | "attending" | "bus" | "dietary";
type SortDirection = "ascending" | "descending";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "order", label: "#" },
  { key: "name", label: "Namn" },
  { key: "attending", label: "Kommer" },
  { key: "bus", label: "Buss" },
  { key: "dietary", label: "Allergier & specialkost" },
  { key: "origin", label: "Sällskap" }
];

const collator = new Intl.Collator("sv", { sensitivity: "base", numeric: true });

const booleanRank = (value: boolean | null) => (value === true ? 0 : value === false ? 1 : null);

function sortValue(guest: GuestRow, key: SortKey): string | number | null {
  switch (key) {
    case "order":
      return guest.order;
    case "name":
      return guest.name;
    case "origin":
      return guest.origin;
    case "attending":
      return booleanRank(guest.attending);
    case "bus":
      return booleanRank(guest.bus);
    case "dietary":
      return guest.dietary?.trim() || null;
  }
}

/** Empty values always sort last, regardless of direction. */
function compareGuests(a: GuestRow, b: GuestRow, key: SortKey, direction: SortDirection) {
  const left = sortValue(a, key);
  const right = sortValue(b, key);
  if (left === null || right === null) {
    if (left === right) return collator.compare(a.name, b.name);
    return left === null ? 1 : -1;
  }
  const result = typeof left === "number" && typeof right === "number" ? left - right : collator.compare(String(left), String(right));
  if (result === 0) return collator.compare(a.name, b.name);
  return direction === "ascending" ? result : -result;
}

const normalize = (text: string) => text.toLocaleLowerCase("sv").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function matches(guest: GuestRow, query: string) {
  const haystack = normalize([guest.name, guest.origin, guest.detail, guest.dietary, guest.message].filter(Boolean).join(" "));
  return query.split(/\s+/).every((term) => haystack.includes(term));
}

const BADGE_CLASS = {
  yes: "bg-emerald-50 text-emerald-800 ring-emerald-700/20",
  no: "bg-red-50 text-red-800 ring-red-700/20",
  waiting: "bg-white text-ink/70 ring-ink/15"
} as const;

function AnswerBadge({ value, emptyLabel }: { value: boolean | null; emptyLabel: string }) {
  if (value === null && !emptyLabel) return <>–</>;
  const tone = value === true ? "yes" : value === false ? "no" : "waiting";
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${BADGE_CLASS[tone]}`}>
      {value === true ? "Ja" : value === false ? "Nej" : emptyLabel}
    </span>
  );
}

function SortIcon({ direction }: { direction: SortDirection | null }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 16" className={`ml-1.5 inline-block h-3.5 w-2.5 align-[-2px] ${direction ? "text-sea" : "text-ink/30"}`} fill="currentColor">
      {direction !== "descending" && <path d="M6 1 11 7H1z" />}
      {direction !== "ascending" && <path d="M6 15 1 9h10z" />}
    </svg>
  );
}

type Props = { guests: GuestRow[]; emptyMessage: string };

export default function GuestTable({ guests, emptyMessage }: Props) {
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({ key: "order", direction: "ascending" });

  const normalizedQuery = normalize(query.trim());
  const rows = useMemo(() => {
    const filtered = normalizedQuery ? guests.filter((guest) => matches(guest, normalizedQuery)) : guests;
    return [...filtered].sort((a, b) => compareGuests(a, b, sort.key, sort.direction));
  }, [guests, normalizedQuery, sort]);

  function toggleSort(key: SortKey) {
    setSort((current) =>
      current.key === key ? { key, direction: current.direction === "ascending" ? "descending" : "ascending" } : { key, direction: "ascending" }
    );
  }

  if (guests.length === 0) {
    return <p className="mt-6 rounded-2xl bg-shell p-6 text-ink/70">{emptyMessage}</p>;
  }

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
        <label htmlFor={searchId} className="sr-only">Sök i gästlistan</label>
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Sök namn, sällskap, specialkost…"
          autoComplete="off"
          spellCheck={false}
          className="w-full max-w-sm rounded-full border border-ink/20 bg-white px-4 py-2 text-sm text-ink placeholder:text-ink/50 focus:border-sea"
        />
        <p className="text-sm text-ink/70" role="status" aria-live="polite">
          {normalizedQuery ? `${rows.length} av ${guests.length} gäster` : `${guests.length} gäster`}
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-shell p-6 text-ink/70">Inga gäster matchar ”{query.trim()}”.</p>
      ) : (
        <div className="relative mt-4 overflow-x-auto rounded-2xl bg-white shadow-soft">
          <table className="w-full min-w-[860px] text-left text-sm">
            <caption className="sr-only">Gästlista, {rows.length} personer. Kolumnrubrikerna är knappar som sorterar tabellen.</caption>
            <thead className="border-b border-ink/10 bg-shell text-xs uppercase tracking-wider text-ink/70">
              <tr>
                {COLUMNS.map((column) => {
                  const direction = sort.key === column.key ? sort.direction : null;
                  return (
                    <th key={column.key} scope="col" aria-sort={direction ?? undefined} className="p-0">
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className={`block w-full whitespace-nowrap p-4 text-left uppercase tracking-wider hover:text-ink ${direction ? "text-ink" : ""}`}
                      >
                        {column.label}
                        <SortIcon direction={direction} />
                      </button>
                    </th>
                  );
                })}
                <th scope="col" className="p-4"><span className="sr-only">Åtgärder</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((guest) => (
                <tr key={guest.key} className="border-b border-ink/10 align-top last:border-0">
                  <td className="p-4 tabular-nums text-ink/60">{guest.order}</td>
                  <th scope="row" className="p-4 font-semibold">
                    {guest.name}
                    {guest.message && <span className="mt-1 block font-normal italic text-ink/70">”{guest.message}”</span>}
                  </th>
                  <td className="p-4"><AnswerBadge value={guest.attending} emptyLabel="Väntar" /></td>
                  <td className="p-4"><AnswerBadge value={guest.bus} emptyLabel="" /></td>
                  <td className="p-4">{guest.dietary ?? "–"}</td>
                  <td className="p-4">{guest.origin}{guest.detail && <span className="block text-ink/60">{guest.detail}</span>}</td>
                  <td className="whitespace-nowrap p-4 text-right"><DeleteGuestButton source={guest.source} id={guest.id} name={guest.name} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
