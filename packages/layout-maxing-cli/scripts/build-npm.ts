// ex. scripts/build_npm.ts
import { build, emptyDir } from '@deno/dnt'

await emptyDir('./dist-npm')

await build({
  entryPoints: ['./src/index.ts'],
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
    description: 'Your package.',
    license: 'MIT',
    repository: {
      type: 'git',
      url: 'git+https://github.com/username/repo.git',
    },
    bugs: {
      url: 'https://github.com/username/repo/issues',
    },
  },
  postBuild() {
    Deno.copyFileSync('README.md', 'dist-npm/README.md')
  },
})
