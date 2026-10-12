export const dynamic = "force-static";

import { staticOrigin } from "@/lib/origin";
import { SCHEDULE, VENUES, WEDDING } from "@/lib/site";

function endStamp() {
  const match = /^(\d{1,2}):(\d{2})$/.exec(WEDDING.endTime);
  if (!match) return "20270619T235900";
  const [hours, minutes] = [Number(match[1]), match[2]];
  // Sluttid efter midnatt hamnar på dagen efter.
  const day = hours < 14 ? "20270620" : "20270619";
  return `${day}T${String(hours).padStart(2, "0")}${minutes}00`;
}

function escapeText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function GET() {
  const origin = staticOrigin();
  const location = VENUES.church.address ? `${VENUES.church.name}, ${VENUES.church.address}` : VENUES.church.name;
  const description = [
    ...SCHEDULE.map((item) => `${item.time} ${item.title} – ${item.place}`),
    "",
    origin
  ].join("\n");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Elsa och Joakim//Brollop 2027//SV",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:brollop-elsa-joakim-20270619@elsajoakim",
    "DTSTAMP:20261012T000000Z",
    "DTSTART;TZID=Europe/Stockholm:20270619T140000",
    `DTEND;TZID=Europe/Stockholm:${endStamp()}`,
    `SUMMARY:${escapeText("Elsa & Joakims bröllop")}`,
    `LOCATION:${escapeText(location)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `URL:${origin}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="elsa-och-joakim.ics"'
    }
  });
}
