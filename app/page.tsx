import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { firstNames, mapLink, SCHEDULE, soloFirstName, TOASTMADAME_EMAIL, VENUES, WEDDING } from "@/lib/site";
import ExternalLink from "./components/external-link";
import MobileNav from "./components/mobile-nav";
import RSVPForm from "./components/rsvp-form";
import ScrollReveal from "./components/scroll-reveal";
import Shoreline from "./components/shoreline";
import InvitationRsvpForm from "./osa/invitation-rsvp-form";
import { loadInvitation } from "./osa/load-invitation";

type HomeProps = { searchParams: Promise<{ token?: string | string[] }> };

export async function generateMetadata({ searchParams }: HomeProps): Promise<Metadata> {
  const { token } = await searchParams;
  // Personliga länkar ska inte indexeras.
  return token ? { robots: { index: false, follow: false } } : {};
}

const story = [
  { src: "/photos/selfie.jpg", alt: "Elsa och Joakim lutar huvudena mot varandra och ler", caption: "Vi två." },
  { src: "/photos/familj.jpg", alt: "Elsa och Joakim med sin dotter i en grön trädgård", caption: "Och så blev vi fler." },
  { src: "/photos/bubbel.jpg", alt: "Elsa och Joakim skålar i bubbel på klipporna vid havet", caption: "Bubbel på klipporna. Havet är vårt ställe." },
  { src: "/photos/midsommar.jpg", alt: "Elsa och Joakim med blomsterkransar på midsommar", caption: "Midsommar, med kransar." },
  { src: "/photos/hyrox.jpg", alt: "Elsa och Joakim spänner musklerna efter målgång på Hyrox", caption: "Hyrox. Vi tog oss i mål, tillsammans." },
  { src: "/photos/kyss.jpg", alt: "Elsa och Joakim kysser varandra framför en grön häck", caption: "Ja, vi gillar varandra." },
  { src: "/photos/solnedgang.jpg", alt: "Elsa och Joakim ler i solen på en uteservering", caption: "Sena eftermiddagar i solen." },
  { src: "/photos/smoking.jpg", alt: "Elsa och Joakim med sin son, klädda i festkläder", caption: "Uppklädda, alla tre." },
  { src: "/photos/skratt.jpg", alt: "Elsa och Joakim skrattar mot varandra i festkläder", caption: "Snart skrattar vi med er." }
];

const navLinks = [
  { href: "#dagen", label: "Dagen" },
  { href: "#hitta-hit", label: "Hitta hit" },
  { href: "#fragor", label: "Frågor" },
  { href: "#osa", label: "OSA" }
];

const faqs = [
  { q: "När behöver vi svara?", a: `Senast den ${WEDDING.rsvpBy}. Svara via formuläret längre ner. En anmälan per sällskap räcker.` },
  ...(WEDDING.dressCode ? [{ q: "Vad har vi på oss?", a: `Klädkoden är ${WEDDING.dressCode.toLowerCase()}. ${WEDDING.dressCodeNote}`.trim() }] : []),
  ...(WEDDING.children ? [{ q: "Får barnen följa med?", a: WEDDING.children }] : []),
  { q: "Hur tar vi oss mellan kyrkan och festen?", a: "Vi ordnar buss som avgår direkt från Ölmevalla Kyrka efter ceremonin. Ange i OSA:n vilka som vill åka med." },
  { q: "Hur tar vi oss hem?", a: "Vi har ingen buss tillbaka. Från Långedrag går spårvagn 11 in mot centrala Göteborg, och taxi går förstås också bra. Boka gärna i förväg." },
  { q: "Jag vill hålla tal eller ordna ett spex. Vem kontaktar jag?", a: "Hör av dig till vår toastmadame Jenny Bergdahl i god tid, så hjälper hon dig att planera in det under kvällen." },
  { q: "Jag har allergier eller äter specialkost.", a: "Skriv det i OSA-formuläret, för var och en i sällskapet, så ser vi till att köket vet om det." },
  { q: "Önskar ni er några presenter?", a: "Er närvaro är den finaste presenten. Den som ändå vill får gärna bidra till vår resa." },
  { q: "Jag har en annan fråga.", a: "Kontakta Jenny Bergdahl. Mer om henne hittar du under Toastmadame." }
];

