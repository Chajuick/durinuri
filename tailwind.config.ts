import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        border: "var(--border)",
        text: "var(--text)",
        "text-sub": "var(--text-sub)",
        "text-faint": "var(--text-faint)",
        primary: "var(--primary)",
        "primary-ink": "var(--primary-ink)",
        "primary-bg": "var(--primary-bg)",
        ok: "var(--ok)",
        "ok-bg": "var(--ok-bg)",
        warn: "var(--warn)",
        "warn-bg": "var(--warn-bg)",
        danger: "var(--danger)",
        "danger-bg": "var(--danger-bg)",
        "you-bg": "var(--you-bg)",
        "you-ink": "var(--you-ink)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
      borderRadius: {
        sm: "10px",
        md: "16px",
        lg: "20px",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        float: "var(--shadow-float)",
      },
    },
  },
  plugins: [],
};

export default config;
