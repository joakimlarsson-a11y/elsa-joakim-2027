import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

type RSVPBody = {
  name?: string;
  email?: string;
  guests?: string;
  attendance?: string;
  bus?: string;
  bus_seats?: string;
  allergies?: string;
  co_name?: string;
  co_allergies?: string;
};

function clean(value: unknown, maxLength = 1000) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] || character);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RSVPBody;
    const name = clean(body.name, 120);
    const email = clean(body.email, 200).toLowerCase();
    const guests = clean(body.guests, 500);
    const attendance = clean(body.attendance, 30);
    const bus = clean(body.bus, 10);
    const allergies = clean(body.allergies, 1000);
    const coName = clean(body.co_name, 120);
    const coAllergies = clean(body.co_allergies, 1000);
    const busSeats = Number.parseInt(clean(body.bus_seats, 2) || "0", 10);

    if (!name || !email || !email.includes("@") || !["Kommer", "Kan ej komma"].includes(attendance) || !["Ja", "Nej"].includes(bus)) {
      return NextResponse.json({ error: "Kontrollera att alla obligatoriska fält är ifyllda." }, { status: 400 });
    }
    if (!Number.isInteger(busSeats) || busSeats < 0 || busSeats > 20) {
      return NextResponse.json({ error: "Ange ett giltigt antal bussplatser." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendKey = process.env.RESEND_API_KEY;
    if (!supabaseUrl || !serviceRoleKey || !resendKey) {
      console.error("Missing RSVP service environment variables.");
      return NextResponse.json({ error: "Anmälan är tillfälligt stängd. Försök igen senare." }, { status: 503 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const { error: databaseError } = await supabase.from("rsvps").insert([
      {
        name,
        email,
        guests: guests || null,
        attendance,
        bus,
        bus_seats: busSeats,
        allergies: allergies || null,
        created_at: new Date().toISOString()
      },
      ...(coName
        ? [{
            name: coName,
            email,
            guests: `Medsökande till ${name}`,
            attendance,
            bus,
            bus_seats: 0,
            allergies: coAllergies || null,
            created_at: new Date().toISOString()
          }]
        : [])
    ]);
    if (databaseError) {
      console.error("Supabase RSVP insert failed:", databaseError);
      return NextResponse.json({ error: "Vi kunde inte spara ditt svar. Försök igen." }, { status: 500 });
    }

    const resend = new Resend(resendKey);
    const safeName = escapeHtml(name);
    await resend.emails.send({
      from: "Elsa & Joakim <onboarding@resend.dev>",
      to: email,
      subject: "Tack för din OSA – Elsa & Joakim",
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#1d2140;line-height:1.6">
        <p style="letter-spacing:2px;text-transform:uppercase;color:#44336d;font-size:12px">19 juni 2027</p>
        <h1 style="font-family:Georgia,serif;font-size:42px;font-weight:500">Tack, ${safeName}!</h1>
        <p>Vi har tagit emot din OSA och längtar efter att fira med dig.</p>
        <div style="background:#f5f3fa;border-radius:12px;padding:20px;margin:24px 0">
          <strong>Din anmälan</strong><p style="margin-bottom:0">Deltagande: ${escapeHtml(attendance)}<br>Busstransport: ${escapeHtml(bus)} (${busSeats} plats(er))${coName ? `<br>Medsökande gäst: ${escapeHtml(coName)}` : ""}${guests ? `<br>Medföljande: ${escapeHtml(guests)}` : ""}${allergies ? `<br>Specialkost: ${escapeHtml(allergies)}` : ""}</p>
        </div>
        <p><strong>Praktiskt:</strong> Vigseln börjar 14:00 i Ölmevalla Kyrka. Buss till Långedrags Värdshus avgår 16:00, mingel börjar 16:30 och middag 18:30.</p>
        <p>Varmt välkommen!<br>Elsa & Joakim</p>
      </div>`
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("RSVP request failed:", error);
    return NextResponse.json({ error: "Något gick fel. Försök igen." }, { status: 500 });
  }
}
