import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { getSessionUser } from '#/features/auth/auth.functions'
import { AuthenticatedLayout } from '#/components/layout/authenticated-layout'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const session = await getSessionUser()
    if (!session) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
    return { user: session.user }
  },
  component: AuthenticatedLayoutRoute,
})

function AuthenticatedLayoutRoute() {
  const { user } = Route.useRouteContext()
  return (
    <AuthenticatedLayout userName={user.name}>
      <Outlet />
    </AuthenticatedLayout>
  )
}
