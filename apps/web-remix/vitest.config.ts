import dotenv from 'dotenv';
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

dotenv.config({ path: '.env.test' });

export default defineConfig({
  test: {
    setupFiles: [
      './app/tests/setupFiles.ts',
      './app/tests/CodeMirror.mock.tsx',
    ],
    environment: 'jsdom',
    globals: true,
    server: {
      deps: {
        inline: ['@elpassion/taco'],
      },
    },
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, './app'),
      '~/components': resolve(__dirname, './app/components'),
      '~/test-utils': resolve(__dirname, './app/test-utils'),
    },
  },
});
