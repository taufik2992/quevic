import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { DataTable } from '#/components/data-table/data-table'
import { invoiceColumns } from '#/features/invoices/invoice-columns'
import { proposalColumns } from '#/features/proposals/proposal-columns'
import type {
  RecentInvoice,
  RecentProposal,
} from '#/features/dashboard/data/dashboard.types'

function RecentCard({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <Card className="min-w-0 gap- rounded-2xl border-border bg-card py-0 shadow-[0_1px_2px_rgba(16,24,40,0.05)] dark:shadow-none">
      <CardHeader className="flex w-full flex-row items-center justify-between px-5 pt-4">
        <CardTitle className="text-[15px] font-bold text-neutral-900">
          {title}
        </CardTitle>
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-[13px] font-medium text-primary"
        >
          View All
        </Button>
      </CardHeader>
      <CardContent className="px-3 pb-3">{children}</CardContent>
    </Card>
  )
}

export function RecentInvoices({ rows }: { rows: RecentInvoice[] }) {
  return (
    <RecentCard title="Recent Invoices">
      <DataTable columns={invoiceColumns} data={rows} />
    </RecentCard>
  )
}

export function RecentProposals({ rows }: { rows: RecentProposal[] }) {
  return (
    <RecentCard title="Recent Proposals">
      <DataTable columns={proposalColumns} data={rows} />
    </RecentCard>
  )
}
