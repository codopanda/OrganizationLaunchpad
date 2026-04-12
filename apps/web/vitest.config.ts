import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';

const alias = (path: string) => ({
  find: `@/${path}`,
  replacement: fileURLToPath(new URL(`./src/${path}`, import.meta.url)),
});

export default defineConfig({
  resolve: {
    alias: [
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
      include: ['src/domain/**', 'src/application/**', 'src/adapters/**', 'src/lib/**'],
      exclude: ['src/**/*.d.ts', 'src/test/**', 'src/main.ts'],
    },
  },
});
