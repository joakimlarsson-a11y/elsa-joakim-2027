import Image from "next/image";
import RSVPForm from "./components/rsvp-form";

const heroImage =
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=85";
const toastImage =
  "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=900&q=85";

const story = [
  {
    image: "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&w=1000&q=80",
    alt: "Ett par skrattar tillsammans utomhus",
    text: "Det började med ett skratt och en kaffe som blev till många timmar. Ganska snart visste vi att vi hittat hem hos varandra.",
    caption: "”Hemma är där du är.”"
  },
  {
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1000&q=80",
    alt: "Ett par som håller varandra i handen",
    text: "Sedan dess har vi delat vardag, resor och drömmar. Varje år har varit lite varmare och lite roligare än det förra.",
    caption: "”Äventyr är bäst tillsammans.”"
  },
  {
    image: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1000&q=80",
    alt: "Ett par som kramas i varmt ljus",
    text: "Nu väntar 19 juni 2027 – dagen då vi får säga ja inför människorna vi älskar mest. Ni är en stor del av vår historia.",
    caption: "”Och nu börjar nästa kapitel.”"
  }
];

const schedule = [
  { time: "14:00", title: "Vigsel i Ölmevalla Kyrka", text: "Här säger vi ja till varandra." },
  { time: "16:00", title: "Bussen rullar", text: "Gemensam buss tar oss från kyrkan vidare mot festen." },
  { time: "16:30", title: "Mingel & Skål på Långedrags Värdshus", text: "Skarpskärsskål med havet som bakgrund." },
  { time: "18:30", title: "Middag & Firande", text: "God mat, tal och dans hela kvällen." }
];

const btn = "transition-all duration-300 hover:-translate-y-0.5";

