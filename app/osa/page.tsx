import { redirect } from "next/navigation";

// Äldre inbjudningslänkar pekade hit; OSA ligger nu på startsidan.
export default async function OsaPage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const { token } = await searchParams;
  redirect(typeof token === "string" && token.trim() ? `/?token=${encodeURIComponent(token.trim())}#osa` : "/#osa");
}
