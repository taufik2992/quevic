import { Link, useRouterState } from '@tanstack/react-router'
import {
  Building2,
  FileSpreadsheet,
  Home,
  LayoutTemplate,
  Notebook,
  Settings,
  Sparkle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  badge?: string
}

const NAV: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/invoices', label: 'Invoices', icon: FileSpreadsheet },
  {
    href: '/proposals',
    label: 'Proposals',
    icon: Notebook,
  },
  {
    href: '/ai-assisten',
    label: 'Ai-assisten',
    icon: Sparkle,
  },
  {
    href: '/clients',
    label: 'Clients',
    icon: Building2,
  },
  {
    href: '/templates',
    label: 'Templates',
    icon: LayoutTemplate,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
  },
] as const

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <img
        src="/quevic-logo.png"
        alt="Quevic logo"
        className="size-8 object-contain"
      />
      <span className="leading-tight">
        <span className="block text-[19px] font-extrabold tracking-tight text-neutral-900">
          Quevic
        </span>
        <span className="block text-[11px] font-normal text-muted-foreground">
          Invoice &amp; Proposal with AI
        </span>
      </span>
    </div>
  )
}

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <aside className="flex h-full w-full flex-col rounded-2xl border-border bg-card px-3 py-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] dark:shadow-none">
      <BrandMark />

      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon
          const className = cn(
            'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13.5px] font-medium transition-colors',
            isActive
              ? 'bg-accent text-accent-foreground'
              : 'text-neutral-600 hover:bg-muted hover:text-neutral-900',
          )
          const content = (
            <>
              <Icon
                className={cn(
                  'size-4.5 shrink-0',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {'badge' in item && item.badge ? (
                <Badge
                  variant="secondary"
                  className="h-5 rounded-full bg-primary/10 px-2 text-[11px] font-semibold text-primary"
                >
                  {item.badge}
                </Badge>
              ) : null}
            </>
          )
          // Items with a real route file render a TanStack <Link/>;
          // the rest stay buttons until their route is added.
          if (item.href) {
            return (
              <Link
                key={item.label}
                to={item.href}
                onClick={onNavigate}
                className={className}
              >
                {content}
              </Link>
            )
          }
          return (
            <button
              key={item.label}
              type="button"
              onClick={onNavigate}
              className={className}
              title={`${item.label} (coming soon)`}
            >
              {content}
            </button>
          )
        })}
      </nav>

      <div className="relative mt-4 overflow-hidden rounded-2xl bg-linear-to-b from-accent to-muted p-4">
        <div className="absolute -right-8 -bottom-10 size-24 rounded-full bg-primary/15" />
        <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
          <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden>
            <path d="M12 2l2.9 6.26 6.6.57-5 4.36 1.5 6.45L12 16.9 5.99 19.64l1.5-6.45-5-4.36 6.6-.57L12 2z" />
          </svg>
        </span>
        <p className="mt-2.5 text-[14px] font-bold text-neutral-900">
          Upgrade to Pro
        </p>
        <p className="mt-1 text-[12px] leading-snug text-neutral-600">
          Unlock AI, custom domain and more.
        </p>
        <Button className="mt-3 h-9 w-full rounded-[10px] bg-primary text-[13px] font-semibold text-primary-foreground hover:bg-primary/90">
          Upgrade Now
        </Button>
      </div>
    </aside>
  )
}
