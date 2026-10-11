import { Send } from 'lucide-react'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

const rows = [
  { label: 'Primary', variant: 'default' },
  { label: 'Secondary', variant: 'secondary' },
  { label: 'Outline', variant: 'outline' },
  { label: 'Ghost', variant: 'ghost' },
] as const

export function ButtonsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Buttons</CardTitle>
        <CardDescription>
          Varian shadcn Button yang dipetakan ke token quevic.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground">
          <span />
          <span>Default</span>
          <span>Hover</span>
          <span>Disabled</span>
        </div>
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-4 items-center gap-2">
            <span className="text-xs text-muted-foreground">{row.label}</span>
            <Button variant={row.variant}>
              <Send data-icon="inline-start" />
              Button
            </Button>
            <Button variant={row.variant} className="opacity-90 brightness-95">
              <Send data-icon="inline-start" />
              Button
            </Button>
            <Button variant={row.variant} disabled>
              <Send data-icon="inline-start" />
              Button
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
