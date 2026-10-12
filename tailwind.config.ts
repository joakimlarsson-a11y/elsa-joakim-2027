import type { Config } from "tailwindcss";

// Palett: skandinavisk sand och sten – varm kol, skiffer, lera och linne.
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#2a2622",
        sea: "#3f5054",
        ember: "#8a4a30",
        dusk: "#e9dccb",
        shell: "#ece6dc",
        foam: "#e3dcd0",
        paper: "#f6f2ec"
      },
      fontFamily: {
        display: ["var(--font-sans)", "system-ui", "sans-serif"],
        accent: ["var(--font-accent)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 18px 40px -12px rgba(42, 38, 34, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
