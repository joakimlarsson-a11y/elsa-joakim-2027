/** Kustlinje som skiljer sektionerna åt. Färgen ärvs från `className` (text-*). */
export default function Shoreline({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 1440 48" preserveAspectRatio="none" className={`shoreline ${flip ? "rotate-180" : ""} ${className}`}>
      <path fill="currentColor" d="M0 30 C 120 14, 220 40, 360 28 S 600 8, 760 24 S 1020 44, 1180 26 S 1380 12, 1440 22 L 1440 48 L 0 48 Z" />
    </svg>
  );
}
