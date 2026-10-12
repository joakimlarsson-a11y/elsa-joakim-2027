import type { Metadata } from "next";
import { staticOrigin } from "@/lib/origin";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elsa & Joakim | 19 juni 2027",
  description: "Välkommen att fira Elsa och Joakims bröllop i sommar.",
  metadataBase: new URL(staticOrigin())
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sv">
      <body>{children}</body>
    </html>
  );
}
