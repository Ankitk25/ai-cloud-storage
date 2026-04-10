/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "#6D28D9",     // purple
        primaryDark: "#4C1D95",
        primaryLight: "#C4B5FD",

        bgDark: "#1E1B4B",      // dark purple bg
        bgGradientStart: "#4C1D95",
        bgGradientEnd: "#6D28D9",

        dashboardBg: "#F3F3F3",
        sidebarDark: "#2E1065"
      }
    }
  },
};


