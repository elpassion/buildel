import { vitePlugin as remix } from '@remix-run/dev';
import { installGlobals } from '@remix-run/node';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

installGlobals();

export default defineConfig({
  ssr: {
    noExternal: ['@elpassion/taco'],
  },
  build:{
    minify: false,
    terserOptions: {
      compress: false,
      mangle: false,
    }
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
    }),
  ],
});
