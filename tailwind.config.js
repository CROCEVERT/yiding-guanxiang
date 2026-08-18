/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#090806",
        lacquer: "#15100c",
        bronze: "#b8894a",
        cinnabar: "#a8422d",
        jade: "#87a88a",
        parchment: "#eadfca",
      },
      boxShadow: {
        ritual: "0 24px 80px rgba(0, 0, 0, 0.45)",
      },
      fontFamily: {
        display: ["Noto Serif SC", "Songti SC", "serif"],
        body: ["Noto Serif SC", "Songti SC", "Microsoft YaHei", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
