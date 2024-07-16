const path = require('path');

/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    "@remix-run/eslint-config",
    "@remix-run/eslint-config/node",
    path.resolve(__dirname, '../../eslint.config.common.cjs')
  ],
  rules: {
    "no-useless-constructor": "off"
  }
};
