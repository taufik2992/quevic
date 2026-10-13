import { createColumnHelper } from '@tanstack/react-table'
import { Ellipsis } from 'lucide-react'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import type { DataTableFeatures } from '#/components/data-table/data-table-features'
import { formatIDR } from '#/lib/format'
import type { ClientListItem } from '#/data/client.types'
import { ClientAvatar } from '#/features/clients/components/ClientAvatar'
import { ClientStatusBadge } from '#/features/clients/components/ClientStatusBadge'

export interface ClientColumnActions {
  onView: (client: ClientListItem) => void
  onEdit: (client: ClientListItem) => void
  onDelete: (client: ClientListItem) => void
}

const columnHelper = createColumnHelper<DataTableFeatures, ClientListItem>()

function ClientRowActions({
  client,
  actions,
}: {
  client: ClientListItem
  actions: ClientColumnActions
}) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground"
            aria-label={`More actions for ${client.companyName}`}
          >
            <Ellipsis data-icon="inline-start" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => actions.onView(client)}>
              View details
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => actions.onEdit(client)}>
              Edit client
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => actions.onDelete(client)}
            >
              Delete client
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function createClientColumns(actions: ClientColumnActions) {
  return columnHelper.columns([
    columnHelper.accessor('companyName', {
      header: 'Client',
      cell: ({ row }) => (
        <span className="flex items-center gap-2">
          <ClientAvatar
            logoUrl={row.original.logoUrl}
            name={row.original.companyName}
            size="xs"
          />
          <span
            title={row.original.companyName}
            className="max-w-37.5 truncate font-normal text-neutral-800"
          >
            {row.original.companyName}
          </span>
        </span>
      ),
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: ({ row }) => (
        <span
          title={row.original.email}
          className="block max-w-52 truncate text-[12.5px] text-neutral-600"
        >
          {row.original.email}
        </span>
      ),
    }),
    columnHelper.accessor('phone', {
      header: 'Phone',
      cell: ({ row }) => (
        <span className="block text-[12.5px] whitespace-nowrap text-neutral-600 tabular-nums">
          {row.original.phone ?? '—'}
        </span>
      ),
    }),
    columnHelper.accessor('invoiceCount', {
      header: () => <span className="block text-center">Total Invoices</span>,
      cell: ({ row }) => (
        <span className="block text-center text-[12.5px] text-neutral-800">
          {row.original.invoiceCount}
        </span>
      ),
    }),
    columnHelper.accessor('proposalCount', {
      header: () => <span className="block text-center">Total Proposals</span>,
      cell: ({ row }) => (
        <span className="block text-center text-[12.5px] text-neutral-800">
          {row.original.proposalCount}
        </span>
      ),
    }),
    columnHelper.accessor('totalSpent', {
      header: 'Total Spent',
      cell: ({ row }) => (
        <span className="text-[12.5px] whitespace-nowrap text-neutral-800 tabular-nums">
          {formatIDR(row.original.totalSpent)}
        </span>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ row }) => <ClientStatusBadge status={row.original.status} />,
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <ClientRowActions client={row.original} actions={actions} />
      ),
    }),
  ])
}
