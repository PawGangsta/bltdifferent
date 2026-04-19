import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          500: "#00d4ff",
        },
        neon: {
          green: "#00ff88",
          pink: "#ff006e",
          blue: "#0066ff",
        },
        void: {
          900: "#0a0e27",
          800: "#1a1a2e",
          700: "#16213e",
        },
        gray: {
          primary: "#e0e0e0",
          secondary: "#888899",
          muted: "#555566",
        },
      },
      fontFamily: {
        mono: ["IBM Plex Mono", "Courier New", "monospace"],
        code: ["Fira Code", "Courier Prime", "monospace"],
      },
      fontSize: {
        "display-1": ["64px", { lineHeight: "1.1", letterSpacing: "0.05em" }],
        "display-2": ["48px", { lineHeight: "1.1", letterSpacing: "0.05em" }],
        "display-3": ["36px", { lineHeight: "1.2", letterSpacing: "0.05em" }],
      },
      boxShadow: {
        glow: "0 0 20px rgba(0, 212, 255, 0.3)",
        "glow-lg": "0 0 30px rgba(0, 212, 255, 0.5)",
        "glow-green": "0 0 20px rgba(0, 255, 136, 0.3)",
        "glow-pink": "0 0 20px rgba(255, 0, 110, 0.3)",
      },
      backgroundImage: {
        "blueprint-grid": `
          linear-gradient(0deg, transparent 24%, rgba(0,102,255,0.1) 25%, rgba(0,102,255,0.1) 26%, transparent 27%, transparent 74%, rgba(0,102,255,0.1) 75%, rgba(0,102,255,0.1) 76%, transparent 77%, transparent),
          linear-gradient(90deg, transparent 24%, rgba(0,102,255,0.1) 25%, rgba(0,102,255,0.1) 26%, transparent 27%, transparent 74%, rgba(0,102,255,0.1) 75%, rgba(0,102,255,0.1) 76%, transparent 77%, transparent)
        `,
      },
      backgroundSize: {
        "grid-60": "60px 60px",
      },
    },
  },
  plugins: [],
};

export default config;
