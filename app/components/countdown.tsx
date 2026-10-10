"use client";

import { useEffect, useState } from "react";

const weddingDate = new Date("2027-06-19T14:00:00+02:00").getTime();

type Remaining = { days: number; hours: number; minutes: number; seconds: number };

function getRemaining(): Remaining {
  const diff = Math.max(0, weddingDate - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60)
  };
}

const units: { key: keyof Remaining; label: string }[] = [
  { key: "days", label: "Dagar" },
  { key: "hours", label: "Timmar" },
  { key: "minutes", label: "Minuter" },
  { key: "seconds", label: "Sekunder" }
];

export default function Countdown() {
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    setRemaining(getRemaining());
    const timer = setInterval(() => setRemaining(getRemaining()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div aria-label="Nedräkning till bröllopet" role="timer" className="flex gap-3 sm:gap-4">
      {units.map(({ key, label }) => (
        <div key={key} className="min-w-[4.5rem] rounded-2xl border border-white/25 bg-white/10 px-3 py-3 text-center backdrop-blur-sm sm:min-w-[5.5rem]">
          <p className="font-display text-3xl tabular-nums sm:text-4xl">{remaining ? String(remaining[key]).padStart(2, "0") : "--"}</p>
          <p className="eyebrow mt-1 text-[.6rem] text-lavender">{label}</p>
        </div>
      ))}
    </div>
  );
}
