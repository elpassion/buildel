// Options: https://prettier.io/docs/en/options.html

const base = require('../../prettier.config.base.cjs');

/** @type {import("prettier").Config} */
const config = {
  ...base,
  plugins: [require('prettier-plugin-tailwindcss')],
};

module.exports = config;
