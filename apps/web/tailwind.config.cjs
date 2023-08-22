import { join } from 'path';
import { initDefaultTheme } from '@elpassion/taco';
import { merge } from 'lodash';
import { defaultBreakpoints } from './src/modules/Config/theme.config';

const customTheme = {
  extend: {
    screens: {
      mobile: { max: defaultBreakpoints.mobile.max },
      tablet: { min: defaultBreakpoints.tablet.min, max: defaultBreakpoints.tablet.max },
      desktop: { min: defaultBreakpoints.desktop.min },
    },
  },
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  mode: 'jit',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    join(__dirname, './node_modules/@elpassion/taco/**/*.{js,jsx}'),
  ],
  theme: merge({}, initDefaultTheme(), customTheme),
  plugins: [require('@tailwindcss/forms')],
};
