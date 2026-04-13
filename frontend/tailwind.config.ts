import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Raktio design tokens
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        border:      "hsl(var(--border))",
        ring:        "hsl(var(--ring))",

        primary: {
          DEFAULT:   "hsl(var(--primary))",
          foreground:"hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:   "hsl(var(--secondary))",
          foreground:"hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT:   "hsl(var(--muted))",
          foreground:"hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:   "hsl(var(--accent))",
          foreground:"hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT:   "hsl(var(--destructive))",
          foreground:"hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT:   "hsl(var(--card))",
          foreground:"hsl(var(--card-foreground))",
        },

        // Raktio semantic colors
        sentiment: {
          positive: "#22c55e",
          neutral:  "#94a3b8",
          negative: "#ef4444",
        },
        alert: {
          soft:     "#fbbf24",
          warning:  "#f97316",
          urgent:   "#ef4444",
        },

        // Platform identity colors
        platform: {
          x:         "#000000",
          reddit:    "#ff4500",
          instagram: "#e1306c",
          tiktok:    "#010101",
          linkedin:  "#0077b5",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
