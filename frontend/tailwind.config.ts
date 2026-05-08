import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forge: {
          purple: "#31084C",
          gold: "#D3AF37",
          parchment: "#D9D9D9",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
        medieval: ["var(--font-medieval)"],
      },
      boxShadow: {
        dark: "-10px_10px_10px_rgba(0,0,0,0.9)",
      },
    },
  },
  plugins: [],
}

export default config