import { join } from "path";
import {
  initDefaultTheme,
  colorsTokenHelpers,
  radiusTokenHelpers,
} from "@elpassion/taco";
import merge from "lodash.merge";
import colorsJson from "./tokens/colors.json";
import radiusJson from "./tokens/borderRadius.json";
const defaultTheme = require("tailwindcss/defaultTheme");

const { getColorsConfig, getComponentsColorConfig } = colorsTokenHelpers;
const { getRadiusConfig, getComponentsRadiusConfig } = radiusTokenHelpers;

const colorsPalette = getColorsConfig(colorsJson);
const radiusPalette = getRadiusConfig(radiusJson);

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
          "spinner",
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
        colors: colorsPalette,
      }
    ),
    ...merge(
      //@ts-ignore
      ...getComponentsRadiusConfig(
        [
          "spinner",
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
        radiusJson
      ),
      {
        borderRadius: radiusPalette,
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
