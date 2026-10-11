import { NextResponse } from "next/server";
import { createSessionClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (code) {
    try {
      const supabase = await createSessionClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(`${origin}/admin`);
      console.error("exchangeCodeForSession failed:", error);
    } catch (error) {
      console.error(error);
    }
  }
  return NextResponse.redirect(`${origin}/admin/login?error=link`);
}
