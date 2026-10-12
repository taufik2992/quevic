import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { dashboardSummaryQuery } from '#/features/dashboard/dashboard.queries'
import { GreetingHeader } from '#/features/dashboard/components/greeting-header'
import { StatsGrid } from '#/features/dashboard/components/stats-grid'
import { RevenueOverview } from '#/features/dashboard/components/revenue-overview'
import { QuickActions } from '#/features/dashboard/components/quick-actions'
import {
  RecentInvoices,
  RecentProposals,
} from '#/features/dashboard/components/recent-tables'

export const Route = createFileRoute('/_authenticated/dashboard')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(dashboardSummaryQuery()),
  component: DashboardPage,
})

function DashboardPage() {
  const { data } = useSuspenseQuery(dashboardSummaryQuery())

  return (
    <main className="flex flex-col gap-4 pb-4">
      <GreetingHeader name={data.greetingName} />
      <StatsGrid stats={data.stats} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_600px]">
        <RevenueOverview data={data.revenue} />
        <QuickActions />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <RecentInvoices rows={data.invoices} />
        <RecentProposals rows={data.proposals} />
      </div>
    </main>
  )
}
