import {
  ArrowDownRight,
  ArrowUpRight,
  FileText,
  TrendingUp,
  Users,
} from 'lucide-react'
import { cn } from '#/lib/utils'
import { Card, CardContent } from '#/components/ui/card'
import type { DashboardStat } from '#/features/dashboard/data/dashboard.types'

const TONE = {
  green: 'bg-success/10 text-success',
  blue: 'bg-primary/10 text-primary',
  red: 'bg-destructive/10 text-destructive',
  purple: 'bg-purple/10 text-purple',
} as const

const TONE_TEXT = {
  green: 'text-success',
  blue: 'text-primary',
  red: 'text-destructive',
  purple: 'text-purple',
} as const

const ICON = {
  revenue: TrendingUp,
  paid: FileText,
  outstanding: FileText,
  clients: Users,
} as const

function Sparkline({ tone }: { tone: keyof typeof TONE }) {
  if (tone === 'blue' || tone === 'purple') {
    return (
      <svg viewBox="0 0 64 40" className="h-10 w-14" aria-hidden>
        {[14, 24, 18, 32].map((h, i) => (
          <rect
            key={i}
            x={6 + i * 14}
            y={40 - h}
            width="9"
            height={h}
            rx="3"
            fill="currentColor"
            opacity={0.28 + i * 0.22}
          />
        ))}
      </svg>
    )
  }
  const d =
    tone === 'green'
      ? 'M2 30 C12 28 16 18 24 20 C32 22 30 12 40 10 C48 8 54 14 62 4 L62 38 L2 38 Z'
      : 'M2 14 C12 16 18 26 28 24 C38 22 40 30 50 28 C55 27 58 22 62 16 L62 38 L2 38 Z'
  const line =
    tone === 'green'
      ? 'M2 30 C12 28 16 18 24 20 C32 22 30 12 40 10 C48 8 54 14 62 4'
      : 'M2 14 C12 16 18 26 28 24 C38 22 40 30 50 28 C55 27 58 22 62 16'
  return (
    <svg viewBox="0 0 64 40" className="h-10 w-16" aria-hidden>
      <path d={d} fill="currentColor" opacity={0.12} />
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function StatCard({ stat }: { stat: DashboardStat }) {
  const Icon = ICON[stat.id]
  const DeltaIcon = stat.deltaDirection === 'up' ? ArrowUpRight : ArrowDownRight

  return (
    <Card className="gap-0 rounded-2xl border-border bg-card py-0 shadow-[0_1px_2px_rgba(16,24,40,0.05)] dark:shadow-none">
      <CardContent className="flex items-start gap-3 p-4">
        <span
          className={cn(
            'grid size-11 shrink-0 place-items-center rounded-xl',
            TONE[stat.tone],
          )}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] font-normal text-neutral-600">
            {stat.label}
          </p>
          <p className="mt-0.5 text-[17px] font-extrabold tracking-tight text-neutral-900">
            {stat.value}
          </p>
          <p
            className={cn(
              'mt-1 flex items-center gap-0.5 text-[12px] font-medium',
              stat.id === 'outstanding' ? 'text-destructive' : 'text-success',
            )}
          >
            <DeltaIcon className="size-3.5" />
            {stat.delta}
          </p>
        </div>
        <span className={TONE_TEXT[stat.tone]}>
          <Sparkline tone={stat.tone} />
        </span>
      </CardContent>
    </Card>
  )
}

export function StatsGrid({ stats }: { stats: DashboardStat[] }) {
  return (
    <section
      aria-label="Summary"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {stats.map((stat) => (
        <StatCard key={stat.id} stat={stat} />
      ))}
    </section>
  )
}
