import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1d2140",
        plum: "#44336d",
        lavender: "#d8d3eb",
        mist: "#f5f3fa",
        sky: "#d9e8f0"
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"]
      },
      boxShadow: {
        soft: "0 18px 50px rgba(45, 35, 87, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
