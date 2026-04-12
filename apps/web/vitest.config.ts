import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import { svelte } from '@sveltejs/vite-plugin-svelte';

const alias = (path: string) => ({
  find: `@/${path}`,
  replacement: fileURLToPath(new URL(`./src/${path}`, import.meta.url)),
});

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: [
      {
        find: '@shared',
        replacement: fileURLToPath(new URL('../../shared', import.meta.url)),
      },
      alias(''),
      alias('domain'),
      alias('application'),
      alias('adapters'),
      alias('infrastructure'),
      alias('ui'),
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['src/**/*.svelte'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/domain/**', 'src/lib/**', '../../shared/auth/**'],
      exclude: ['src/**/*.d.ts', 'src/test/**', 'src/main.ts'],
    },
  },
});
