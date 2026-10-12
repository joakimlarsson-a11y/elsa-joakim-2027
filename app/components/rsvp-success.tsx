"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";

type Props = { heading: string; children: ReactNode; attending: boolean; action?: ReactNode };

/** Kvitto efter OSA. Tar fokus så att skärmläsare och tangentbord hamnar rätt. */
export default function RsvpSuccess({ heading, children, attending, action }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div ref={ref} tabIndex={-1} role="status" className="overflow-hidden rounded-2xl bg-white shadow-soft outline-none sm:grid sm:grid-cols-[14rem_1fr]">
      {attending && (
        <div className="relative aspect-[4/3] sm:aspect-auto">
          <Image src="/photos/bubbel.jpg" alt="" fill sizes="(min-width: 640px) 224px, 100vw" className="object-cover" />
        </div>
      )}
      <div className="p-7 sm:p-9">
        <h3 className="font-display text-4xl leading-tight text-ink">{heading}</h3>
        <div className="mt-4 space-y-3 leading-7 text-ink/80">{children}</div>
        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
          {attending && <a href="/kalender.ics" className="inline-flex min-h-12 items-center rounded-full bg-ember px-6 font-semibold text-white">Lägg till i kalendern</a>}
          {action}
        </div>
      </div>
    </div>
  );
}
