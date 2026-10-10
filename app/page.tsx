import Image from "next/image";
import Countdown from "./components/countdown";
import RSVPForm from "./components/rsvp-form";

const heroImage =
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=85";
const toastImage =
  "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=900&q=85";

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

const stays = [
  { area: "Långedrag & Hovås", text: "Bo nära festen och havet — perfekt om ni vill promenera hem efter kvällen.", query: "Hotell+Långedrag+Göteborg" },
  { area: "Göteborg centrum", text: "Stort utbud av hotell, en kort taxi- eller spårvagnsresa från värdshuset.", query: "Hotell+Göteborg+centrum" },
  { area: "Kungsbacka", text: "Nära kyrkan för den som vill ha en lugn start på dagen.", query: "Hotell+Kungsbacka" }
];

const faqs = [
  { q: "När behöver vi svara?", a: "Svara via formuläret längre ner senast den 1 april 2027. En anmälan per sällskap räcker." },
  { q: "Hur tar vi oss mellan kyrkan och festen?", a: "Vi ordnar busstransport som avgår direkt från Ölmevalla Kyrka efter vigseln. Ange i OSA:n om ni vill åka med och hur många platser ni behöver." },
  { q: "Jag vill hålla tal eller ordna ett spex — vem kontaktar jag?", a: "Hör av dig till vår toastmadame Jenny Bergdahl i god tid, så hjälper hon dig att planera in det under kvällen." },
  { q: "Jag har allergier eller äter specialkost.", a: "Skriv det i OSA-formuläret, både för dig och eventuell medföljande gäst, så ser vi till att köket vet om det." },
  { q: "Önskar ni er några presenter?", a: "Er närvaro är den finaste presenten. Den som ändå vill får gärna bidra till vår bröllopsresa." },
  { q: "Jag har en annan fråga.", a: "Kontakta Jenny Bergdahl via telefon eller e-post — kontaktuppgifterna hittar du under Toastmadame." }
];

function ArrowIcon() {
  return <span aria-hidden="true">↗</span>;
}

