/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0B",
        porcelain: "#FAFAF7",
        mist: "#F4F4F0",
        line: "#EAEAE4",
        muted: "#71717A",
        faint: "#A1A1AA",
        accent: {
          DEFAULT: "#047857",
          soft: "#ECFDF5",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Fraunces", "Georgia", "serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "22px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};
