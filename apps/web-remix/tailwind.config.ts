import {
  colorsTokenHelpers,
  initDefaultTheme,
  radiusTokenHelpers,
} from '@elpassion/taco';
import merge from 'lodash.merge';
import { join } from 'path';

import radiusJson from './tokens/borderRadius.json';
import colorsJson from './tokens/colors.json';

const defaultTheme = require('tailwindcss/defaultTheme');

const { getColorsConfig, getComponentsColorConfig } = colorsTokenHelpers;
const { getRadiusConfig, getComponentsRadiusConfig } = radiusTokenHelpers;

const colorsPalette = getColorsConfig(colorsJson);
const radiusPalette = getRadiusConfig(radiusJson);

const importJson = (component: string) =>
  require(`./tokens/components/${component}.json`);

const customConfig = {
  extend: {
    fontFamily: {
      sans: ['DM Sans', ...defaultTheme.fontFamily.sans],
    },
    typography: {
      DEFAULT: {
        css: {
          color: '#EBEBEB',
          fontSize: '12px',
          lineHeight: '20px',
        },
      },
    },
    ...merge(
      //@ts-ignore
      ...getComponentsColorConfig(
        [
          'spinner',
          'navbar',
          'sidebar',
          'accordion',
          'inlineMessage',
          'badge',
          'checkbox',
          'chips',
          'tooltip',
          'card',
          'anchor',
          'avatar',
          'avatarGroup',
          'buttonGroup',
          'smallFileUpload',
          'dragAndDropFileUpload',
          'button',
          'breadcrumbs',
          'iconButton',
          'indicator',
          'inputAutocomplete',
          'inputCode',
          'inputQuantity',
          'inputNumber',
          'inputText',
          'notification',
          'items',
          'radio',
          'navTabs',
          'toast',
          'inputText',
          'label',
          'rangeSlider',
          'progressBar',
          'modal',
          'toggle',
          'dropdown',
          'textArea',
          'input',
          'rating',
          'radioCard',
        ],
        importJson,
        colorsJson,
      ),
      {
        colors: colorsPalette,
      },
    ),
    ...merge(
      //@ts-ignore
      ...getComponentsRadiusConfig(
        [
          'spinner',
          'navbar',
          'sidebar',
          'accordion',
          'inlineMessage',
          'badge',
          'checkbox',
          'chips',
          'tooltip',
          'card',
          'anchor',
          'avatar',
          'avatarGroup',
          'buttonGroup',
          'smallFileUpload',
          'dragAndDropFileUpload',
          'button',
          'breadcrumbs',
          'iconButton',
          'indicator',
          'inputAutocomplete',
          'inputCode',
          'inputQuantity',
          'inputNumber',
          'inputText',
          'notification',
          'items',
          'radio',
          'navTabs',
          'toast',
          'inputText',
          'label',
          'rangeSlider',
          'progressBar',
          'modal',
          'toggle',
          'dropdown',
          'textArea',
          'input',
          'rating',
          'radioCard',
        ],
        importJson,
        radiusJson,
      ),
      {
        borderRadius: radiusPalette,
      },
    ),
  },
};

const shadcnConfig = {
  container: {
    center: true,
    padding: '2rem',
    screens: {
      '2xl': '1400px',
    },
  },
  extend: {
    colors: {
      border: 'hsl(var(--border))',
      input: 'hsl(var(--input))',
      ring: 'hsl(var(--ring))',
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      primary: {
        DEFAULT: 'hsl(var(--primary))',
        foreground: 'hsl(var(--primary-foreground))',
      },
      secondary: {
        DEFAULT: 'hsl(var(--secondary))',
        foreground: 'hsl(var(--secondary-foreground))',
      },
      destructive: {
        DEFAULT: 'hsl(var(--destructive))',
        foreground: 'hsl(var(--destructive-foreground))',
      },
      muted: {
        DEFAULT: 'hsl(var(--muted))',
        foreground: 'hsl(var(--muted-foreground))',
      },
      accent: {
        DEFAULT: 'hsl(var(--accent))',
        foreground: 'hsl(var(--accent-foreground))',
      },
      popover: {
        DEFAULT: 'hsl(var(--popover))',
        foreground: 'hsl(var(--popover-foreground))',
      },
      card: {
        DEFAULT: 'hsl(var(--card))',
        foreground: 'hsl(var(--card-foreground))',
      },
    },
    borderRadius: {
      lg: 'var(--radius)',
      md: 'calc(var(--radius) - 2px)',
      sm: 'calc(var(--radius) - 4px)',
    },
    keyframes: {
      'accordion-down': {
        from: { height: '0' },
        to: { height: 'var(--radix-accordion-content-height)' },
      },
      'accordion-up': {
        from: { height: 'var(--radix-accordion-content-height)' },
        to: { height: '0' },
      },
    },
    animation: {
      'accordion-down': 'accordion-down 0.2s ease-out',
      'accordion-up': 'accordion-up 0.2s ease-out',
    },
  },
};

export default {
  darkMode: ['class'],
  mode: 'jit',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    join(__dirname, './node_modules/@elpassion/taco/**/*.{js,jsx}'),
  ],
  theme: merge({}, initDefaultTheme(), customConfig, shadcnConfig),
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
};
