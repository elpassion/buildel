import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import tailwindcss from "tailwindcss";
import tsconfigPaths from "vite-tsconfig-paths";
//@ts-ignore
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      //@ts-ignore
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["cjs", "es"],
      name: "buildel-chat",
      fileName: "index",
    },
    rollupOptions: {
      external: ["react", "react-dom"],
    },
    emptyOutDir: true,
  },
  plugins: [react(), dts(), tsconfigPaths()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
});
