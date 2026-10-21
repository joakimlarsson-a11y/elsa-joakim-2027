"use client";

import { useEffect, useState } from "react";

type Link = { href: string; label: string };

/** Svävande glasflikrad längst ner på mobil. Döljs medan heron syns; utan JS är den alltid synlig. */
export default function MobileNav({ links }: { links: Link[] }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setHidden(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Snabbnavigation"
      className={`glass glass-light fixed inset-x-3 bottom-[calc(.75rem+env(safe-area-inset-bottom))] z-40 p-1 transition-[opacity,transform,background-color] duration-300 md:hidden ${hidden ? "invisible translate-y-[calc(100%+1.5rem)] opacity-0" : "visible"}`}
    >
      <ul className="grid grid-cols-4">
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href} className={`flex min-h-12 items-center justify-center rounded-full px-1 text-sm tracking-[.02em] ${link.href === "#osa" ? "font-semibold" : ""}`}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
