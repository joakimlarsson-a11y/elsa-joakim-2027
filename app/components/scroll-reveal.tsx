"use client";

import { useEffect } from "react";

export default function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    const root = document.documentElement;
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    // Mark what's already on screen as visible before hiding the rest, so nothing flickers.
    for (const el of elements) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-visible");
    }
    root.classList.add("reveal-enabled");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );

    for (const el of elements) {
      if (!el.classList.contains("is-visible")) observer.observe(el);
    }

    return () => {
      observer.disconnect();
      root.classList.remove("reveal-enabled");
    };
  }, []);

  return null;
}
