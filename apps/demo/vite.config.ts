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
    vue(),
    // vueDevTools()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
})
