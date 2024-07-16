const path = require('path');

module.exports = {
  ...require(path.resolve(__dirname, '../../prettier.config.base.cjs')),
  plugins: [
    ...require(path.resolve(__dirname, '../../prettier.config.base.cjs')).plugins || [],
    "@ianvs/prettier-plugin-sort-imports"
  ],
  importOrder: [
    '<BUILTIN_MODULES>',
    '<THIRD_PARTY_MODULES>',
    '^[.]',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,

};
