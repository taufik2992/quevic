import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

const charts = [
  { label: 'Primary', hex: '#3B82F6', bars: [40, 60, 100], barClass: 'bg-chart-1' },
  { label: 'Success', hex: '#10B981', bars: [50, 70, 100], barClass: 'bg-chart-2' },
  { label: 'Warning', hex: '#F59E0B', bars: [40, 65, 100], barClass: 'bg-chart-3' },
  { label: 'Error', hex: '#EF4444', bars: [45, 65, 100], barClass: 'bg-chart-4' },
  { label: 'Purple', hex: '#8B5CF6', bars: [55, 70, 100], barClass: 'bg-chart-5' },
]

export function ChartsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chart Colors</CardTitle>
        <CardDescription>
          Token --chart-1 sampai --chart-5 dari DesignToken.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {charts.map((c) => (
          <div key={c.label} className="flex flex-col gap-2">
            <div className="flex h-24 items-end gap-1.5">
              {c.bars.map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className={`w-full rounded-md ${c.barClass} ${i === 2 ? '' : i === 1 ? 'opacity-70' : 'opacity-40'}`}
                />
              ))}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium">{c.label}</span>
              <span className="text-[11px] text-muted-foreground">{c.hex}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
