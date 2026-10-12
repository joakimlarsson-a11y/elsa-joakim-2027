"use client";

import { useEffect, useState } from "react";

type Link = { href: string; label: string };

/** Fast flikrad längst ner på mobil. Döljs medan heron syns; utan JS är den alltid synlig. */
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
      className={`on-dark fixed inset-x-0 bottom-0 z-40 border-t border-white/15 bg-ink/95 pb-[env(safe-area-inset-bottom)] text-white transition-[opacity,transform] duration-300 md:hidden ${hidden ? "invisible translate-y-full opacity-0" : "visible"}`}
    >
      <ul className="grid grid-cols-4">
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href} className={`flex min-h-14 items-center justify-center px-1 text-sm tracking-[.02em] ${link.href === "#osa" ? "text-dusk" : ""}`}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
