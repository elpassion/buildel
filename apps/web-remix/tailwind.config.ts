import { join } from "path";
import { initDefaultTheme } from "@elpassion/taco";
import { merge } from "lodash";

console.log(__dirname);

export default {
  darkMode: "class",
  mode: "jit",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    join(__dirname, "./node_modules/@elpassion/taco/**/*.{js,jsx}"),
  ],
  theme: merge({}, initDefaultTheme(), {}),
  plugins: [require("@tailwindcss/forms")],
};
