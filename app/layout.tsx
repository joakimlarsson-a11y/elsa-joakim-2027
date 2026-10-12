import type { Metadata } from "next";
import { Libre_Caslon_Display, Source_Sans_3 } from "next/font/google";
import { staticOrigin } from "@/lib/origin";
import "./globals.css";

const display = Libre_Caslon_Display({ subsets: ["latin"], weight: "400", variable: "--font-display", display: "swap" });
const sans = Source_Sans_3({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "Elsa & Joakim | 19 juni 2027",
  description: "Välkommen att fira Elsa och Joakims bröllop i sommar.",
  metadataBase: new URL(staticOrigin())
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sv" className={`${display.variable} ${sans.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
