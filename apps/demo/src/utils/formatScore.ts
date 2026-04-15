const SP = '\u2009'

export function formatScore(n: number | undefined | null): string {
  if (n === undefined || n === null) return '-'
  if (n >= 1_000_000_000_000_000_000_000_000_000_000_000) return `∞`
  if (n >= 1_000_000_000_000_000_000_000_000_000_000) return `${(n / 1_000_000_000_000_000_000_000_000_000_000).toFixed(1)}${SP}Q`
  if (n >= 1_000_000_000_000_000_000_000_000_000) return `${(n / 1_000_000_000_000_000_000_000_000_000).toFixed(1)}${SP}R`
  if (n >= 1_000_000_000_000_000_000_000_000) return `${(n / 1_000_000_000_000_000_000_000_000).toFixed(1)}${SP}Y`
  if (n >= 1_000_000_000_000_000_000_000) return `${(n / 1_000_000_000_000_000_000_000).toFixed(1)}${SP}Z`
  if (n >= 1_000_000_000_000_000_000) return `${(n / 1_000_000_000_000_000_000).toFixed(1)}${SP}E`
  if (n >= 1_000_000_000_000_000) return `${(n / 1_000_000_000_000_000).toFixed(1)}${SP}P`
  if (n >= 1_000_000_000_000) return `${(n / 1_000_000_000_000).toFixed(1)}${SP}T`
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}${SP}G`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}${SP}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}${SP}k`
  return n.toFixed(0)
}

export function formatFullScore(score?: number) {
  if (score === undefined) {
    return '?'
  }

  const str = score.toLocaleString('en-US', { maximumFractionDigits: 0 })!

  if (str.length <= 20) return str

  const sliced = str.slice(0, 20)
  const lastCommaIndex = sliced.lastIndexOf(',')

  return lastCommaIndex !== -1 ? `${sliced.slice(0, lastCommaIndex + 1)}…` : `${sliced}…`
}
