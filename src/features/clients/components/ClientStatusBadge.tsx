import { cn } from '#/lib/utils'
import { Badge } from '#/components/ui/badge'
import type { ClientStatus } from '#/features/clients/client.schema'

const STATUS_CLASS: Record<ClientStatus, string> = {
  Active: 'bg-success/15 text-success',
  Lead: 'bg-primary/10 text-primary',
  Inactive: 'bg-warning/15 text-warning',
}

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'h-5.5 rounded-md border-0 px-2 text-[12px] font-medium',
        STATUS_CLASS[status],
      )}
    >
      {status}
    </Badge>
  )
}
