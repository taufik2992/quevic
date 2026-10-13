import {
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  User,
  UserX,
  Users,
} from 'lucide-react'
import { cn } from '#/lib/utils'
import { Card, CardContent } from '#/components/ui/card'
import type { ClientStats as ClientStatsData } from '#/data/client.types'

interface StatCardDef {
  id: string
  label: string
  value: string
  delta: string
  deltaDirection: 'up' | 'down' | 'flat'
  icon: typeof Users
  iconTone: string
}

function MiniBars({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={cn('h-10 w-14', className)} aria-hidden>
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

function formatDelta(pct: number | null, suffix = 'from last month') {
  if (pct === null) return { text: 'No change yet', direction: 'flat' as const }
  if (pct === 0) return { text: `0% ${suffix}`, direction: 'flat' as const }
  const direction = pct > 0 ? ('up' as const) : ('down' as const)
  return { text: `${Math.abs(pct)}% ${suffix}`, direction }
}

function toCards(stats: ClientStatsData): StatCardDef[] {
  const active = formatDelta(stats.activeDeltaPct)
  const fresh = formatDelta(stats.newDeltaPct)
  const inactive = formatDelta(stats.inactiveDeltaPct)
  return [
    {
      id: 'total',
      label: 'Total Clients',
      value: String(stats.total),
      delta: `${stats.totalNewThisMonth} this month`,
      deltaDirection: 'up',
      icon: Users,
      iconTone: 'bg-purple/10 text-purple',
    },
    {
      id: 'active',
      label: 'Active Clients',
      value: String(stats.active),
      delta: active.text,
      deltaDirection: active.direction,
      icon: User,
      iconTone: 'bg-success/10 text-success',
    },
    {
      id: 'new',
      label: 'New Clients',
      value: String(stats.newClients),
      delta: fresh.text,
      deltaDirection: fresh.direction,
      icon: Clock,
      iconTone: 'bg-primary/10 text-primary',
    },
    {
      id: 'inactive',
      label: 'Inactive Clients',
      value: String(stats.inactive),
      delta: inactive.text,
      deltaDirection: inactive.direction,
      icon: UserX,
      iconTone: 'bg-destructive/10 text-destructive',
    },
  ]
}

export function ClientStats({ stats }: { stats: ClientStatsData }) {
  return (
    <section
      aria-label="Client statistics"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {toCards(stats).map((stat) => {
        const Icon = stat.icon
        const DeltaIcon =
          stat.deltaDirection === 'down' ? ArrowDownRight : ArrowUpRight
        return (
          <Card
            key={stat.id}
            className="gap-0 rounded-2xl border-border bg-card py-0 shadow-[0_1px_2px_rgba(16,24,40,0.05)] dark:shadow-none"
          >
            <CardContent className="flex items-start gap-3 p-4">
              <span
                className={cn(
                  'grid size-11 shrink-0 place-items-center rounded-xl',
                  stat.iconTone,
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
                    stat.deltaDirection === 'down'
                      ? 'text-destructive'
                      : 'text-success',
                  )}
                >
                  {stat.deltaDirection === 'flat' ? null : (
                    <DeltaIcon className="size-3.5" />
                  )}
                  {stat.delta}
                </p>
              </div>
              <MiniBars className="text-primary-300" />
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}
