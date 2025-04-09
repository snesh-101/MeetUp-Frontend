
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // this ensures Tailwind scans all components
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("daisyui"),
  ],
  // daisyui: {
  //   themes: ["light", "dark", "cupcake"], // all themes you want to use
  //   darkTheme: "dark",                    // theme to use when system prefers dark
  //   base: true,  
  // },
}
