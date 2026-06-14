/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface:   "#ffffff",
        card:      "#ffffff",
        border:    "#ededed",
        secondary: "#fafafa",
        dark:      "#1c1c1c",
        ink:       "#171717",
        muted:     "#707070",
        faint:     "#9a9a9a",
        whisper:   "#b2b2b2",
        emerald:   "#3ecf8e",
        // Teal accent — Navigator's leading/positive colour
        forest: {
          50:  "#f0faf9",
          100: "#d0f4ec",
          200: "#a3e9d8",
          300: "#6dd5be",
          400: "#3dbea8",
          500: "#2a9d8a",
          600: "#2f7d8a",
          700: "#235f6b",
          800: "#1a4c58",
          900: "#113540",
        },
        pillar: {
          e: "#2f7d8a",
          s: "#7a5ea8",
          g: "#8a6d2f",
        },
        leading: "#2f7d8a",
        lagging: "#c0492f",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        card:         "0 1px 2px 0 rgb(0 0 0 / 0.04)",
        "card-hover": "0 4px 10px 0 rgb(0 0 0 / 0.07)",
      },
    },
  },
  plugins: [],
}
