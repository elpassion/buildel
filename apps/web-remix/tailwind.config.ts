import { join } from "path";
import { initDefaultTheme, colorsTokenHelpers } from "@elpassion/taco";
import merge from "lodash.merge";
import colorsJson from "./tokens/colors.json";
const defaultTheme = require("tailwindcss/defaultTheme");

const { getColorsConfig, getComponentsColorConfig } = colorsTokenHelpers;

const palette = getColorsConfig(colorsJson);

const importJson = (component: string) =>
  require(`./tokens/components/${component}.json`);

const customConfig = {
  extend: {
    fontFamily: {
      sans: ["DM Sans", ...defaultTheme.fontFamily.sans],
    },
    ...merge(
      //@ts-ignore
      ...getComponentsColorConfig(
        [
          "navbar",
          "sidebar",
          "accordion",
          "inlineMessage",
          "badge",
          "checkbox",
          "chips",
          "tooltip",
          "card",
          "anchor",
          "avatar",
          "avatarGroup",
          "buttonGroup",
          "smallFileUpload",
          "dragAndDropFileUpload",
          "button",
          "breadcrumbs",
          "iconButton",
          "indicator",
          "inputAutocomplete",
          "inputCode",
          "inputQuantity",
          "inputNumber",
          "inputText",
          "notification",
          "items",
          "radio",
          "navTabs",
          "toast",
          "inputText",
          "label",
          "rangeSlider",
          "progressBar",
          "modal",
          "toggle",
          "dropdown",
          "textArea",
          "input",
          "rating",
          "radioCard",
        ],
        importJson,
        colorsJson
      ),
      {
        colors: {
          ...palette,
        },
      }
    ),
  },
};

export default {
  darkMode: "class",
  mode: "jit",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    join(__dirname, "./node_modules/@elpassion/taco/**/*.{js,jsx}"),
  ],
  theme: merge({}, initDefaultTheme(), customConfig),
  plugins: [require("@tailwindcss/forms")],
};
