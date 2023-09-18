import { join } from "path";
import { initDefaultTheme, colorsTokenHelpers } from "@elpassion/taco";
import merge from "lodash.merge";
import colorsJson from "./tokens/colors.json";
const { getColorsConfig, getComponentsColorConfig } = colorsTokenHelpers;

const palette = getColorsConfig(colorsJson);

const importJson = (component: string) =>
  require(`./tokens/components/${component}.json`);

const customConfig = {
  extend: {
    ...merge(
      //@ts-ignore
      ...getComponentsColorConfig(
        ["button", ["iconButton"]],
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
