const path = require('path');

/** @type {import("prettier").Config} */
module.exports = {
  ...require(path.resolve(__dirname, '../../prettier.config.base.cjs')),
  plugins: [
    "@ianvs/prettier-plugin-sort-imports"
  ],
  importOrder: [
    '^react$',
    '^react(.*)$',
    '^@remix-run/(.*)$',
    '<THIRD_PARTY_MODULES>',
    '<BUILTIN_MODULES>',
    '',
    '^@/(.*)$',
    '^~/(.*)$',
    '',
    '^[./]',
    '',
    "^(?!.*[.]css$)[./].*$", ".css$"
  ],
};
