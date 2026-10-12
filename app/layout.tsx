import type { Metadata } from "next";
import { Cormorant_Garamond, Hanken_Grotesk } from "next/font/google";
import { staticOrigin } from "@/lib/origin";
import "./globals.css";

const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
// Bara för ornament: et-tecknet, citat och bildtexter.
const accent = Cormorant_Garamond({ subsets: ["latin"], weight: "400", style: "italic", variable: "--font-accent", display: "swap" });

export const metadata: Metadata = {
  title: "Elsa & Joakim | 19 juni 2027",
  description: "Välkommen att fira Elsa och Joakims bröllop i sommar.",
  metadataBase: new URL(staticOrigin())
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sv" className={`${sans.variable} ${accent.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
