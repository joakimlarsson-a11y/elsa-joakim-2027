import type { Config } from "tailwindcss";

// Palett: Långedrag en junikväll – djupt hav, granit, kvällsljus och tapetens röda.
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#16252e",
        sea: "#1f4e5f",
        ember: "#9a3a28",
        dusk: "#f1d3b3",
        shell: "#f1e9dd",
        foam: "#dbe6e5",
        paper: "#f9f5ef"
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 18px 40px -12px rgba(22, 37, 46, 0.28)"
      }
    }
  },
  plugins: []
};

export default config;
