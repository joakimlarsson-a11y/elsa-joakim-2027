"use client";

import { useState, useTransition } from "react";
import { deleteGuest, type GuestSource } from "../actions";

type Props = { source: GuestSource; id: string; name: string };

export default function DeleteGuestButton({ source, id, name }: Props) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function remove() {
    if (!window.confirm(`Ta bort ${name} från gästlistan?`)) return;
    setError("");
    startTransition(async () => {
      const result = await deleteGuest(source, id);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <>
      <button type="button" disabled={pending} onClick={remove} className="text-sm font-semibold text-red-800 underline disabled:opacity-50">
        {pending ? "Tar bort…" : "Ta bort"}<span className="sr-only"> {name}</span>
      </button>
      {error && <p className="mt-1 text-sm font-semibold text-red-800" role="alert">{error}</p>}
    </>
  );
}
