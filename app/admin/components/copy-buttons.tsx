"use client";

import { useState } from "react";
import { setInvitationSent } from "../actions";

type Props = { id: string; status: string; link: string; message: string };

export default function CopyButtons({ id, status, link, message }: Props) {
  const [copied, setCopied] = useState<"link" | "message" | null>(null);
  const [fallback, setFallback] = useState<string | null>(null);

  async function copy(kind: "link" | "message") {
    const text = kind === "link" ? link : message;
    try {
      await navigator.clipboard.writeText(text);
      setFallback(null);
      setCopied(kind);
      setTimeout(() => setCopied((current) => (current === kind ? null : current)), 2000);
    } catch {
      setFallback(text);
      return;
    }
    if (status === "pending") await setInvitationSent(id, true);
  }

  const buttonClass = "rounded-full border border-plum px-4 py-2 text-sm font-semibold text-plum hover:bg-lavender/40";
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => copy("link")} className={buttonClass}>{copied === "link" ? "Kopierad!" : "Kopiera länk"}</button>
        <button type="button" onClick={() => copy("message")} className={buttonClass}>{copied === "message" ? "Kopierad!" : "Kopiera meddelande"}</button>
      </div>
      <span className="sr-only" role="status">{copied ? "Kopierat till urklipp" : ""}</span>
      {fallback && (
        <label className="block text-xs text-ink/70">Kunde inte kopiera automatiskt – markera och kopiera:
          <textarea readOnly rows={3} value={fallback} onFocus={(e) => e.currentTarget.select()} autoFocus className="mt-1 w-full rounded-lg border border-ink/20 bg-white p-2 text-sm text-ink" />
        </label>
      )}
    </div>
  );
}
