import { defineConfig } from 'vite-plus'

export default defineConfig({
  pack: {
    dts: {
      tsgo: true,
    },
    exports: true,
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
    ignorePatterns: ['dist-npm'],
  },
  fmt: {
    ignorePatterns: ['dist-npm'],
  },
})
