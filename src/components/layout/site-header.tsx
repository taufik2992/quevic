import { useTransition } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Bell, ChevronDown, LogOut, Menu, Search } from 'lucide-react'
import { authClient } from '#/lib/auth-client'
import { useToast } from '#/providers/toast-provider'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
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
import { Input } from '#/components/ui/input'
import { ModeToggle } from '../ThemeToggle'

interface SiteHeaderProps {
  /** Server-rendered fallback while the Better Auth session resolves. */
  userName?: string
  userPlan?: string
  onMenuClick?: () => void
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

export function SiteHeader({
  userName = 'Taufik Hidayat',
  userPlan = 'Professional Plan',
  onMenuClick,
}: SiteHeaderProps) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { data: session } = authClient.useSession()
  const [isSigningOut, startSignOutTransition] = useTransition()

  const displayName = session?.user.name || userName
  const displayEmail = session?.user.email || ''
  const displayImage = session?.user.image || null

  const handleSignOut = () => {
    startSignOutTransition(async () => {
      const { error } = await authClient.signOut()
      if (error) {
        showToast({
          title: 'Sign out failed',
          description: 'Please try again.',
          status: 'error',
        })
        return
      }
      await navigate({ to: '/login' })
      showToast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
        status: 'success',
      })
    })
  }

  return (
    <header className="flex h-15 items-center gap-3 rounded-2xl border-border bg-card px-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] dark:shadow-none">
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 lg:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <Menu data-icon="inline-start" />
      </Button>

      <div className="relative w-full max-w-140 flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search invoices, proposals, clients..."
          className="h-11 rounded-xl border-0 bg-muted pr-4 pl-10 text-[13.5px] text-neutral-900 shadow-none placeholder:text-muted-foreground focus-visible:ring-ring/30"
        />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2.5">
        <ModeToggle />
        <Button
          variant="ghost"
          size="icon"
          className="relative size-10 rounded-full text-neutral-900 hover:bg-muted"
          aria-label="Notifications"
        >
          <Bell data-icon="inline-start" className="size-5" />
          <span className="absolute top-2 right-2.5 size-2 rounded-full bg-destructive ring-2 ring-card" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2.5 rounded-xl py-1 pr-1 pl-1 transition-colors hover:bg-muted"
            >
              <Avatar className="size-8.5">
                {displayImage ? (
                  <AvatarImage src={displayImage} alt={displayName} />
                ) : null}
                <AvatarFallback className="bg-primary text-[13px] font-bold text-primary-foreground">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block text-[13.5px] font-semibold text-neutral-900">
                  {displayName}
                </span>
                <span className="block text-[12px] font-normal text-muted-foreground">
                  {userPlan}
                </span>
              </span>
              <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <span className="block truncate text-sm font-semibold">
                {displayName}
              </span>
              {displayEmail ? (
                <span className="block truncate text-xs text-muted-foreground">
                  {displayEmail}
                </span>
              ) : null}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                variant="destructive"
                disabled={isSigningOut}
                onSelect={handleSignOut}
              >
                <LogOut />
                {isSigningOut ? 'Signing out...' : 'Log out'}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
