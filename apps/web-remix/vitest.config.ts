import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    server: {
      deps: {
        inline: ["@elpassion/taco"],
      },
    },
  },
  resolve: {
    alias: {
      "~": resolve(__dirname, "./app"),
      "~/components": resolve(__dirname, "./app/components"),
      "~/test-utils": resolve(__dirname, "./app/test-utils"),
    },
  },
});