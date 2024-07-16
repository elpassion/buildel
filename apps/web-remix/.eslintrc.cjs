const path = require('path');

/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    "@remix-run/eslint-config",
    "@remix-run/eslint-config/node",
    path.resolve(__dirname, '../../eslint.config.common.cjs')
  ],
  rules: {
    "sort-imports": "off",
    "import/order": "off",
    "no-useless-constructor": "off",
    "react-hooks/exhaustive-deps": "off",
    "no-loop-func": "off"
  }
};
