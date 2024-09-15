/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
  		bangna: ['BangnaNew', 'sans-serif'],
			opun: ['OpunMai', 'sans-serif'],
			opunbold: ['OpunMaiBold', 'sans-serif'],
			opunsemibold: ['OpunMaiSemiBold', 'sans-serif'],
  		},
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: ["light", "dark", "corporate","nord"],
  },
}

