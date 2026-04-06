import { defineConfig } from 'vite-plus'

export default defineConfig({
  // fmt: {},
  // lint: { options: { typeAware: true, typeCheck: true } },
  fmt: {
    semi: false,
    singleQuote: true,
  },
  lint: {
    plugins: ['eslint', 'typescript', 'unicorn', 'oxc', 'vue', 'vitest'],
    env: {
      browser: true,
    },
    categories: {
      correctness: 'error',
    },
    options: {
      typeAware: true,
    },
    ignorePatterns: ['docs/'],
  },
  run: {
    cache: true,
  },
})
