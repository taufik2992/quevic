interface Swatch {
  name: string
  className: string
  hex: string
}

export function ColorScale({
  title,
  swatches,
}: {
  title: string
  swatches: Swatch[]
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
        {swatches.map((s) => (
          <div key={s.name} className="flex flex-col gap-1.5">
            <div
              className={`h-10 w-full rounded-md border border-border ${s.className}`}
              title={`${s.name} ${s.hex}`}
            />
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-foreground">
                {s.name}
              </span>
              <span className="text-[10px] text-muted-foreground">{s.hex}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export const PRIMARY_SWATCHES: Swatch[] = [
  { name: '50', className: 'bg-primary-50', hex: '#EFF6FF' },
  { name: '100', className: 'bg-primary-100', hex: '#DBEAFE' },
  { name: '200', className: 'bg-primary-200', hex: '#BFDBFE' },
  { name: '300', className: 'bg-primary-300', hex: '#93C5FD' },
  { name: '400', className: 'bg-primary-400', hex: '#60A5FA' },
  { name: '500', className: 'bg-primary-500', hex: '#3B82F6' },
  { name: '600', className: 'bg-primary-600', hex: '#2563EB' },
  { name: '700', className: 'bg-primary-700', hex: '#1D4ED8' },
  { name: '800', className: 'bg-primary-800', hex: '#1E40AF' },
  { name: '900', className: 'bg-primary-900', hex: '#1E3A8A' },
]

export const NEUTRAL_SWATCHES: Swatch[] = [
  { name: '50', className: 'bg-neutral-50', hex: '#F9FAFB' },
  { name: '100', className: 'bg-neutral-100', hex: '#F3F4F6' },
  { name: '200', className: 'bg-neutral-200', hex: '#E5E7EB' },
  { name: '300', className: 'bg-neutral-300', hex: '#D1D5DB' },
  { name: '400', className: 'bg-neutral-400', hex: '#9CA3AF' },
  { name: '500', className: 'bg-neutral-500', hex: '#6B7280' },
  { name: '600', className: 'bg-neutral-600', hex: '#4B5563' },
  { name: '700', className: 'bg-neutral-700', hex: '#374151' },
  { name: '800', className: 'bg-neutral-800', hex: '#1F2937' },
  { name: '900', className: 'bg-neutral-900', hex: '#111827' },
]

export const SEMANTIC_SWATCHES: Swatch[] = [
  { name: 'Success', className: 'bg-success', hex: '#10B981' },
  { name: 'Warning', className: 'bg-warning', hex: '#F59E0B' },
  { name: 'Error', className: 'bg-error', hex: '#EF4444' },
  { name: 'Info', className: 'bg-info', hex: '#3B82F6' },
  { name: 'Purple', className: 'bg-purple', hex: '#8B5CF6' },
]
