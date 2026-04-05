import { expect, test } from 'vite-plus/test'

test('import', async () => {
  const cli = await import('../src/index.ts')
  expect(cli).toBeDefined()
})
