import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { soloFirstName, TOASTMADAME_EMAIL } from "@/lib/site";
import Countdown from "./components/countdown";
import RSVPForm from "./components/rsvp-form";
import ScrollReveal from "./components/scroll-reveal";
import InvitationRsvpForm from "./osa/invitation-rsvp-form";
import { loadInvitation } from "./osa/load-invitation";

type HomeProps = { searchParams: Promise<{ token?: string | string[] }> };

export async function generateMetadata({ searchParams }: HomeProps): Promise<Metadata> {
  const { token } = await searchParams;
  // Personliga länkar ska inte indexeras.
  return token ? { robots: { index: false, follow: false } } : {};
}

const heroImage = "/photos/hero-vigsel.jpg";
const toastImage = "/photos/jenny.jpg";

const introPhotos = [
  { src: "/photos/selfie.jpg", alt: "Elsa och Joakim lutar huvudena mot varandra och ler" },
  { src: "/photos/kyss.jpg", alt: "Elsa och Joakim kysser varandra framför en grön häck" },
  { src: "/photos/skratt.jpg", alt: "Elsa och Joakim skrattar mot varandra i festkläder" }
];

const storyPhotos = [
  { src: "/photos/familj.jpg", alt: "Elsa och Joakim med sin dotter i en grön trädgård" },
  { src: "/photos/solnedgang.jpg", alt: "Elsa och Joakim ler i solen på en uteservering" },
  { src: "/photos/bubbel.jpg", alt: "Elsa och Joakim skålar i bubbel på klipporna vid havet" },
  { src: "/photos/midsommar.jpg", alt: "Elsa och Joakim med blomsterkransar på midsommar" },
  { src: "/photos/hyrox.jpg", alt: "Elsa och Joakim spänner musklerna efter målgång på Hyrox" },
  { src: "/photos/skal.jpg", alt: "Elsa och Joakim med champagneglas i svartvitt" },
  { src: "/photos/smoking.jpg", alt: "Elsa och Joakim med sin son, klädda i festkläder" }
];

const schedule = [
  { time: "14:00", title: "Vigsel", place: "Ölmevalla Kyrka", text: "Vi säger ja under de vackra valven." },
  { time: "16:00", title: "Busstransport", place: "Till Långedrags Värdshus", text: "Bussen avgår direkt från kyrkan." },
  { time: "16:30", title: "Mingel", place: "Långedrags Värdshus", text: "Välkomstskål och tid att landa tillsammans." },
  { time: "18:30", title: "Middag", place: "Långedrags Värdshus", text: "En kväll fylld av god mat, tal och skratt." }
];

const navLinks = [
  { href: "#program", label: "Program" },
  { href: "#hitta-hit", label: "Hitta hit" },
  { href: "#boende", label: "Boende" },
  { href: "#fragor", label: "Frågor & svar" }
];

const faqs = [
  { q: "När behöver vi svara?", a: "Svara via formuläret längre ner senast den 1 april 2027. En anmälan per sällskap räcker." },
  { q: "Hur tar vi oss mellan kyrkan och festen?", a: "Vi ordnar busstransport som avgår direkt från Ölmevalla Kyrka efter vigseln. Ange i OSA:n om ni vill åka med och hur många platser ni behöver." },
  { q: "Jag vill hålla tal eller ordna ett spex — vem kontaktar jag?", a: "Hör av dig till vår toastmadame Jenny Bergdahl i god tid, så hjälper hon dig att planera in det under kvällen." },
  { q: "Jag har allergier eller äter specialkost.", a: "Skriv det i OSA-formuläret, både för dig och eventuell medföljande gäst, så ser vi till att köket vet om det." },
  { q: "Önskar ni er några presenter?", a: "Er närvaro är den finaste presenten. Den som ändå vill får gärna bidra till vår bröllopsresa." },
  { q: "Jag har en annan fråga.", a: "Kontakta Jenny Bergdahl via e-post — adressen hittar du under Toastmadame." }
];

function delay(ms: number) {
  return { "--reveal-delay": `${ms}ms` } as CSSProperties;
}

