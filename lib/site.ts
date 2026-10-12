export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Kontaktadress till toastmadame Jenny. Lämna tom tills adressen är bestämd. */
export const TOASTMADAME_EMAIL = "";

export function invitationLink(origin: string, token: string) {
  return `${origin}/?token=${token}`;
}

/** Förnamnet om sällskapet bara består av en gäst – då tilltalas gästen med "du". */
export function soloFirstName(guestNames: string[]) {
  return guestNames.length === 1 ? guestNames[0].trim().split(/\s+/)[0] || null : null;
}

export function invitationMessage(origin: string, groupName: string, guestNames: string[], token: string) {
  const solo = soloFirstName(guestNames);
  const greeting = solo ? `Hej ${solo}! Vi gifter oss den 19 juni 2027 och hoppas att du vill fira med oss.` : `Hej ${groupName}! Vi gifter oss den 19 juni 2027 och hoppas att ni vill fira med oss.`;
  return `${greeting} Läs mer och svara senast 1 april 2027 här: ${invitationLink(origin, token)}\n\nVarma hälsningar,\nElsa & Joakim`;
}

export function clean(value: unknown, maxLength = 1000) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function isEmail(value: string) {
  return value.length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] || character);
}
