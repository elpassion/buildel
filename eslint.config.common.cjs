/** @type {import('eslint').Linter.Config} */
const config = {
  rules: {
    // Set custom import order
    // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/order.md
    "import/order": [
      "error",
      {
        alphabetize: {
          caseInsensitive: true,
          order: "asc",
        },
        "newlines-between": "never",
        warnOnUnassignedImports: true,
        pathGroupsExcludedImportTypes: ["builtin"],
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
          "object",
          "type",
          "unknown",
        ],
        pathGroups: [
          {
            pattern: "*.{css,scss,sass}",
            patternOptions: { matchBase: true },
            group: "unknown",
            position: "after",
          },
          {
            pattern: "react",
            group: "external",
            position: "before",
          },
          {
            pattern: "next",
            group: "external",
            position: "before",
          },
          {
            pattern: "next/**",
            group: "external",
            position: "before",
          },
          {
            group: "external",
            pattern: "@elpassion/**",
            position: "after",
          },
          {
            group: "internal",
            pattern: "~/**",
            position: "after",
          },
        ],
      },
    ],
    "sort-imports": [
      "error",
      {
        ignoreDeclarationSort: true,
      },
    ],
  },
};

module.exports = config;