function ArrowIcon() {
  return <span aria-hidden="true">↗</span>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { token: rawToken } = await searchParams;
  const token = typeof rawToken === "string" ? rawToken.trim() : "";
  const invitation = token ? await loadInvitation(token) : null;
  const soloName = invitation ? soloFirstName(invitation.guests.map((guest) => guest.name)) : null;
  const greeting = invitation ? (soloName ? `Hej ${soloName}!` : `Välkomna, ${invitation.group_name}!`) : null;

  return (
    <main>
      <ScrollReveal />
      <section className="relative isolate min-h-[720px] overflow-hidden bg-ink text-white">
        <Image src={heroImage} alt="Elsa och Joakim håller hand, sedda bakifrån i en ljusupplyst festsal" fill priority sizes="100vw" className="hero-zoom object-cover object-[center_18%] opacity-60" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#1d2140]/45 via-[#1d2140]/45 to-[#1d2140]" />
        <div className="grain absolute inset-0 -z-10 opacity-40" />
        <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-7 lg:px-10" aria-label="Huvudnavigation">
          <a className="font-display text-2xl font-semibold" href="#top">E<span className="text-lavender">&</span>J</a>
          <div className="flex items-center gap-6">
            <ul className="hidden gap-6 text-sm font-semibold md:flex">
              {navLinks.map((link) => (
                <li key={link.href}><a href={link.href} className="underline-offset-4 transition hover:text-lavender hover:underline">{link.label}</a></li>
              ))}
            </ul>
            <a href="#osa" className="rounded-full border border-white/70 px-5 py-2 text-sm font-semibold transition hover:bg-white hover:text-ink">OSA</a>
          </div>
        </nav>
        <div id="top" className="relative mx-auto flex min-h-[610px] max-w-6xl flex-col justify-end px-6 pb-20 lg:px-10 lg:pb-28">
          <p className="hero-rise eyebrow mb-5 text-lavender" style={delay(200)}>{greeting ?? "Vår stora dag"}</p>
          <h1 style={delay(350)} className="hero-rise max-w-3xl font-display text-7xl leading-[.85] tracking-tight sm:text-8xl lg:text-[10rem]">Elsa <span className="text-lavender">&</span><br /> Joakim</h1>
          <div className="hero-rise mt-10 flex flex-wrap items-center gap-6" style={delay(550)}>
            <p className="font-display text-3xl">19 juni 2027</p>
            <a href="#osa" className="button-primary inline-flex items-center gap-3 rounded-full bg-lavender px-7 py-3 font-semibold text-ink">OSA här <ArrowIcon /></a>
          </div>
          <div className="hero-rise mt-10" style={delay(700)}><Countdown /></div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 lg:px-10 lg:py-32" aria-labelledby="intro-title">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-end">
          <div data-reveal="up"><p className="eyebrow text-plum">Vi längtar efter att ses</p><h2 id="intro-title" className="mt-4 max-w-md font-display text-5xl leading-[.95] text-ink sm:text-6xl">En dag att minnas, tillsammans med er.</h2></div>
          <p data-reveal="up" style={delay(150)} className="max-w-xl text-lg leading-8 text-ink/75">Efter vigseln väntar bubblande mingel, middag och en lång sommarkväll vid havet. Här hittar ni allt ni behöver veta inför vår dag.</p>
        </div>
        <ul className="mt-16 grid grid-cols-3 gap-3 sm:gap-6">
          {introPhotos.map((photo, index) => (
            <li key={photo.src} data-reveal="photo" style={delay(index * 140)} className={index === 1 ? "sm:mt-10" : ""}>
              <Image src={photo.src} alt={photo.alt} width={750} height={1000} sizes="(min-width: 1152px) 360px, 33vw" className="aspect-[3/4] w-full rounded-2xl object-cover shadow-soft" />
            </li>
          ))}
        </ul>
      </section>

      <section id="program" className="scroll-mt-8 bg-mist px-6 py-24 lg:px-10 lg:py-32" aria-labelledby="schedule-title">
        <div className="mx-auto max-w-6xl">
          <div data-reveal="up">
            <p className="eyebrow text-plum">Dagen i korthet</p>
            <h2 id="schedule-title" className="mt-4 font-display text-6xl text-ink">Schema</h2>
          </div>
          <div className="mt-14 grid gap-0 md:grid-cols-4">
            {schedule.map((item, index) => (
              <article key={item.time} data-reveal="up" style={delay(index * 130)} className="relative border-l border-plum/25 pb-10 pl-6 md:border-l-0 md:border-t md:pb-0 md:pl-0 md:pt-7 md:pr-7">
                <div className="absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full bg-plum md:-top-[5px] md:left-0" aria-hidden="true" />
                <p className="font-display text-4xl text-plum">{item.time}</p>
                <h3 className="mt-5 text-lg font-bold">{item.title}</h3>
                <p className="mt-1 font-semibold text-ink/80">{item.place}</p>
                <p className="mt-3 text-sm leading-6 text-ink/65">{item.text}</p>
                {index < schedule.length - 1 && <span className="absolute right-5 top-8 hidden text-2xl text-plum/50 md:block" aria-hidden="true">→</span>}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="hitta-hit" className="mx-auto max-w-6xl scroll-mt-8 px-6 py-24 lg:px-10 lg:py-32" aria-labelledby="info-title">
        <div className="grid gap-16 lg:grid-cols-2">
          <div data-reveal="left"><p className="eyebrow text-plum">Bra att veta</p><h2 id="info-title" className="mt-4 font-display text-6xl text-ink">Praktiskt</h2><p className="mt-6 max-w-md leading-7 text-ink/75">Kyrkan och värdshuset ligger en kort resa från varandra. Vi ordnar buss mellan platserna så att alla kan njuta av kvällen.</p></div>
          <div className="grid gap-5 sm:grid-cols-2">
            <a data-reveal="up" style={delay(100)} className="group rounded-2xl bg-sky p-7 shadow-soft transition hover:-translate-y-1" href="https://www.google.com/maps/search/?api=1&query=Ölmevalla+Kyrka" target="_blank" rel="noreferrer"><p className="eyebrow text-plum">Vigsel</p><h3 className="mt-4 font-display text-3xl">Ölmevalla Kyrka</h3><p className="mt-8 font-semibold text-plum">Hitta hit <ArrowIcon /></p></a>
            <a data-reveal="up" style={delay(250)} className="group rounded-2xl bg-lavender p-7 shadow-soft transition hover:-translate-y-1" href="https://www.google.com/maps/search/?api=1&query=Långedrags+Värdshus" target="_blank" rel="noreferrer"><p className="eyebrow text-plum">Fest</p><h3 className="mt-4 font-display text-3xl">Långedrags Värdshus</h3><p className="mt-8 font-semibold text-plum">Hitta hit <ArrowIcon /></p></a>
          </div>
        </div>
        <div data-reveal="up" className="mt-16 border-t border-ink/15 pt-10"><p className="eyebrow text-plum">Presenter</p><p className="mt-4 max-w-2xl font-display text-4xl leading-tight text-ink">Er närvaro är den finaste presenten — vi önskar oss inga andra presenter.</p><p className="mt-5 max-w-xl leading-7 text-ink/70">Den som ändå vill får gärna bidra till vår bröllopsresa. Det viktigaste är att vi får fira tillsammans.</p></div>
      </section>

      <section id="boende" className="scroll-mt-8 bg-mist px-6 py-24 lg:px-10 lg:py-32" aria-labelledby="stay-title">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div data-reveal="up">
            <p className="eyebrow text-plum">För er som kommer långväga</p>
            <h2 id="stay-title" className="mt-4 font-display text-6xl text-ink">Boende</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink/75">Brudparet kommer att sova på Clarion Hotell Draken. Det är helt frivilligt att lösa boende själva.</p>
            <a className="mt-8 inline-flex items-center gap-2 font-semibold text-plum underline decoration-lavender underline-offset-4 hover:decoration-plum" href="https://www.strawberry.se/hotell/sverige/goteborg/clarion-hotel-draken/" target="_blank" rel="noreferrer">Läs mer och boka på Strawberry <ArrowIcon /></a>
          </div>
          <div data-reveal="curtain" style={delay(150)} className="relative aspect-[16/10] overflow-hidden rounded-[2rem] shadow-soft">
            <Image src="/photos/draken.jpg" alt="Clarion Hotel Draken, ett högt hotell med guldskimrande fasad vid Göta älv i solnedgång" fill sizes="(min-width: 1152px) 620px, (min-width: 1024px) 55vw, 100vw" className="object-cover object-[70%_center]" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 lg:px-10 lg:py-32" aria-labelledby="story-title">
        <div data-reveal="up">
          <p className="eyebrow text-plum">Lite om oss</p>
          <h2 id="story-title" className="mt-4 font-display text-6xl text-ink">Vi två, och några till</h2>
        </div>
        <ul className="mt-12 columns-2 gap-4 md:columns-3 md:gap-5 lg:columns-4">
          {storyPhotos.map((photo, index) => (
            <li key={photo.src} data-reveal="photo" style={delay((index % 4) * 110)} className="mb-4 break-inside-avoid md:mb-5">
              <Image src={photo.src} alt={photo.alt} width={750} height={1000} sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 46vw" className="h-auto w-full rounded-2xl object-cover shadow-soft" />
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-ink px-6 py-24 text-white lg:px-10 lg:py-32" aria-labelledby="toast-title">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[18rem_1fr] lg:gap-16">
          <div data-reveal="curtain" className="relative mx-auto aspect-[4/5] w-full max-w-[18rem] overflow-hidden rounded-[2rem] lg:mx-0"><Image src={toastImage} alt="Jenny Bergdahl i blommig klänning och glasögon, leende" fill sizes="288px" className="object-cover object-top" /></div>
          <div data-reveal="right" style={delay(200)}><p className="eyebrow text-lavender">Kvällens tryggaste punkt</p><h2 id="toast-title" className="mt-4 font-display text-6xl">Toastmadame</h2><p className="mt-6 font-display text-4xl text-lavender">Jenny Bergdahl</p><p className="mt-6 max-w-md leading-7 text-white/75">Vill du hålla tal, överraska eller har du en fråga om dagen? Hör av dig till Jenny så hjälper hon dig rätt.</p>{TOASTMADAME_EMAIL ? <div className="mt-8 flex flex-col gap-3 text-lg"><a className="underline decoration-lavender underline-offset-4 hover:text-lavender" href={`mailto:${TOASTMADAME_EMAIL}`}>{TOASTMADAME_EMAIL}</a></div> : <p className="mt-8 text-white/75">Jennys kontaktuppgifter kommer snart.</p>}</div>
        </div>
      </section>

      <section id="fragor" className="mx-auto max-w-3xl scroll-mt-8 px-6 pt-24 lg:pt-32" aria-labelledby="faq-title">
        <div data-reveal="up">
          <p className="eyebrow text-plum">Bra att veta</p>
          <h2 id="faq-title" className="mt-4 font-display text-6xl text-ink">Frågor & svar</h2>
        </div>
        <div className="mt-10 divide-y divide-ink/15 border-y border-ink/15">
          {faqs.map((faq, index) => (
            <details key={faq.q} data-reveal="up" style={delay(index * 70)} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {faq.q}
                <span className="text-2xl text-plum transition group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="mt-3 max-w-2xl leading-7 text-ink/70">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="osa" className="mx-auto max-w-3xl scroll-mt-8 px-6 py-24 lg:py-32" aria-labelledby="rsvp-title">
        <div data-reveal="up">
          <p className="eyebrow text-plum">Svara senast 1 april 2027</p>
          {invitation ? (
            <>
              <h2 id="rsvp-title" className="mt-4 font-display text-6xl text-ink">{greeting}</h2>
              <p className="mt-5 max-w-xl leading-7 text-ink/70">{soloName ? "Vi hoppas att du vill fira med oss den 19 juni 2027. Svara nedan." : "Vi hoppas att ni vill fira med oss den 19 juni 2027. Svara för var och en i sällskapet nedan."}</p>
            </>
          ) : (
            <>
              <h2 id="rsvp-title" className="mt-4 font-display text-6xl text-ink">OSA här</h2>
              {token && <p className="mt-5 max-w-xl rounded-lg bg-sky px-4 py-3 leading-7 text-ink" role="status">Vi kunde inte läsa inbjudningslänken. Kontrollera att hela länken kom med, eller fyll i formuläret nedan.</p>}
              <p className="mt-5 max-w-xl leading-7 text-ink/70">Fyll i formuläret nedan — en anmälan per sällskap räcker fint.</p>
            </>
          )}
        </div>
        <div data-reveal="up" style={delay(150)} className="mt-10">{invitation ? <InvitationRsvpForm token={token} invitation={invitation} /> : <RSVPForm />}</div>
      </section>

      <footer className="border-t border-ink/10 px-6 py-10 text-center text-sm text-ink/60"><p className="font-display text-3xl text-ink">E<span className="text-plum">&</span>J</p><p className="mt-3">19 juni 2027 · Ölmevalla & Långedrag</p></footer>
    </main>
  );
}
