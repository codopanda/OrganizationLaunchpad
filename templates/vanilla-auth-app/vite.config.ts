import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: '@shared',
        replacement: fileURLToPath(new URL('../../shared', import.meta.url)),
      },
    ],
  },
});
