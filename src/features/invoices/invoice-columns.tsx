import { createColumnHelper } from '@tanstack/react-table'
import { formatIDR } from '#/lib/format'
import type { RecentInvoice } from '#/data/dashboard.types'
import { ClientCell } from '#/components/data-table/client-cell'
import { RowActionsCell } from '#/components/data-table/row-actions-cell'
import { SortableHeader } from '#/components/data-table/sortable-header'
import { StatusBadge } from '#/components/data-table/status-badge'
import type { DataTableFeatures } from '#/components/data-table/data-table-features'

const columnHelper = createColumnHelper<DataTableFeatures, RecentInvoice>()

export const invoiceColumns = columnHelper.columns([
  columnHelper.accessor('id', {
    header: 'Invoice',
    cell: ({ row }) => (
      <span className="text-[12.5px] font-medium text-primary">
        {row.original.id}
      </span>
    ),
  }),
  columnHelper.accessor((row) => row.client, {
    id: 'client',
    header: 'Client',
    cell: ({ row }) => (
      <ClientCell
        initials={row.original.clientInitials}
        tone={row.original.clientTone}
        name={row.original.client}
      />
    ),
  }),
  columnHelper.accessor('amount', {
    header: ({ column }) => <SortableHeader column={column} label="Amount" />,
    cell: ({ row }) => (
      <span className="text-[12.5px] text-neutral-800">
        {formatIDR(row.original.amount)}
      </span>
    ),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  }),
  columnHelper.accessor('date', {
    header: ({ column }) => <SortableHeader column={column} label="Date" />,
    cell: ({ row }) => (
      <span className="text-[12.5px] text-muted-foreground">
        {row.original.date}
      </span>
    ),
  }),
  columnHelper.display({
    id: 'actions',
    header: '',
    cell: ({ row }) => <RowActionsCell id={row.original.id} label="Invoice" />,
  }),
])
