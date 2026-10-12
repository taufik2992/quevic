import { ArrowUpDown } from 'lucide-react'
import type { Column, RowData } from '@tanstack/react-table'
import { Button } from '#/components/ui/button'
import type { DataTableFeatures } from './data-table-features'

export function SortableHeader<TData extends RowData, TValue>({
  column,
  label,
}: {
  column: Column<DataTableFeatures, TData, TValue>
  label: string
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      className="h-auto gap-1 p-0 text-[12px] font-medium text-neutral-600 hover:bg-transparent hover:text-neutral-900"
    >
      {label}
      <ArrowUpDown className="size-3.5 text-muted-foreground" />
    </Button>
  )
}