export default function Home() {
  return (
    <main>
      <section className="relative isolate min-h-[720px] overflow-hidden bg-ink text-white">
        <Image src={heroImage} alt="Ett brudpar som promenerar hand i hand i kvällsljus" fill priority sizes="100vw" className="object-cover object-center opacity-60" />
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
          <p className="eyebrow mb-5 text-lavender">Vår stora dag</p>
          <h1 className="max-w-3xl font-display text-7xl leading-[.85] tracking-tight sm:text-8xl lg:text-[10rem]">Elsa <span className="text-lavender">&</span><br /> Joakim</h1>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <p className="font-display text-3xl">19 juni 2027</p>
            <a href="#osa" className="button-primary inline-flex items-center gap-3 rounded-full bg-lavender px-7 py-3 font-semibold text-ink">OSA här <ArrowIcon /></a>
          </div>
          <div className="mt-10"><Countdown /></div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 lg:px-10 lg:py-32" aria-labelledby="intro-title">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-end">
          <div><p className="eyebrow text-plum">Vi längtar efter att ses</p><h2 id="intro-title" className="mt-4 max-w-md font-display text-5xl leading-[.95] text-ink sm:text-6xl">En dag att minnas, tillsammans med er.</h2></div>
          <p className="max-w-xl text-lg leading-8 text-ink/75">Efter vigseln väntar bubblande mingel, middag och en lång sommarkväll vid havet. Här hittar ni allt ni behöver veta inför vår dag.</p>
        </div>
      </section>

      <section id="program" className="scroll-mt-8 bg-mist px-6 py-24 lg:px-10 lg:py-32" aria-labelledby="schedule-title">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow text-plum">Dagen i korthet</p>
          <h2 id="schedule-title" className="mt-4 font-display text-6xl text-ink">Schema</h2>
          <div className="mt-14 grid gap-0 md:grid-cols-4">
            {schedule.map((item, index) => (
              <article key={item.time} className="relative border-l border-plum/25 pb-10 pl-6 md:border-l-0 md:border-t md:pb-0 md:pl-0 md:pt-7 md:pr-7">
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
          <div><p className="eyebrow text-plum">Bra att veta</p><h2 id="info-title" className="mt-4 font-display text-6xl text-ink">Praktiskt</h2><p className="mt-6 max-w-md leading-7 text-ink/75">Kyrkan och värdshuset ligger en kort resa från varandra. Vi ordnar buss mellan platserna så att alla kan njuta av kvällen.</p></div>
          <div className="grid gap-5 sm:grid-cols-2">
            <a className="group rounded-2xl bg-sky p-7 shadow-soft transition hover:-translate-y-1" href="https://www.google.com/maps/search/?api=1&query=Ölmevalla+Kyrka" target="_blank" rel="noreferrer"><p className="eyebrow text-plum">Vigsel</p><h3 className="mt-4 font-display text-3xl">Ölmevalla Kyrka</h3><p className="mt-8 font-semibold text-plum">Hitta hit <ArrowIcon /></p></a>
            <a className="group rounded-2xl bg-lavender p-7 shadow-soft transition hover:-translate-y-1" href="https://www.google.com/maps/search/?api=1&query=Långedrags+Värdshus" target="_blank" rel="noreferrer"><p className="eyebrow text-plum">Fest</p><h3 className="mt-4 font-display text-3xl">Långedrags Värdshus</h3><p className="mt-8 font-semibold text-plum">Hitta hit <ArrowIcon /></p></a>
          </div>
        </div>
        <div className="mt-16 border-t border-ink/15 pt-10"><p className="eyebrow text-plum">Presenter</p><p className="mt-4 max-w-2xl font-display text-4xl leading-tight text-ink">Er närvaro är den finaste presenten — vi önskar oss inga andra presenter.</p><p className="mt-5 max-w-xl leading-7 text-ink/70">Den som ändå vill får gärna bidra till vår bröllopsresa. Det viktigaste är att vi får fira tillsammans.</p></div>
      </section>

      <section id="boende" className="scroll-mt-8 bg-mist px-6 py-24 lg:px-10 lg:py-32" aria-labelledby="stay-title">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow text-plum">För er som kommer långväga</p>
          <h2 id="stay-title" className="mt-4 font-display text-6xl text-ink">Boende</h2>
          <p className="mt-6 max-w-xl leading-7 text-ink/75">Midsommarhelgen är populär — boka gärna boende i god tid. Här är några områden som passar bra.</p>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {stays.map((stay) => (
              <a key={stay.area} className="group flex flex-col rounded-2xl bg-white p-7 shadow-soft transition hover:-translate-y-1" href={`https://www.google.com/maps/search/?api=1&query=${stay.query}`} target="_blank" rel="noreferrer">
                <h3 className="font-display text-3xl text-ink">{stay.area}</h3>
                <p className="mt-4 flex-1 leading-7 text-ink/70">{stay.text}</p>
                <p className="mt-8 font-semibold text-plum">Visa hotell <ArrowIcon /></p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink px-6 py-24 text-white lg:px-10 lg:py-32" aria-labelledby="toast-title">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[.75fr_1fr]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]"><Image src={toastImage} alt="Jenny Bergdahl ler mot kameran" fill sizes="(min-width: 1024px) 35vw, 90vw" className="object-cover" /></div>
          <div><p className="eyebrow text-lavender">Kvällens tryggaste punkt</p><h2 id="toast-title" className="mt-4 font-display text-6xl">Toastmadame</h2><p className="mt-6 font-display text-4xl text-lavender">Jenny Bergdahl</p><p className="mt-6 max-w-md leading-7 text-white/75">Vill du hålla tal, överraska eller har du en fråga om dagen? Hör av dig till Jenny så hjälper hon dig rätt.</p><div className="mt-8 flex flex-col gap-3 text-lg"><a className="underline decoration-lavender underline-offset-4 hover:text-lavender" href="tel:+46701234567">070–123 45 67</a><a className="underline decoration-lavender underline-offset-4 hover:text-lavender" href="mailto:jenny@elsaochjoakim.se">jenny@elsaochjoakim.se</a></div></div>
        </div>
      </section>

      <section id="fragor" className="mx-auto max-w-3xl scroll-mt-8 px-6 pt-24 lg:pt-32" aria-labelledby="faq-title">
        <p className="eyebrow text-plum">Bra att veta</p>
        <h2 id="faq-title" className="mt-4 font-display text-6xl text-ink">Frågor & svar</h2>
        <div className="mt-10 divide-y divide-ink/15 border-y border-ink/15">
          {faqs.map((faq) => (
            <details key={faq.q} className="group py-5">
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
        <p className="eyebrow text-plum">Svara senast 1 april 2027</p>
        <h2 id="rsvp-title" className="mt-4 font-display text-6xl text-ink">OSA här</h2>
        <p className="mt-5 max-w-xl leading-7 text-ink/70">Fyll i formuläret nedan — en anmälan per sällskap räcker fint.</p>
        <div className="mt-10"><RSVPForm /></div>
      </section>

      <footer className="border-t border-ink/10 px-6 py-10 text-center text-sm text-ink/60"><p className="font-display text-3xl text-ink">E<span className="text-plum">&</span>J</p><p className="mt-3">19 juni 2027 · Ölmevalla & Långedrag</p></footer>
    </main>
  );
}
