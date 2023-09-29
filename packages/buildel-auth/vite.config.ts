import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";
// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ["ts-utils"],
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["cjs", "es"],
      name: "buildel-auth",
      fileName: "index",
    },
    rollupOptions: {
      external: ["js-sha256"],
    },
  },

  plugins: [tsconfigPaths(), dts()],
});
