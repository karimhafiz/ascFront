/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        pink: {
          700: "#be185d",
        },
        purple: {
          700: "#7c3aed",
        },
        indigo: {
          700: "#4338ca",
        },
      },
      borderRadius: {
        DEFAULT: "0.75rem",
      },
      boxShadow: {
        card: "0 4px 32px 0 rgba(80, 80, 120, 0.08)",
        button: "0 2px 8px 0 rgba(80, 80, 120, 0.08)",
      },
      backgroundImage: {
        "gradient-body":
          "linear-gradient(135deg, #fce7f3 0%, #ede9fe 50%, #c7d2fe 100%)",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        pastel: {
          primary: "#f9a8d4",
          secondary: "#c4b5fd",
          accent: "#a7bffa",
          neutral: "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#f3e8ff",
          "base-300": "#ede9fe",
          info: "#7dd3fc",
          success: "#86efac",
          warning: "#fcd34d",
          error: "#fca5a5",
        },
      },
    ],
  },
};
