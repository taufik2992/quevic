const IDR = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatIDR(value: number): string {
  return IDR.format(value).replace('Rp', 'Rp ')
}

const COMPACT = new Intl.NumberFormat('en', { notation: 'compact' })

export function formatCompact(value: number): string {
  return COMPACT.format(value)
}
