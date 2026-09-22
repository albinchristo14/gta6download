import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./content/**/*.mdx",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f2ff",
          100: "#ece5ff",
          200: "#d9caff",
          300: "#bd9fff",
          400: "#9c6bff",
          500: "#7f3dfb",
          600: "#6d22e8",
          700: "#5b17c1",
          800: "#4b169e",
          900: "#3f167f",
          950: "#1d0743",
        },
        sunset: {
          400: "#ff9d57",
          500: "#f97316",
          600: "#ea6a0b",
        },
        palm: {
          400: "#34e2c8",
          500: "#12c9ad",
        },
        ink: {
          950: "#07070c",
          900: "#0d0d16",
          850: "#12121d",
          800: "#1a1a28",
          700: "#262636",
          600: "#3a3a4d",
          500: "#5f5f75",
          400: "#8b8ba0",
          300: "#b6b6c8",
          200: "#d7d7e3",
          100: "#eeeff4",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(127, 61, 251, 0.55)",
        card: "0 1px 2px rgba(7,7,12,0.05), 0 8px 24px -12px rgba(7,7,12,0.12)",
      },
      maxWidth: {
        content: "72rem",
      },
    },
  },
  plugins: [],
};
export default config;
