import { Ellipsis } from 'lucide-react'
import { useToast } from '#/providers/toast-provider'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'

export function RowActionsCell({ id, label }: { id: string; label: string }) {
  const { showToast } = useToast()

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(id)
      showToast({
        title: 'Copied to clipboard',
        description: `${label} ${id}`,
        status: 'success',
      })
    } catch {
      showToast({
        title: 'Copy failed',
        description: 'Please try again.',
        status: 'error',
      })
    }
  }

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground"
            aria-label={`More actions for ${id}`}
          >
            <Ellipsis data-icon="inline-start" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={handleCopyId}>
              Copy {label.toLowerCase()} ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() =>
                showToast({
                  title: 'Coming soon',
                  description: `Detail view for ${id} is not available yet.`,
                  status: 'info',
                })
              }
            >
              View details
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
