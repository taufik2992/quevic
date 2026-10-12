import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { LoginForm } from '#/features/auth/components/LoginForm'
import { LoginHero } from '#/features/auth/components/LoginHero'
import { getSessionUser } from '#/features/auth/auth.functions'

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/login')({
  validateSearch: loginSearchSchema,
  beforeLoad: async ({ search }) => {
    const session = await getSessionUser()
    if (session) {
      throw redirect({ to: search.redirect ?? '/dashboard' })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  return (
    <main className="min-h-screen">
      <div className="grid w-full min-h-screen lg:grid-cols-[1.2fr_0.5fr]">
        <div className="hidden lg:block">
          <LoginHero />
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
