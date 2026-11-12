import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        canvas: "var(--canvas)",
        panel: {
          DEFAULT: "var(--panel)",
          2: "var(--panel-2)",
        },
        navy: {
          DEFAULT: "var(--navy)",
          light: "var(--navy-light)",
          mid: "var(--navy-mid)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          dark: "var(--accent-dark)",
          warm: "var(--accent-warm)",
        },
        muted: "var(--muted)",
        danger: "var(--danger)",
        ok: "var(--ok)",
      },
      fontFamily: {
        sans: ["var(--font-body)", "ui-sans-serif", "sans-serif"],
        display: ["var(--font-display)", "ui-sans-serif", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,0.25)",
        glow: "0 0 24px rgba(61, 214, 198, 0.2)",
      },
    },
  },
  plugins: [],
};
export default config;
