// Options: https://prettier.io/docs/en/options.html

/** @type {import("prettier").Config} */
const config = {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: "as-needed",
  jsxSingleQuote: false,
  trailingComma: "all",
  bracketSpacing: true,
  bracketSameLine: false,
  // jsxBracketSameLine: false, // [Deprecated]
  arrowParens: "always",
  // rangeStart: 0,
  // rangeEnd: 'Infinity',
  // parser: "",
  // filepath: "",
  requirePragma: false,
  insertPragma: false,
  proseWrap: "never",
  htmlWhitespaceSensitivity: "css",
  vueIndentScriptAndStyle: false,
  endOfLine: "lf",
  embeddedLanguageFormatting: "auto",
  singleAttributePerLine: false,
};

module.exports = config;
