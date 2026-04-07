import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const { version } = JSON.parse(readFileSync('./package.json', 'utf-8'))
// import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  // fmt: {
  //   semi: false,
  //   singleQuote: true,
  // },
  // lint: {
  //   plugins: ["eslint", "typescript", "unicorn", "oxc", "vue", "vitest"],
  //   env: {
  //     browser: true,
  //   },
  //   categories: {
  //     correctness: "error",
  //   },
  //   options: {
  //     typeAware: true,
  //     typeCheck: true,
  //   },
  // },
  plugins: [
    // vueDevTools()
    {
      name: 'maxpat-json',
      enforce: 'pre',

      // Use `load` hook instead of `transform` — it's more reliable for custom module types in Rolldown
      load(id) {
        if (id.endsWith('.maxpat') || id.endsWith('.rnbopat')) {
          try {
            const content = readFileSync(id, 'utf-8')
            const json = JSON.parse(content)

            // Return as a proper JS module that exports the JSON object
            return {
              code: `export default ${JSON.stringify(json)}`,
              map: null,
              // Important for Rolldown: tell it this is JavaScript, not raw JSON or other type
              moduleType: 'js',
            }
          } catch (err) {
            console.error('Failed to parse .maxpat as JSON:', id)
            throw err
          }
        }
      },
    },
    vue(),
  ],

  assetsInclude: ['**/*.maxpat', '**/*.rnbopat'],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
})
