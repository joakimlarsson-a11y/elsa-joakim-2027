import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"]
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Elsa & Joakim | 19 juni 2027",
  description: "Välkommen att fira Elsa och Joakims bröllop i sommar.",
  metadataBase: new URL("https://elsaochjoakim.se")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sv">
      <body className={`${display.variable} ${sans.variable}`}>{children}</body>
    </html>
  );
}
