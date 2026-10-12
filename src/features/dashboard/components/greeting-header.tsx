import { ChevronDown, Plus, Sparkles } from 'lucide-react'
import { Button } from '#/components/ui/button'

export function GreetingHeader({ name }: { name: string }) {
  return (
    <section className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-[24px] font-extrabold tracking-tight text-neutral-900">
          Good morning, {name}!{' '}
          <span role="img" aria-label="waving hand">
            👋
          </span>
        </h1>
        <p className="mt-1 text-[13.5px] font-normal text-neutral-600">
          Create and manage your invoices &amp; proposals with AI. Work faster,
          look more professional.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2.5">
        <Button
          variant="outline"
          className="h-11 rounded-xl border-primary/30 bg-card text-[13.5px] font-semibold text-accent-foreground shadow-sm hover:bg-accent"
        >
          <Sparkles data-icon="inline-start" className="size-4 text-primary" />
          Generate with AI
        </Button>
        <Button className="h-11 rounded-xl bg-primary px-4 text-[13.5px] font-semibold text-primary-foreground shadow-[0_6px_16px_rgba(37,99,235,0.35)] hover:bg-primary/90">
          <Plus data-icon="inline-start" className="size-4" />
          Create New
          <ChevronDown data-icon="inline-end" className="size-4 opacity-80" />
        </Button>
      </div>
    </section>
  )
}
