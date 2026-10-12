import { headers } from "next/headers";

function fallbackOrigin() {
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  return vercelHost ? `https://${vercelHost}` : "http://localhost:3000";
}

/** Origin för den aktuella requesten, t.ex. https://min-doman.se. */
export async function requestOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host")?.split(",")[0].trim() || h.get("host");
  if (!host) return fallbackOrigin();
  const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const proto = h.get("x-forwarded-proto")?.split(",")[0].trim() || (isLocal ? "http" : "https");
  return `${proto}://${host}`;
}

export function staticOrigin() {
  return fallbackOrigin();
}
