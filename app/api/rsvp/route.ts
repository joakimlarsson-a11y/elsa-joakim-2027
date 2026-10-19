import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scheduleLinkHtml, scheduleLinkText, sendEmail } from "@/lib/email";

type PersonInput = { name?: unknown; email?: unknown; allergies?: unknown; bus?: unknown };
type RSVPBody = { persons?: unknown };
type Person = { name: string; email: string; allergies: string; bus: "Ja" | "Nej" };

const MAX_PERSONS = 10;

function clean(value: unknown, maxLength = 1000) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] || character);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RSVPBody;
    if (!Array.isArray(body.persons) || body.persons.length === 0 || body.persons.length > MAX_PERSONS) {
      return NextResponse.json({ error: "Kontrollera att alla obligatoriska fält är ifyllda." }, { status: 400 });
    }

    const persons: Person[] = [];
    for (const raw of body.persons as PersonInput[]) {
      const name = clean(raw?.name, 120);
      const email = clean(raw?.email, 200).toLowerCase();
      const allergies = clean(raw?.allergies, 1000);
      const bus = clean(raw?.bus, 10);
      if (!name || !email || !email.includes("@") || (bus !== "Ja" && bus !== "Nej")) {
        return NextResponse.json({ error: "Kontrollera att namn, e-post och busstransport är ifyllda för alla personer." }, { status: 400 });
      }
      persons.push({ name, email, allergies, bus });
    }
    const [primary] = persons;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendKey = process.env.RESEND_API_KEY;
    if (!supabaseUrl || !serviceRoleKey || !resendKey) {
      console.error("Missing RSVP service environment variables.");
      return NextResponse.json({ error: "Anmälan är tillfälligt stängd. Försök igen senare." }, { status: 503 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const createdAt = new Date().toISOString();
    const { error: databaseError } = await supabase.from("rsvps").insert(
      persons.map((person, index) => ({
        name: person.name,
        email: person.email,
        guests: index === 0 ? null : `I sällskap med ${primary.name}`,
        attendance: "Kommer",
        bus: person.bus,
        bus_seats: person.bus === "Ja" ? 1 : 0,
        allergies: person.allergies || null,
        created_at: createdAt
      }))
    );
    if (databaseError) {
      console.error("Supabase RSVP insert failed:", databaseError);
      return NextResponse.json({ error: "Vi kunde inte spara ditt svar. Försök igen." }, { status: 500 });
    }

    const details = (person: Person) => [`Busstransport: ${person.bus}`, ...(person.allergies ? [`Specialkost: ${person.allergies}`] : [])];
    const summaryHtml = persons
      .map((person) => `<li><strong>${escapeHtml(person.name)}</strong> (${escapeHtml(person.email)})<br>${details(person).map(escapeHtml).join("<br>")}</li>`)
      .join("");
    const summaryText = persons.map((person) => `- ${person.name} (${person.email}): ${details(person).join(", ")}`).join("\n");
    try {
      await sendEmail({
        to: primary.email,
        subject: "Tack för din OSA!",
        html: `<h1 style="font-family:Georgia,serif;font-size:42px;font-weight:500">Tack, ${escapeHtml(primary.name)}!</h1>
  <p>Vi har tagit emot din OSA och längtar efter att fira med dig.</p>
  <div style="background:#f5f3fa;border-radius:12px;padding:20px;margin:24px 0">
    <strong>Er anmälan</strong><ul style="margin-bottom:0;padding-left:20px">${summaryHtml}</ul>
  </div>
  ${scheduleLinkHtml()}`,
        text: [`Tack, ${primary.name}!`, "Vi har tagit emot din OSA och längtar efter att fira med dig.", `Er anmälan:\n${summaryText}`, scheduleLinkText(), "Varma hälsningar,\nElsa & Joakim"].join("\n\n")
      });
    } catch (mailError) {
      console.error("RSVP confirmation email failed:", mailError);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("RSVP request failed:", error);
    return NextResponse.json({ error: "Något gick fel. Försök igen." }, { status: 500 });
  }
}
