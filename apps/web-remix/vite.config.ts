import { vitePlugin as remix } from '@remix-run/dev';
import { installGlobals } from '@remix-run/node';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

installGlobals();

export default defineConfig({
  ssr: {
  },
  server: {
    port: 3000,
    watch: {
      ignored: ['**/__tests__', '**/*.(test|spec).(ts|tsx|js|jsx)'],
    },
  },
  plugins: [
    tsconfigPaths(),
    remix({
      ignoredRouteFiles: ['**/.*'],
      future: {
        unstable_optimizeDeps: true,
      },
    }),
  ],
});
