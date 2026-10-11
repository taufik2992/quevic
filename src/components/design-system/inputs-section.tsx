import { CircleAlert } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { cn } from '#/lib/utils'

function FieldRow({
  label,
  state,
  inputClassName,
  inputProps,
}: {
  label: string
  state: string
  inputClassName?: string
  inputProps?: React.ComponentProps<typeof Input>
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-xs text-muted-foreground">{state}</span>
      </div>
      <Input
        placeholder="Enter your text"
        className={cn(inputClassName)}
        {...inputProps}
      />
    </div>
  )
}

export function InputsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Input Field</CardTitle>
        <CardDescription>
          State default, focused, error, dan disabled.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FieldRow label="Default" state="Default" />
        <FieldRow
          label="Focused"
          state="Focused"
          inputClassName="border-primary ring-2 ring-ring/50"
        />
        <FieldRow
          label="Error"
          state="Error"
          inputClassName="border-error text-error placeholder:text-error/60"
          inputProps={{ 'aria-invalid': true }}
        />
        <FieldRow label="Disabled" state="Disabled" inputProps={{ disabled: true }} />
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <CircleAlert data-icon="inline-start" className="size-4" />
          Error memakai token --error, focus memakai --ring.
        </p>
      </CardContent>
    </Card>
  )
}
