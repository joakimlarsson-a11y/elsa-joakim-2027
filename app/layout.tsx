import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elsa & Joakim | 19 juni 2027",
  description: "Välkommen att fira Elsa och Joakims bröllop i sommar.",
  metadataBase: new URL("https://elsaochjoakim.se")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sv">
      <body>{children}</body>
    </html>
  );
}