export default function Home() {
  return (
    <main className="bg-cream text-ink">
      <section className="relative isolate min-h-[680px] overflow-hidden bg-ink text-white">
        <Image src={heroImage} alt="Elsa och Joakim promenerar hand i hand i kvällsljus" fill priority sizes="100vw" className="object-cover object-center opacity-50" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-plum/40 via-ink/50 to-ink" />
        <div id="top" className="relative mx-auto flex min-h-[680px] max-w-4xl flex-col items-center justify-center px-6 py-24 text-center">
          <p className="eyebrow mb-6 text-lavender">Varmt välkomna</p>
          <h1 className="font-display text-6xl font-semibold leading-none sm:text-8xl">Elsa &amp; Joakim gifter sig</h1>
          <p className="mt-6 font-display text-3xl text-lavender sm:text-4xl">19 juni 2027</p>
          <p className="mt-8 max-w-xl text-lg leading-8 text-white/85">Vi kan knappt bärga oss inför att få fira vår stora dag tillsammans med er! Här hittar ni all praktisk information inför bröllopet.</p>
          <a href="#osa" className={`${btn} mt-10 inline-block rounded-full bg-lavender px-8 py-4 font-semibold text-ink hover:bg-sand`}>OSA till festen</a>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-24 lg:py-32" aria-labelledby="story-title">
        <p className="eyebrow text-plum">Kort om oss</p>
        <h2 id="story-title" className="mt-4 font-display text-5xl font-semibold sm:text-6xl">Vår resa hit</h2>
        <div className="mt-16 space-y-20">
          {story.map((item, i) => (
            <figure key={item.image} className={`grid items-center gap-8 md:grid-cols-2 md:gap-14 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
              <div className="group relative aspect-[4/3] overflow-hidden rounded-3xl shadow-soft">
                <Image src={item.image} alt={item.alt} fill sizes="(min-width: 768px) 45vw, 90vw" className="object-cover transition-all duration-300 group-hover:scale-105" />
              </div>
              <figcaption>
                <p className="text-lg leading-8 text-ink/80">{item.text}</p>
                <p className="mt-5 font-display text-2xl italic text-plum">{item.caption}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="bg-sand px-6 py-24 lg:py-32" aria-labelledby="schedule-title">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow text-plum">Dagens gång</p>
          <h2 id="schedule-title" className="mt-4 font-display text-5xl font-semibold sm:text-6xl">Så här blir dagen</h2>
          <ol className="mt-14 space-y-10 border-l-2 border-plum/25 pl-8">
            {schedule.map((item) => (
              <li key={item.time} className="relative">
                <span className="absolute -left-[41px] top-2 h-4 w-4 rounded-full border-2 border-sand bg-plum" aria-hidden="true" />
                <p className="font-display text-4xl font-semibold text-plum">{item.time}</p>
                <h3 className="mt-1 text-lg font-bold">{item.title}</h3>
                <p className="mt-1 italic text-ink/70">”{item.text}”</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-24 lg:py-32" aria-labelledby="info-title">
        <p className="eyebrow text-plum">Bra att veta</p>
        <h2 id="info-title" className="mt-4 font-display text-5xl font-semibold sm:text-6xl">Praktiskt &amp; presenter</h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          <a className={`${btn} rounded-2xl bg-sky p-7 shadow-soft hover:shadow-lg`} href="https://www.google.com/maps/search/?api=1&query=Ölmevalla+Kyrka" target="_blank" rel="noreferrer">
            <p className="eyebrow text-plum">Vigsel kl. 14:00</p>
            <h3 className="mt-4 font-display text-3xl font-semibold">Ölmevalla Kyrka</h3>
            <p className="mt-6 font-semibold text-plum">Öppna i Google Maps →</p>
          </a>
          <a className={`${btn} rounded-2xl bg-lavender p-7 shadow-soft hover:shadow-lg`} href="https://www.google.com/maps/search/?api=1&query=Långedrags+Värdshus" target="_blank" rel="noreferrer">
            <p className="eyebrow text-plum">Fest från kl. 16:30</p>
            <h3 className="mt-4 font-display text-3xl font-semibold">Långedrags Värdshus</h3>
            <p className="mt-6 font-semibold text-plum">Öppna i Google Maps →</p>
          </a>
        </div>
        <div className="mt-14 rounded-3xl bg-sand p-8 sm:p-12">
          <p className="eyebrow text-plum">Presenter</p>
          <p className="mt-4 max-w-2xl font-display text-3xl leading-snug sm:text-4xl">Det finaste vi kan få är er närvaro!</p>
          <p className="mt-5 max-w-2xl leading-7 text-ink/75">Vi önskar oss inga prylar eller fysiska saker. Vill ni ändå ge en gåva tar vi tacksamt emot ett bidrag till vår bröllopsresa.</p>
        </div>
      </section>

      <section className="bg-ink px-6 py-24 text-white lg:py-32" aria-labelledby="toast-title">
        <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-[.8fr_1fr]">
          <div className="group relative aspect-[4/5] overflow-hidden rounded-3xl">
            <Image src={toastImage} alt="Jenny Bergdahl ler mot kameran" fill sizes="(min-width: 768px) 35vw, 90vw" className="object-cover transition-all duration-300 group-hover:scale-105" />
          </div>
          <div>
            <p className="eyebrow text-lavender">Vår toastmadame</p>
            <h2 id="toast-title" className="mt-4 font-display text-5xl font-semibold sm:text-6xl">Jenny Bergdahl</h2>
            <p className="mt-6 max-w-md leading-7 text-white/80">Jenny är vår älskade toastmadame och håller i trådarna under kvällen. Vill du hålla tal, planera en överraskning eller har du en fråga? Hör av dig till henne – hon tar emot er med öppna armar.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className={`${btn} rounded-full bg-lavender px-6 py-3 font-semibold text-ink hover:bg-sand`} href="tel:+46701234567">Ring Jenny</a>
              <a className={`${btn} rounded-full border border-lavender px-6 py-3 font-semibold hover:bg-lavender hover:text-ink`} href="mailto:jenny@elsaochjoakim.se">Mejla Jenny</a>
            </div>
          </div>
        </div>
      </section>

      <section id="osa" className="mx-auto max-w-2xl scroll-mt-8 px-6 py-24 lg:py-32" aria-labelledby="rsvp-title">
        <p className="eyebrow text-plum">Svara senast 1 april 2027</p>
        <h2 id="rsvp-title" className="mt-4 font-display text-5xl font-semibold sm:text-6xl">OSA till festen</h2>
        <p className="mt-5 leading-7 text-ink/75">Berätta gärna om du kommer – en anmälan per sällskap räcker fint.</p>
        <div className="mt-10"><RSVPForm /></div>
      </section>

      <footer className="border-t border-ink/10 px-6 py-10 text-center text-sm text-ink/60">
        <p className="font-display text-3xl text-ink">E<span className="text-plum">&amp;</span>J</p>
        <p className="mt-3">19 juni 2027 · Ölmevalla &amp; Långedrag</p>
      </footer>
    </main>
  );
}
