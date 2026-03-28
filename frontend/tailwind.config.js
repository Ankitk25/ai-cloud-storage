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
        cyanAccent: '#00eaff',   // bright neon cyan
        cyanSoft: '#00bcd4',     // softer cyan
      },
    },
  },
};
