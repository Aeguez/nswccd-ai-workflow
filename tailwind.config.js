/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#020617",
        panel: "#091324",
        line: "rgba(110, 231, 255, 0.16)",
        cyan: {
          glow: "#67e8f9",
        },
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', '"JetBrains Mono"', '"Fira Code"', "monospace"],
      },
      boxShadow: {
        panel:
          "0 18px 60px rgba(2, 6, 23, 0.45), inset 0 1px 0 rgba(148, 163, 184, 0.06)",
      },
      backgroundImage: {
        "mission-grid":
          "repeating-linear-gradient(90deg, rgba(148, 163, 184, 0.03) 0, rgba(148, 163, 184, 0.03) 1px, transparent 1px, transparent 72px)",
      },
    },
  },
  plugins: [],
};
