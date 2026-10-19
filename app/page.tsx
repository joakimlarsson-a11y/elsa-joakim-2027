import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { mapLink, SCHEDULE, TOASTMADAME_EMAIL, VENUES, WEDDING } from "@/lib/site";
import { heroCopy } from "@/lib/invitation-copy";
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
  { src: "/photos/familj.jpg", alt: "Elsa och Joakim med sin dotter i en grön trädgård", caption: "Och så blev vi fler, fina Viola!" },
  { src: "/photos/bubbel.jpg", alt: "Elsa och Joakim skålar i bubbel på klipporna vid havet", caption: "Bubbel på klipporna i Krokvik" },
  { src: "/photos/midsommar.jpg", alt: "Elsa och Joakim med blomsterkransar på midsommar", caption: "Midsommar på landet" },
  { src: "/photos/hyrox.jpg", alt: "Elsa och Joakim spänner musklerna efter målgång på Hyrox", caption: "Tillsammans har vi hittat vår grej" },
  { src: "/photos/kyss.jpg", alt: "Elsa och Joakim kysser varandra framför en grön häck", caption: "Underbara minnen i Italien" },
  { src: "/photos/solnedgang.jpg", alt: "Elsa och Joakim ler i solen på en uteservering", caption: "Häng på älskade Brewshack i Åsa" },
  { src: "/photos/smoking.jpg", alt: "Elsa och Joakim med sin son, klädda i festkläder", caption: "Vilhelms första nyår" },
  { src: "/photos/skratt.jpg", alt: "Elsa och Joakim skrattar mot varandra i festkläder", caption: "Vi längtar efter att fira med er!" }
];

const navLinks = [
  { href: "#dagen", label: "Dagen" },
  { href: "#hitta-hit", label: "Hitta hit" },
  { href: "#fragor", label: "Frågor" },
  { href: "#osa", label: "OSA" }
];

type Faq = { title: string; a: string | readonly string[]; image: string; position: string; alt?: string; featured?: boolean; signoff?: string };