const h2 = "font-display text-[clamp(2.5rem,9vw,4rem)] leading-[1] [hyphens:auto]";

function delay(ms: number) {
  return { "--reveal-delay": `${ms}ms` } as CSSProperties;
}

function stockholmDay(date: Date) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm" }).format(date);
}

function daysLeft(now: Date) {
  const today = Date.parse(`${stockholmDay(now)}T00:00:00Z`);
  const wedding = Date.parse(`${WEDDING.start.slice(0, 10)}T00:00:00Z`);
  return Math.round((wedding - today) / 86_400_000);
}

function countdownText(days: number) {
  if (days === 0) return "Det är i dag!";
  if (days === 1) return "I morgon är det dags.";
  return `${days.toLocaleString("sv-SE")} dagar kvar.`;
}

export default async function Home({ searchParams }: HomeProps) {
  const { token: rawToken } = await searchParams;
  const token = typeof rawToken === "string" ? rawToken.trim() : "";
  const invitation = token ? await loadInvitation(token) : null;
  const guestNames = invitation?.guests.map((guest) => guest.name) ?? [];
  const solo = invitation ? Boolean(soloFirstName(guestNames)) : false;
  const names = invitation ? firstNames(guestNames) ?? invitation.group_name : null;
  const responded = invitation?.status === "responded";

  const now = new Date();
  const thankYou = now >= new Date(WEDDING.thankYouFrom);
  const days = daysLeft(now);

  const youAll = solo ? "du" : "ni";
  const ctaLabel = responded ? `${solo ? "Du" : "Ni"} har svarat. Ändra svaret` : solo ? "Svara på inbjudan" : names ? `Svara för ${names}` : "OSA här";
  const salutation = thankYou ? (names ? `Tack, ${names}!` : "Tack för att ni firade med oss!") : names ? `Kära ${names},` : null;

  return (
    <main className="overflow-x-clip">
      <ScrollReveal />

      <section id="top" className="on-dark relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-ink text-white">
        <Image src="/photos/hero-vigsel.jpg" alt="Elsa och Joakim håller hand, sedda bakifrån i en ljusupplyst festsal" fill priority sizes="100vw" className="hero-zoom -z-20 object-cover object-[center_18%]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/45 via-ink/25 to-ink/90" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/45 to-transparent to-60%" />
        <nav className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 lg:px-10" aria-label="Huvudnavigation">
          <a className="font-display text-2xl" href="#top" aria-label="Elsa och Joakim, till toppen">E<span className="font-accent text-dusk">&</span>J</a>
          <ul className="hidden gap-8 text-sm tracking-[.02em] md:flex">
            {navLinks.map((link) => (
              <li key={link.href}><a href={link.href} className="underline-offset-[8px] decoration-1 hover:underline">{link.label}</a></li>
            ))}
          </ul>
        </nav>

        <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end px-6 pb-16 pt-24 lg:px-10 lg:pb-24">
          <h1 style={delay(150)} className="hero-rise font-display text-[clamp(3.75rem,16vw,6rem)] leading-[.95]">
            Elsa <span className="font-accent text-dusk">&</span> Joakim
            <span className="sr-only">{thankYou ? ", tack för att ni firade med oss" : " förnyar sina löften 19 juni 2027"}</span>
          </h1>
          {!thankYou && (
            <p className="hero-rise mt-4 font-display text-2xl text-white sm:text-3xl" style={delay(300)}>Lördag 19 juni 2027</p>
          )}

          <div className="hero-rise mt-8 max-w-xl space-y-3 text-lg leading-8 text-white/90" style={delay(450)}>
            {salutation && <p className="font-accent text-3xl leading-tight text-dusk sm:text-4xl">{salutation}</p>}
            {thankYou ? (
              <p>Den 19 juni 2027 förnyade vi våra löften i Ölmevalla Kyrka och dansade in i natten på Långedrag. Tack för att {names ? youAll : "ni"} var där.</p>
            ) : (
              <>
                <p>Vi förnyar våra löften i Ölmevalla Kyrka och firar sedan vid havet på Långedrags Värdshus. {names ? `Vi vill så gärna att ${youAll} är med.` : "Varmt välkomna!"}</p>
                {invitation?.personal_note && <p className="!mt-5 border-l border-dusk/60 pl-5 font-accent text-2xl leading-snug text-dusk">{invitation.personal_note}</p>}
              </>
            )}
          </div>

          <div className="hero-rise mt-10 flex flex-wrap items-center gap-x-8 gap-y-4" style={delay(600)}>
            {thankYou ? (
              WEDDING.photoAlbumUrl && <ExternalLink href={WEDDING.photoAlbumUrl} className="btn btn-primary">Se bilderna från dagen</ExternalLink>
            ) : (
              <>
                <a href="#osa" className="btn btn-primary">{ctaLabel}</a>
                <p className="text-lg text-white/85">{countdownText(days)}</p>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 lg:px-10 lg:py-32" aria-labelledby="story-title">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-end">
          <h2 id="story-title" data-reveal="up" className={`${h2} text-ink`}>Vår historia, i bilder</h2>
          <p data-reveal="up" style={delay(120)} className="max-w-xl text-lg leading-8 text-ink/75">Vi har firat mycket tillsammans: midsommar, målgångar, solnedgångar och vanliga tisdagar. Nu vill vi fira det största av dem med er.</p>
        </div>
        <ul className="mt-14 columns-2 gap-4 md:columns-3 md:gap-6">
          {story.map((photo, index) => (
            <li key={photo.src} className="mb-6 break-inside-avoid md:mb-8">
              <figure data-reveal="develop" style={delay((index % 3) * 120)}>
                <Image src={photo.src} alt={photo.alt} width={750} height={1000} sizes="(min-width: 1152px) 360px, (min-width: 768px) 31vw, 46vw" className="h-auto w-full object-cover" />
                <figcaption className="mt-3 font-accent text-lg leading-snug text-ink/80 sm:text-xl">{photo.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </section>

      <Shoreline className="text-shell" />
      <section id="dagen" className="scroll-mt-4 bg-shell px-6 pb-24 pt-16 lg:px-10 lg:pb-32" aria-labelledby="schedule-title">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div data-reveal="up">
            <h2 id="schedule-title" className={`${h2} text-ink`}>Dagen</h2>
            <p className="mt-6 max-w-sm text-lg leading-8 text-ink/75">Från kyrkans valv till havsbrisen i Långedrag. Så här ser lördagen ut.</p>
            {!thankYou && <a href="/kalender.ics" className="btn-quiet mt-6 text-ink">Lägg till i kalendern</a>}
          </div>
          <div data-reveal="line" className="relative">
          <span className="timeline-line absolute inset-y-0 left-0 w-px bg-ink/25" aria-hidden="true" />
          <ol className="relative pl-8 sm:pl-12">
            {SCHEDULE.map((item, index) => (
              <li key={item.time} data-reveal="up" style={delay(index * 160)} className="relative pb-12 last:pb-0">
                <span className="reveal-dot absolute -left-[calc(2rem+3px)] top-4 h-[7px] w-[7px] rounded-full bg-ember ring-4 ring-shell sm:-left-[calc(3rem+3px)]" aria-hidden="true" />
                <p className="font-display text-4xl text-sea sm:text-5xl"><time dateTime={`2027-06-19T${item.time}`}>{item.time}</time></p>
                <h3 className="mt-2 text-xl font-medium text-ink">{item.title}</h3>
                <p className="text-ink/80">{item.place}</p>
                <p className="mt-2 max-w-md leading-7 text-ink/75">{item.text}</p>
              </li>
            ))}
            {WEDDING.endTime && (
              <li data-reveal="up" className="relative pt-12">
                <span className="reveal-dot absolute -left-[calc(2rem+3px)] top-[4rem] h-[7px] w-[7px] rounded-full border border-ink/50 bg-shell sm:-left-[calc(3rem+3px)]" aria-hidden="true" />
                <p className="font-display text-4xl text-sea sm:text-5xl">ca {WEDDING.endTime}</p>
                <h3 className="mt-2 text-xl font-medium text-ink">Kvällen tar slut</h3>
                <p className="mt-2 max-w-md leading-7 text-ink/75">Ingen buss tillbaka. Spårvagn 11 eller taxi tar er hem.</p>
              </li>
            )}
          </ol>
          </div>
        </div>
      </section>
      <Shoreline className="text-shell" flip />

      <section id="hitta-hit" className="mx-auto max-w-6xl scroll-mt-4 px-6 py-24 lg:px-10 lg:py-32" aria-labelledby="info-title">
        <h2 id="info-title" data-reveal="up" className={`${h2} max-w-2xl text-ink`}>Hitta hit</h2>
        <p data-reveal="up" style={delay(120)} className="mt-6 max-w-2xl text-lg leading-8 text-ink/75">Ceremonin är i Ölmevalla Kyrka söder om Kungsbacka. Därifrån tar bussen er till Långedrag i västra Göteborg, ungefär 40 minuter längs kusten.</p>
        <div className="mt-14 grid gap-x-8 gap-y-14 md:grid-cols-2">
          {[
            { venue: VENUES.church, what: "Ceremoni 14:00" },
            { venue: VENUES.party, what: "Mingel och middag från 16:30" }
          ].map(({ venue, what }, index) => (
            <article key={venue.name} className="flex flex-col">
              <div data-reveal="image" style={delay(index * 160)} className="relative aspect-[4/3] overflow-hidden bg-foam">
                <Image src={venue.image.src} alt={venue.image.alt} fill sizes="(min-width: 1152px) 540px, (min-width: 768px) 46vw, 100vw" className="object-cover" />
              </div>
              <div data-reveal="up" style={delay(index * 160 + 250)} className="flex flex-col">
              <h3 className="mt-6 font-display text-3xl text-ink sm:text-4xl">{venue.name}</h3>
              <p className="mt-2 text-ink/80">{what}</p>
              {venue.address && <p className="mt-4 leading-7 text-ink/80">{venue.address}</p>}
              {venue.parking && <p className="mt-2 leading-7 text-ink/75">Parkering: {venue.parking}</p>}
              <ExternalLink href={mapLink(venue.mapQuery)} className="btn-quiet mt-4 self-start text-ink">Visa på kartan</ExternalLink>
              </div>
            </article>
          ))}
        </div>

        <div id="boende" className="mt-28 grid scroll-mt-4 items-center gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div data-reveal="up">
            <h3 className="font-display text-4xl text-ink sm:text-5xl">Sova över</h3>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink/75">Vi sover själva på Clarion Hotel Draken i centrala Göteborg. Det är en bit från Långedrag, men lätt att nå med spårvagn 11 eller taxi efter festen. Det är helt frivilligt att bo där; lös gärna boende som passar er.</p>
            <ExternalLink className="btn-quiet mt-6 text-ink" href="https://www.strawberry.se/hotell/sverige/goteborg/clarion-hotel-draken/">Läs mer och boka på Strawberry</ExternalLink>
          </div>
          <div data-reveal="image" style={delay(200)} className="relative aspect-[16/10] overflow-hidden">
            <Image src="/photos/draken.jpg" alt="Clarion Hotel Draken, ett högt hotell med guldskimrande fasad vid Göta älv i solnedgång" fill sizes="(min-width: 1152px) 620px, (min-width: 1024px) 55vw, 100vw" className="object-cover object-[70%_center]" />
          </div>
        </div>
      </section>

      {!thankYou && (
        <>
          <Shoreline className="text-foam" />
          <section id="osa" className="scroll-mt-4 bg-foam px-6 pb-24 pt-16 lg:pb-32" aria-labelledby="rsvp-title">
            <div className="mx-auto max-w-3xl">
              <h2 id="rsvp-title" data-reveal="up" className={`${h2} text-ink`}>{names ? (responded ? `Ert svar, ${names}` : `Kommer ${youAll}, ${names}?`) : "OSA"}</h2>
              {invitation ? (
                <p className="mt-6 max-w-xl text-lg leading-8 text-ink/75">
                  {responded
                    ? `Tack, vi har fått ${solo ? "ditt" : "ert"} svar. Ändra gärna nedan om något har ändrats, senast den ${WEDDING.rsvpBy}.`
                    : `Svara senast den ${WEDDING.rsvpBy}${solo ? "." : ", för var och en i sällskapet."}`}
                </p>
              ) : (
                <>
                  {token && <p className="mt-6 max-w-xl border border-ember/40 bg-paper px-4 py-3 leading-7 text-ink" role="status">Vi kunde inte läsa inbjudningslänken. Kontrollera att hela länken kom med, eller svara med formuläret nedan.</p>}
                  <p className="mt-6 max-w-xl text-lg leading-8 text-ink/75">Svara senast den {WEDDING.rsvpBy}. En anmälan per sällskap räcker fint.</p>
                </>
              )}
              <div data-reveal="up" style={delay(120)} className="mt-10">{invitation ? <InvitationRsvpForm token={token} invitation={invitation} /> : <RSVPForm />}</div>
            </div>
          </section>
          <Shoreline className="text-foam" flip />
        </>
      )}

      <section id="fragor" className="mx-auto max-w-3xl scroll-mt-4 px-6 py-24 lg:py-32" aria-labelledby="faq-title">
        <h2 id="faq-title" data-reveal="up" className={`${h2} text-ink`}>Frågor & svar</h2>
        <div className="mt-10 divide-y divide-ink/15 border-y border-ink/15">
          {faqs.map((faq, index) => (
            <details key={faq.q} data-reveal="up" style={delay(index * 80)} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg text-ink [&::-webkit-details-marker]:hidden">
                {faq.q}
                <span className="text-2xl font-light text-ember transition group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="mt-3 max-w-2xl leading-7 text-ink/75">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="on-dark bg-ink px-6 py-24 text-white lg:px-10 lg:py-32" aria-labelledby="toast-title">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[18rem_1fr] lg:gap-16">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[18rem] overflow-hidden lg:mx-0">
            <Image src="/photos/jenny.jpg" alt="Jenny Bergdahl i blommig klänning och glasögon, leende" fill sizes="288px" className="object-cover object-top" />
          </div>
          <div className="min-w-0">
            <h2 id="toast-title" className={h2}>Toastmadame</h2>
            <p className="mt-4 font-accent text-3xl text-dusk sm:text-4xl">Jenny Bergdahl</p>
            <p className="mt-6 max-w-md text-lg leading-8 text-white/80">Kvällens tryggaste punkt. Vill du hålla tal, överraska eller har du en fråga om dagen? Hör av dig till Jenny så hjälper hon dig rätt.</p>
            {TOASTMADAME_EMAIL ? (
              <a className="mt-8 inline-block break-all text-lg underline decoration-1 underline-offset-8 hover:underline-offset-4 transition-all" href={`mailto:${TOASTMADAME_EMAIL}`}>{TOASTMADAME_EMAIL}</a>
            ) : (
              <p className="mt-8 text-white/80">Jennys kontaktuppgifter kommer snart.</p>
            )}
          </div>
        </div>
      </section>

      <footer className="bg-ink px-6 pb-28 md:pb-12 text-center text-sm text-white/75">
        <p className="font-display text-3xl text-white">E<span className="font-accent text-dusk">&</span>J</p>
        <p className="mt-3">19 juni 2027 · Ölmevalla & Långedrag</p>
        <p className="mt-8 text-xs text-white/60">
          Foto: {VENUES.church.name},{" "}
          <a href={VENUES.church.image.creditUrl} target="_blank" rel="noreferrer" className="underline decoration-1 underline-offset-2 hover:text-white">Musicus, CC BY-SA 3.0<span className="sr-only"> (öppnas i ny flik)</span></a>
          {" · "}{VENUES.party.name}, Lasse Olsson
        </p>
      </footer>

      <MobileNav links={navLinks} />
    </main>
  );
}
