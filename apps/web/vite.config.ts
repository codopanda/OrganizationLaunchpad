import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { fileURLToPath } from 'url'

const alias = (path: string) => ({
  find: `@/${path}`,
  replacement: fileURLToPath(new URL(`./src/${path}`, import.meta.url)),
})

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
})
