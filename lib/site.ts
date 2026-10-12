export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://elsaochjoakim.se").replace(/\/+$/, "");

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function invitationLink(token: string) {
  return `${SITE_URL}/osa?token=${token}`;
}

export function invitationMessage(groupName: string, token: string) {
  return `Hej ${groupName}! Vi gifter oss den 19 juni 2027 och hoppas att ni vill fira med oss. Svara senast 1 april 2027 här: ${invitationLink(token)}\n\nVarma hälsningar,\nElsa & Joakim`;
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
