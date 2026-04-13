// ex. scripts/build_npm.ts
import { build, emptyDir } from '@deno/dnt'

await emptyDir('./dist-npm')

await build({
  entryPoints: [
    {
      kind: 'bin',
      name: 'layout-maxing', // command name
      path: './src/index.ts',
    },
  ],
  outDir: './dist-npm',
  shims: {
    deno: true,
  },
  skipNpmInstall: true,
  typeCheck: false,
  test: false,
  mappings: {
    '../layout-maxing/src/index.ts': {
      name: 'layout-maxing',
      version: '0.0.0',
    },
  },
  package: {
    // package.json properties
    name: 'layout-maxing-cli',
    version: Deno.args[0],
    description: 'A Max patch layout utility',
    license: 'MIT',
    repository: {
      type: 'git',
      url: 'git+https://github.com/darosh/layout-maxing.git',
    },
    bugs: {
      url: 'https://github.com/darosh/layout-maxing/issues',
    },
    // "bin": {
    //   "layout-maxing": "./esm/index.js",
    // },
  },
  postBuild() {
    Deno.copyFileSync('README.md', 'dist-npm/README.md')
  },
})
