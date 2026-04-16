import { configMeta } from './meta.ts'

export function help(): string {
  const lines: string[] = ['Config options (--key value):\n']
  for (const [key, [def, min, max, step, desc]] of Object.entries(configMeta)) {
    const range = typeof def === 'boolean' ? `boolean, default: ${def}` : `default: ${def}, min: ${min}, max: ${max}${step !== null ? `, step: ${step}` : ''}`
    lines.push(`  --${key.padEnd(26)} ${desc}\n    (${range})`)
  }
  return lines.join('\n')
}
