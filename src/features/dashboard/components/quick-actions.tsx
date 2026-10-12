import { FileText, Sparkles, TrendingUp, UserPlus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Button } from '#/components/ui/button'

const ACTIONS = [
  {
    label: 'Create Invoice',
    icon: FileText,
    tile: 'bg-primary/10 text-primary',
  },
  {
    label: 'Create Proposal',
    icon: FileText,
    tile: 'bg-purple/10 text-purple',
  },
  {
    label: 'Use AI Assistant',
    icon: Sparkles,
    tile: 'bg-purple/10 text-purple',
  },
  {
    label: 'Add Client',
    icon: UserPlus,
    tile: 'bg-success/10 text-success',
  },
] as const

export function QuickActions() {
  return (
    <Card className="gap-0 rounded-2xl border-border bg-card py-0 shadow-[0_1px_2px_rgba(16,24,40,0.05)] dark:shadow-none">
      <CardHeader className="px-5 pt-4">
        <CardTitle className="text-[16px] font-bold text-neutral-900">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-5 pb-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          {ACTIONS.map((a) => (
            <button
              key={a.label}
              type="button"
              className="group flex flex-col items-center gap-2 rounded-2xl bg-muted px-2 py-4 transition-colors hover:bg-neutral-100"
            >
              <span
                className={`grid size-11 place-items-center rounded-2xl ${a.tile}`}
              >
                <a.icon className="size-5" />
              </span>
              <span className="text-center text-[12px] leading-tight font-medium text-neutral-900">
                {a.label}
              </span>
            </button>
          ))}
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-accent to-muted p-4">
          <span className="absolute top-3 right-3 grid size-7 place-items-center rounded-full bg-purple text-purple-foreground shadow-lg">
            <Sparkles className="size-3.5" />
          </span>
          <p className="max-w-[62%] text-[15px] leading-snug font-bold text-neutral-900">
            Create Professional Documents with AI
          </p>
          <p className="mt-1.5 max-w-[62%] text-[12.5px] leading-snug text-neutral-600">
            Generate invoices and proposals instantly from a simple prompt.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3 h-9 rounded-xl bg-card/80 text-[13px] font-semibold text-accent-foreground shadow-sm hover:bg-card"
          >
            <TrendingUp
              data-icon="inline-start"
              className="size-4 text-primary"
            />
            Try AI Assistant
          </Button>

          <div
            aria-hidden
            className="absolute -right-2 -bottom-6 hidden w-33 rotate-[8deg] sm:block"
          >
            <div className="rounded-lg border bg-card p-2 shadow-xl">
              <div className="flex items-center gap-1.5">
                <span className="grid size-5 place-items-center rounded-md bg-primary text-[10px] font-black text-primary-foreground">
                  P
                </span>
                <span className="h-1.5 w-16 rounded-full bg-border" />
              </div>
              <div className="mt-2 flex flex-col gap-1.5">
                {[90, 70, 80].map((w, i) => (
                  <span
                    key={i}
                    className="h-1.5 rounded-full bg-accent"
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="h-4 w-12 rounded-md bg-primary" />
                <span className="h-4 w-10 rounded-md bg-accent" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
