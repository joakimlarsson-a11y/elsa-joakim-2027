"use client";

import { useRef, useState } from "react";
import NewInvitationForm from "./new-invitation-form";

export default function NewInvitationDialog({ origin }: { origin: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [formKey, setFormKey] = useState(0);

  function open() {
    setFormKey((key) => key + 1);
    dialogRef.current?.showModal();
  }

  return (
    <>
      <button type="button" onClick={open} aria-haspopup="dialog" className="button-primary rounded-full bg-sea px-7 py-3 font-semibold text-white">
        Bjud in sällskap
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="new-title"
        aria-describedby="new-description"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-3xl bg-white p-0 text-ink shadow-soft backdrop:bg-ink/50"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <h2 id="new-title" className="font-display text-4xl text-ink">Nytt sällskap</h2>
            <form method="dialog">
              <button type="submit" className="rounded-full border border-sea px-4 py-2 text-sm font-semibold text-sea">
                Stäng<span className="sr-only"> dialogen</span>
              </button>
            </form>
          </div>
          <p id="new-description" className="mb-6 mt-4 leading-7 text-ink/70">Efter att sällskapet sparats kopierar ni länken eller ett färdigt meddelande och skickar det själva via SMS, Messenger eller liknande. Sällskapet markeras som skickat när ni kopierar.</p>
          <NewInvitationForm key={formKey} origin={origin} />
        </div>
      </dialog>
    </>
  );
}