const faqs: Faq[] = [
  ...(WEDDING.dressCode ? [{ title: `Klädkod: ${WEDDING.dressCode}`, a: WEDDING.dressCodeNote, signoff: WEDDING.dressCodeSignoff, image: "/photos/kladkod-farger.jpg", position: "center", featured: true, alt: "Inspirationsbild med rubriken Vår bröllopsfärgskala – En midsommardröm – Kärlek, glädje, tillsammans: vår bröllopsbukett med rosa och ljusgula rosor, ljusblå blommor, slöjblomster och salviagröna blad, knuten med vitt band, bredvid fem färgprover märkta rosa, ljusgul, salviagrön, ljusblå och ljusgrå, med blomrankor i hörnen." }] : []),
  ...(WEDDING.children ? [{ title: "Barnen", a: WEDDING.children, image: "/photos/barnen.jpg", position: "center 18%" }] : []),
  { title: "Presenter", a: "Er närvaro är den finaste presenten. Den som ändå vill får gärna bidra till vår resa.", image: "/photos/presenter.jpg", position: "center 40%", alt: "Joakim och Elsa ler mot kameran, han med en stor blombukett i papper och hon med rosa rosor i en glasburk." }
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
  const responded = invitation?.status === "responded";

  const now = new Date();
  const thankYou = now >= new Date(WEDDING.thankYouFrom);
  const days = daysLeft(now);

  const { solo, names, youAll, salutation, intro, ctaLabel } = heroCopy({ guestNames, groupName: invitation?.group_name ?? "", responded, thankYou });

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
                <p>{intro}</p>
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
            <p className="mt-6 max-w-sm text-lg leading-8 text-ink/75">Från kyrkan på landet till havsbrisen i Långedrag. Så här ser lördagen ut.</p>
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
        <p data-reveal="up" style={delay(120)} className="mt-6 max-w-2xl text-lg leading-8 text-ink/75">Ceremonin är i Ölmevalla Kyrka i Åsa, söder om Kungsbacka. Kom ihåg att vara på plats senast 20 minuter innan ceremonin börjar. Därifrån tar bussen er till Långedrag i västra Göteborg, ungefär 40 minuter längs kusten.</p>
        <div className="mt-14 grid gap-x-8 gap-y-14 md:grid-cols-2">
          {[
            { venue: VENUES.church, what: "Ceremoni kl. 14:00" },
            { venue: VENUES.party, what: "Mingel och middag från kl. 16:30" }
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
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink/75">Vi övernattar på Clarion Hotel Draken i centrala Göteborg, lätt att nå med spårvagn 11 eller taxi efter festen. Det är helt frivilligt att bo där; lös gärna boende som passar er.</p>
            <ExternalLink className="btn-quiet mt-6 text-ink" href="https://www.strawberry.se/hotell/sverige/goteborg/clarion-hotel-draken/">Läs mer och boka på Strawberry</ExternalLink>
          </div>
          <div data-reveal="image" style={delay(200)} className="relative aspect-[16/10] overflow-hidden">
            <Image src="/photos/draken.jpg" alt="Clarion Hotel Draken, ett högt hotell med guldskimrande fasad vid Göta älv i solnedgång" fill sizes="(min-width: 1152px) 620px, (min-width: 1024px) 55vw, 100vw" className="object-cover object-[70%_center]" />
          </div>
        </div>
      </section>

      <section className="on-dark bg-ink px-6 py-24 text-white lg:px-10 lg:py-32" aria-labelledby="toast-title">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[18rem_1fr] lg:gap-16">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[18rem] overflow-hidden lg:mx-0">
            <Image src="/photos/jenny.jpg" alt="Jenny Bergdahl i glasögon och svart skjorta, leende" fill sizes="288px" className="object-cover" />
          </div>
          <div className="min-w-0">
            <h2 id="toast-title" className={h2}>Toastmadame</h2>
            <p className="mt-4 font-accent text-3xl text-dusk sm:text-4xl">Jenny Bergdahl</p>
            <p className="mt-6 max-w-md text-lg leading-8 text-white/80">Kvällens tryggaste punkt. Vill du hålla tal, överraska eller har du en fråga om dagen? Hör av dig till Jenny så hjälper hon dig rätt.</p>
            {TOASTMADAME_EMAIL ? (
              <a className="btn btn-primary mt-8" href={`mailto:${TOASTMADAME_EMAIL}`}>Mejla Jenny</a>
            ) : (
              <p className="mt-8 text-white/80">Jennys kontaktuppgifter kommer snart.</p>
            )}
          </div>
        </div>
      </section>

      <section id="fragor" className="mx-auto max-w-6xl scroll-mt-4 px-6 py-24 lg:px-10 lg:py-32" aria-labelledby="faq-title">
        <div>
          <h2 id="faq-title" data-reveal="up" className={`${h2} text-ink`}>Frågor <span className="font-accent text-ember">&</span> svar</h2>
          <p data-reveal="up" style={delay(120)} className="mt-6 max-w-xl text-lg leading-8 text-ink/75">Det mesta ni undrar över, samlat på ett ställe.</p>
        </div>
        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:gap-8">
          {faqs.map((faq, index) => (
            <li key={faq.title} data-reveal="up" style={delay((index % 3) * 120)} className={faq.featured ? "sm:col-span-2" : undefined}>
              <article className={`faq-card group flex h-full flex-col bg-shell ${faq.featured ? "sm:grid sm:grid-cols-2" : ""}`}>
                {faq.featured ? (
                  // Bakgrunden matchar bildens papperston så att den oklippta bilden smälter in.
                  <div className="relative aspect-[1024/1516] bg-[#f3ece5]">
                    <Image src={faq.image} alt={faq.alt ?? ""} fill sizes="(min-width: 1152px) 600px, (min-width: 640px) 50vw, 100vw" className="object-contain" />
                    <span className="absolute left-4 top-3 font-display text-sm tracking-[.08em] text-ink/70" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                ) : (
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image src={faq.image} alt={faq.alt ?? ""} fill sizes="(min-width: 1152px) 540px, (min-width: 640px) 46vw, 100vw" style={{ objectPosition: faq.position }} className="faq-card-image object-cover" />
                    <span className="absolute left-4 top-3 font-display text-sm tracking-[.08em] text-white/90 [text-shadow:0_1px_8px_rgba(42,38,34,.6)]" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                )}
                <div className={`flex flex-1 flex-col px-6 pb-7 pt-6 ${faq.featured ? "sm:justify-center sm:px-10 lg:px-16" : ""}`}>
                  <h3 className={`font-display leading-tight text-ink ${faq.featured ? "text-4xl sm:text-5xl lg:text-6xl" : "text-3xl"}`}>{faq.title}</h3>
                  <span className="mt-4 block h-px w-10 bg-ink/25 transition-all duration-500 group-hover:w-16" aria-hidden="true" />
                  {(typeof faq.a === "string" ? [faq.a] : faq.a).map((paragraph) => (
                    <p key={paragraph} className={`mt-4 text-ink/75 ${faq.featured ? "max-w-md text-lg leading-8" : "leading-7"}`}>{paragraph}</p>
                  ))}
                  {faq.signoff && <p className="mt-6 font-accent text-2xl leading-snug text-ink/80">{faq.signoff}</p>}
                </div>
              </article>
            </li>
          ))}
        </ul>
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

      <footer className="bg-ink px-6 pb-28 pt-16 md:pb-12 text-center text-sm text-white/75">
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
