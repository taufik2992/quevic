import { queryOptions } from '@tanstack/react-query'
import { dashboardDummy } from '#/features/dashboard/data/dashboard.dummy'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: () => [...dashboardKeys.all, 'summary'] as const,
}

async function fetchDashboardSummary() {
  // TODO: replace with real API call, e.g. fetch('/api/dashboard/summary')
  // Keep the same return shape (DashboardSummary) so UI stays untouched.
  return dashboardDummy
}

export function dashboardSummaryQuery() {
  return queryOptions({
    queryKey: dashboardKeys.summary(),
    queryFn: fetchDashboardSummary,
    initialData: dashboardDummy,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  })
}
