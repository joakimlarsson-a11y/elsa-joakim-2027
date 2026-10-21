"use client";

import { useEffect, useState } from "react";

type Link = { href: string; label: string };

/** Fast glasmeny på desktop. Tonen följer underlaget: mörk över heron, ljus därunder. */
export default function SiteHeader({ links }: { links: Link[] }) {
  const [overHero, setOverHero] = useState(true);

  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero || !("IntersectionObserver" in window)) return;
    // Byt ton när menyns underkant lämnar heron, inte när heron försvinner helt.
    const observer = new IntersectionObserver(([entry]) => setOverHero(entry.isIntersecting), { rootMargin: "-80px 0px -100% 0px" });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <header className={`absolute inset-x-0 top-0 z-50 text-white md:fixed md:px-6 md:pt-4 ${overHero ? "on-dark" : ""}`}>
      <nav
        aria-label="Huvudnavigation"
        className={`mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 md:glass md:py-2 md:pl-7 md:pr-4 ${overHero ? "md:glass-dark" : "md:glass-light"}`}
      >
        <a className="font-display text-2xl" href="#top" aria-label="Elsa och Joakim, till toppen">E<span className={`font-accent ${overHero ? "text-dusk" : "md:text-ember"}`}>&</span>J</a>
        <ul className="hidden gap-1 text-base font-medium tracking-[.02em] md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={`inline-block rounded-full px-4 py-2 transition-colors duration-300 ${overHero ? "hover:bg-white/15" : "hover:bg-ink/[.07]"}`}>{link.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
