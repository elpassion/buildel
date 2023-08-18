const { join } = require('path');
import { initDefaultTheme } from '@elpassion/taco';
import { merge } from 'lodash';

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  mode: 'jit',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    join(__dirname, './node_modules/@elpassion/taco/**/*.{js,jsx}'),
  ],
  theme: merge({}, initDefaultTheme(), {
  }),
  plugins: [require('@tailwindcss/forms')],
};
