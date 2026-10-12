import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { ChartContainer, ChartTooltip } from '#/components/ui/chart'
import type { ChartConfig } from '#/components/ui/chart'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { formatIDR } from '#/lib/format'
import type { RevenuePoint } from '#/data/dashboard.types'

const RANGES = ['Last 6 months', 'Last 3 months', 'Last 12 months'] as const
const MAX_DOMAIN = 40_000_000

const chartConfig = {
  paid: { label: 'Paid', color: 'var(--chart-1)' },
  outstanding: {
    label: 'Outstanding',
    theme: { light: '#d7e3ff', dark: '#475569' },
  },
} satisfies ChartConfig

function RevenueTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ payload: RevenuePoint }>
  label?: string | number
}) {
  const point = payload?.[0]?.payload
  if (!active || !point) return null

  return (
    <div className="relative w-44 rounded-xl border border-white/10 bg-[#0f172a] p-3 text-white shadow-xl">
      <p className="text-[11.5px] font-medium text-white/80">{label} 2026</p>
      <p className="mt-1.5 flex items-center justify-between text-[11.5px]">
        <span className="flex items-center gap-1.5 text-white/70">
          <span className="size-1.5 rounded-full bg-[#60a5fa]" /> Paid
        </span>
        <span className="font-semibold">{formatIDR(point.paid)}</span>
      </p>
      <p className="mt-1 flex items-center justify-between text-[11.5px]">
        <span className="flex items-center gap-1.5 text-white/70">
          <span className="size-1.5 rounded-full bg-[#cbd5e1]" /> Outstanding
        </span>
        <span className="font-semibold">{formatIDR(point.outstanding)}</span>
      </p>
      <span className="absolute -bottom-1 left-1/2 size-2.5 -translate-x-1/2 rotate-45 bg-[#0f172a]" />
    </div>
  )
}

export function RevenueOverview({ data }: { data: RevenuePoint[] }) {
  const [range, setRange] = useState<(typeof RANGES)[number]>('Last 6 months')

  const points = useMemo(() => {
    if (range === 'Last 3 months') return data.slice(-3)
    return data.slice(-6)
  }, [data, range])

  return (
    <Card className="gap-0 rounded-2xl border-border bg-card py-0 shadow-[0_1px_2px_rgba(16,24,40,0.05)] dark:shadow-none">
      <CardHeader className="flex-row items-center justify-between px-5 pt-4">
        <CardTitle className="text-[16px] font-bold text-neutral-900">
          Revenue Overview
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg text-[12.5px] font-medium shadow-none"
            >
              {range}
              <ChevronDown
                data-icon="inline-end"
                className="size-3.5 text-muted-foreground"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuGroup>
              {RANGES.map((r) => (
                <DropdownMenuItem key={r} onSelect={() => setRange(r)}>
                  {r}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="px-5 pt-1 pb-5">
        <div className="flex items-center justify-end gap-4 text-[12px] font-medium text-neutral-600">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-chart-1" /> Paid
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#d7e3ff] dark:bg-[#475569]" />{' '}
            Outstanding
          </span>
        </div>

        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-55 w-full"
        >
          <BarChart data={points} barCategoryGap="28%" barGap={6}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 11.5 }}
            />
            <YAxis
              domain={[0, MAX_DOMAIN]}
              ticks={[0, 10_000_000, 20_000_000, 30_000_000, 40_000_000]}
              tickFormatter={(v: number) =>
                v === 0 ? '0' : `${v / 1_000_000}M`
              }
              tickLine={false}
              axisLine={false}
              width={36}
              tick={{ fontSize: 11 }}
            />
            <ChartTooltip
              content={<RevenueTooltip />}
              cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
            />
            <Bar
              dataKey="paid"
              name="paid"
              fill="var(--color-paid)"
              radius={[6, 6, 2, 2]}
              maxBarSize={26}
            />
            <Bar
              dataKey="outstanding"
              name="outstanding"
              fill="var(--color-outstanding)"
              radius={[6, 6, 2, 2]}
              maxBarSize={26}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
