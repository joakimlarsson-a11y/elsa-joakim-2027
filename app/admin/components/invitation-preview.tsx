import Image from "next/image";
import { heroCopy } from "@/lib/invitation-copy";
import heroVigsel from "@/public/photos/hero-vigsel.jpg";

type Props = { guestNames: string[]; groupName: string; personalNote: string };

/** Nedskalad kopia av startsidans hero, så som gästen ser den innan de svarat. */
export default function InvitationPreview({ guestNames, groupName, personalNote }: Props) {
  const { salutation, intro, ctaLabel } = heroCopy({ guestNames, groupName, responded: false, thankYou: false });
  const note = personalNote.trim();

  return (
    <div className="on-dark relative isolate overflow-hidden rounded-2xl bg-ink text-white shadow-soft">
      <Image src={heroVigsel} alt="" fill sizes="(min-width: 1024px) 560px, 100vw" className="-z-20 object-cover object-[center_18%]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/55 via-ink/45 to-ink/90" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/45 to-transparent to-60%" />
      <div className="px-6 pb-8 pt-16 sm:px-8">
        <p className="font-display text-5xl leading-[.95]">Elsa <span className="font-accent text-dusk">&</span> Joakim</p>
        <p className="mt-3 font-display text-xl">Lördag 19 juni 2027</p>
        {salutation && <p className="mt-6 font-accent text-2xl leading-tight text-dusk">{salutation}</p>}
        <p className="mt-2 text-base leading-7 text-white/90">{intro}</p>
        {note && <p className="mt-4 break-words border-l border-dusk/60 pl-4 font-accent text-xl leading-snug text-dusk">{note}</p>}
        <span className="btn btn-primary mt-6 text-sm">{ctaLabel}</span>
      </div>
    </div>
  );
}
