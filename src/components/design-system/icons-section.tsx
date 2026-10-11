import {
  Bot,
  ChartColumn,
  FileText,
  House,
  LayoutTemplate,
  Receipt,
  Settings,
  SquareCheckBig,
  Users,
  Vote,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

const icons = [
  House,
  Receipt,
  FileText,
  Users,
  SquareCheckBig,
  LayoutTemplate,
  Vote,
  ChartColumn,
  Settings,
  Bot,
]

export function IconsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Icons</CardTitle>
        <CardDescription>Lucide sesuai iconLibrary shadcn.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-5 gap-2 sm:grid-cols-10">
        {icons.map((Icon, i) => (
          <div
            key={i}
            className="flex size-10 items-center justify-center rounded-md border border-border text-muted-foreground"
          >
            <Icon className="size-5" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
