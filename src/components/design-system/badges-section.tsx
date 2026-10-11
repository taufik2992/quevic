import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'

const items = [
  { label: 'Default', className: '' },
  { label: 'Primary', className: 'border-transparent bg-primary-100 text-primary-700' },
  { label: 'Success', className: 'border-transparent bg-success/15 text-success' },
  { label: 'Warning', className: 'border-transparent bg-warning/15 text-warning' },
  { label: 'Error', className: 'border-transparent bg-error/15 text-error' },
  { label: 'Info', className: 'border-transparent bg-info/15 text-info' },
  { label: 'Purple', className: 'border-transparent bg-purple/15 text-purple' },
]

export function BadgesSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Badges</CardTitle>
        <CardDescription>
          Badge shadcn dengan warna kustom dari token semantic.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Badge variant="outline">Default</Badge>
        {items.slice(1).map((item) => (
          <Badge key={item.label} className={item.className}>
            {item.label}
          </Badge>
        ))}
      </CardContent>
    </Card>
  )
}
