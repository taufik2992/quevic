import { cn } from '#/lib/utils'
import { Badge } from '#/components/ui/badge'

type DocStatus =
  'Paid' | 'Sent' | 'Overdue' | 'Draft' | 'Accepted' | 'Viewed' | 'Expired'

const STATUS_CLASS: Record<DocStatus, string> = {
  Paid: 'bg-success/15 text-success',
  Accepted: 'bg-success/15 text-success',
  Sent: 'bg-primary/10 text-primary',
  Overdue: 'bg-destructive/10 text-destructive',
  Expired: 'bg-destructive/10 text-destructive',
  Draft: 'bg-muted text-muted-foreground',
  Viewed: 'bg-purple/15 text-purple',
}

export function StatusBadge({ status }: { status: DocStatus }) {
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
