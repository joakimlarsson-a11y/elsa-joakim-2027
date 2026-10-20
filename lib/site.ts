/** Publik adress till sajten. Används i mejl så att länkar alltid matchar avsändardomänen. */
export const SITE_URL = "https://elsajoakim2027.se";

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Kontaktadress till toastmadame Jenny. */
export const TOASTMADAME_EMAIL = "elsajoakim2027@gmail.com";

/**
 * Fakta om dagen. Tomma strängar döljs på sidan – fyll i när det är bestämt.
 */
export const WEDDING = {
  date: "19 juni 2027",
  start: "2027-06-19T14:00:00+02:00",
  /** Dagen efter: då byter sidan till tackläge. */
  thankYouFrom: "2027-06-20T12:00:00+02:00",
  rsvpBy: "1 april 2027",
  /** Ungefär när festen slutar, t.ex. "01:00". Används i schemat och kalenderfilen. */
  endTime: "",
  /** T.ex. "Kavaj". */
  dressCode: "Kavaj",
  /** Förklaring av klädkoden, visas under Frågor. Ett stycke per rad. */
  dressCodeNote: [
    "Vi ser fram emot att fira vår stora dag med er, och hoppas att ni vill klä er i färgerna från vår bröllopsbukett: rosa, ljusgul, salviagrön, ljusblå och ljusgrå."
  ],
  /** Hälsning under klädkoden. */
  dressCodeSignoff: "Tack för att ni är en del av vår resa!",
  /** T.ex. "Barn är varmt välkomna!" */
  children: "Barn är varmt välkomna till ceremonin i kyrkan. Under middagen och festen råder vuxet sällskap. Spädbarn är givetvis välkomna, de behöver inte anmälas i OSA:n.",
  /** Länk till delat fotoalbum efter dagen. */
  photoAlbumUrl: ""
} as const;

export const SCHEDULE = [
  { time: "14:00", title: "Ceremoni", place: "Ölmevalla Kyrka", text: "Vi förnyar våra löften." },
  { time: "16:00", title: "Buss mot havet", place: "Från kyrkan till Långedrag", text: "Bussen avgår direkt från kyrkan. Ange i OSA:n om ni vill åka med." },
  { time: "16:30", title: "Mingel", place: "Långedrags Värdshus", text: "Välkomstskål och tid att landa tillsammans." },
  { time: "18:30", title: "Middag", place: "Långedrags Värdshus", text: "En kväll fylld av god mat, tal och skratt." }
] as const;

export const VENUES = {
  church: {
    name: "Ölmevalla Kyrka",
    address: "",
    parking: "",
    mapQuery: "Ölmevalla Kyrka",
    image: { src: "/photos/olmevalla-kyrka.jpg", alt: "Ölmevalla Kyrka, en kyrka i gult tegel med hög ärggrön tornspira, bland lövträd en sommardag", creditUrl: "https://commons.wikimedia.org/wiki/File:%C3%96lmevalla_ka.jpg" }
  },
  party: {
    name: "Långedrags Värdshus",
    address: "",
    parking: "",
    mapQuery: "Långedrags Värdshus",
    image: { src: "/photos/langedrags-matsal.jpg", alt: "Dukade långbord med vita stolar och blommor i Långedrags Värdshus matsal, med stora fönster ut mot havet och segelbåtar" }
  }
} as const;

export function mapLink(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Förnamn i ett sällskap: "Anna", "Anna & Erik", "Anna, Erik & Lisa". Null om fler än fyra. */
export function firstNames(guestNames: string[]) {
  const names = guestNames.map((name) => name.trim().split(/\s+/)[0]).filter(Boolean);
  if (names.length === 0 || names.length > 4) return null;
  return names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
}

export function invitationLink(origin: string, token: string) {
  return `${origin}/?token=${token}`;
}

/** Förnamnet om sällskapet bara består av en gäst – då tilltalas gästen med "du". */
export function soloFirstName(guestNames: string[]) {
  return guestNames.length === 1 ? guestNames[0].trim().split(/\s+/)[0] || null : null;
}

export function invitationMessage(origin: string, groupName: string, guestNames: string[], token: string) {
  const solo = soloFirstName(guestNames);
  const greeting = solo ? `Hej ${solo}! Vi förnyar våra löften den 19 juni 2027 och hoppas att du vill fira med oss.` : `Hej ${groupName}! Vi förnyar våra löften den 19 juni 2027 och hoppas att ni vill fira med oss.`;
  return `${greeting} Läs mer och svara senast 1 april 2027 här: ${invitationLink(origin, token)}\n\nVarma hälsningar,\nElsa & Joakim`;
}

export function clean(value: unknown, maxLength = 1000) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

/** Gästnamn från fritext, separerade med komma eller radbrytning. */
export function parseGuestNames(value: unknown) {
  return (typeof value === "string" ? value : "")
    .split(/[,\n]/)
    .map((name) => name.trim().slice(0, 120))
    .filter(Boolean);
}

export function isEmail(value: string) {
  return value.length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] || character);
}
