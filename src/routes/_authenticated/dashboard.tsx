import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import { useCallback, useTransition } from 'react'
import { authClient } from '#/lib/auth-client'
import { useToast } from '#/providers/toast-provider'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { user } = Route.useRouteContext()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [isSigningOut, startSignOutTransition] = useTransition()

  const handleLogout = useCallback(() => {
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
    })
  }, [navigate, showToast])

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <section className="flex w-full max-w-md flex-col items-center gap-4 rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Signed in as {user.name} ({user.email})
        </p>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isSigningOut}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-60"
        >
          <LogOut className="size-4" />
          {isSigningOut ? 'Signing out...' : 'Logout'}
        </button>
      </section>
    </main>
  )
}
