
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  mode: 'jit',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: [],
  plugins: [require('@tailwindcss/forms')],
};
