import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        "surface-soft": "var(--surface-soft)",
        "surface-warm": "var(--surface-warm)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        border: "var(--border)",
        primary: "var(--primary)",
        "primary-dark": "var(--primary-dark)",
        "primary-soft": "var(--primary-soft)",
        blue: "var(--blue)",
        "blue-soft": "var(--blue-soft)",
        yellow: "var(--yellow)",
        "yellow-soft": "var(--yellow-soft)",
        orange: "var(--orange)",
        "orange-soft": "var(--orange-soft)",
        red: "var(--red)",
        "red-soft": "var(--red-soft)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        header: "var(--shadow-header)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "Plus Jakarta Sans",
          "Nunito Sans",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
