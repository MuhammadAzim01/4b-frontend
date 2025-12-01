/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#195de6",
        "background-light": "#f6f6f8",
        "background-dark": "#111621",
        "eva-blue": "#2A52BE",
        "eva-white": "#FFFFFF",
        "eva-off-white": "#F8F9FA",
        "eva-border": "#DEE2E6",
        "eva-text": "#212529",
        "eva-debit": "#DC3545",
        "eva-credit": "#198754",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
    },
  },
  plugins: [],
}
