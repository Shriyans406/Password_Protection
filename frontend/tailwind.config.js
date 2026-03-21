/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        vault: "#0f172a", // Deep dark blue
        neon: "#22c55e",  // Security green
      },
    },
  },
  plugins: [],
};