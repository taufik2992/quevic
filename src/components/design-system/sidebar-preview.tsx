import {
  Bot,
  FileText,
  House,
  LayoutTemplate,
  Receipt,
  Users,
} from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Separator } from '#/components/ui/separator'

const nav = [
  { label: 'Dashboard', icon: House, active: true },
  { label: 'Invoices', icon: Receipt, active: false },
  { label: 'Proposals', icon: FileText, active: false },
  { label: 'Clients', icon: Users, active: false },
  { label: 'Templates', icon: LayoutTemplate, active: false },
  { label: 'AI Assistant', icon: Bot, active: false, badge: 'New' },
]

export function SidebarPreview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sidebar</CardTitle>
        <CardDescription>Contoh pemakaian token di navigasi.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1 rounded-xl border border-sidebar-border bg-sidebar p-3">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary font-bold text-primary-foreground">
              P
            </div>
            <span className="text-sm font-semibold text-sidebar-foreground">
              quevic
            </span>
          </div>
          <Separator />
          {nav.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className={
                item.active
                  ? 'justify-start bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  : 'justify-start text-sidebar-foreground hover:bg-sidebar-accent/50'
              }
            >
              <item.icon data-icon="inline-start" />
              {item.label}
              {item.badge ? (
                <Badge className="ml-auto bg-primary-100 text-primary-700">
                  {item.badge}
                </Badge>
              ) : null}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
