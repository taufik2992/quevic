import { useForm } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useCallback, useState, useTransition } from 'react'
import { Input } from '#/components/motion/input'
import { authClient } from '#/lib/auth-client'
import { cn } from '#/lib/utils'
import { useToast } from '#/providers/toast-provider'
import { loginDefaultValues, loginFieldSchemas, loginSchema } from '../schemas'

function fieldError(errors: unknown): string | undefined {
  if (!Array.isArray(errors) || errors.length === 0) return undefined
  const first: unknown = errors[0]
  if (typeof first === 'string') return first
  if (typeof first === 'object' && first !== null && 'message' in first) {
    const message = (first as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return 'Invalid value'
}

function getAbsoluteCallback(path: string): string {
  if (typeof window === 'undefined') return path
  return new URL(path, window.location.origin).toString()
}

/** Avoid account-enumeration: never surface raw auth errors for email sign-in. */
function toGenericSignInError(error: unknown): string {
  console.error('[auth] email sign-in failed', error)
  return 'Invalid email or password. Please try again.'
}

export function LoginForm() {
  const navigate = useNavigate()
  const { showToast, updateToast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isGooglePending, startGoogleTransition] = useTransition()

  const form = useForm({
    defaultValues: loginDefaultValues,
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)
      const toastId = showToast({
        title: 'Signing you in...',
        description: 'Verifying your credentials.',
        status: 'loading',
        duration: 0,
      })
      const { error } = await authClient.signIn.email({
        email: value.email,
        password: value.password,
        rememberMe: value.rememberMe,
        callbackURL: getAbsoluteCallback('/dashboard'),
      })
      if (error) {
        const message = toGenericSignInError(error)
        setFormError(message)
        updateToast(toastId, {
          title: 'Sign in failed',
          description: message,
          status: 'error',
          duration: 4200,
        })
        return
      }
      updateToast(toastId, {
        title: 'Welcome back',
        description: 'Signed in successfully. Redirecting...',
        status: 'success',
        duration: 3000,
      })
      await navigate({ to: '/dashboard' })
    },
  })

  const handleGoogleSignIn = useCallback(() => {
    setFormError(null)
    const toastId = showToast({
      title: 'Redirecting to Google...',
      description: 'Please complete sign in with Google.',
      status: 'loading',
      duration: 0,
    })
    startGoogleTransition(async () => {
      try {
        const { error } = await authClient.signIn.social({
          provider: 'google',
          callbackURL: getAbsoluteCallback('/dashboard'),
        })
        if (error) {
          const message =
            error.message ?? 'Google sign-in failed. Please try again.'
          setFormError(message)
          updateToast(toastId, {
            title: 'Google sign-in failed',
            description: message,
            status: 'error',
            duration: 4200,
          })
        }
        // On success better-auth redirects to Google, toast stays until redirect.
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Google sign-in failed.'
        setFormError(message)
        updateToast(toastId, {
          title: 'Google sign-in failed',
          description: message,
          status: 'error',
          duration: 4200,
        })
      }
    })
  }, [showToast, updateToast])

  const handleForgotPassword = useCallback(() => {
    showToast({
      title: 'Password reset unavailable',
      description:
        'Self-service reset is not enabled yet. Please contact your administrator.',
      status: 'info',
    })
  }, [showToast])

  return (
    <div className="flex h-full flex-col justify-center rounded-3xl bg-card p-8 shadow-sm lg:rounded-none lg:shadow-none lg:p-8">
      <div className="flex items-center justify-center mb-14 lg:hidden">
        <img
          src="/quevic-logo.png"
          alt="Quevic logo"
          className="size-14 object-contain"
        />
      </div>
      <div className="mx-auto flex w-full max-w-md flex-col justify-center">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900">
            Welcome back
          </h2>
          <p className="text-sm leading-6 text-neutral-600">
            Log in to your Quevic account to continue managing your invoices and
            proposals.
          </p>
        </div>

        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <form.Field
            name="email"
            validators={{ onBlur: loginFieldSchemas.email }}
            children={(field) => (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="login-email"
                  className="px-1 text-sm font-medium text-neutral-900"
                >
                  Email address
                </label>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value)}
                  onBlur={field.handleBlur}
                  leftIcon={<Mail />}
                  error={fieldError(field.state.meta.errors)}
                  classNames={{ field: 'rounded-xl' }}
                />
              </div>
            )}
          />

          <form.Field
            name="password"
            validators={{ onBlur: loginFieldSchemas.password }}
            children={(field) => (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="login-password"
                  className="px-1 text-sm font-medium text-neutral-900"
                >
                  Password
                </label>
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value)}
                  onBlur={field.handleBlur}
                  leftIcon={<Lock />}
                  rightIcon={
                    <button
                      type="button"
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-neutral-500 transition-colors hover:text-neutral-900"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  }
                  error={fieldError(field.state.meta.errors)}
                  classNames={{ field: 'rounded-xl' }}
                />
              </div>
            )}
          />

          <div className="flex items-center justify-between">
            <form.Field
              name="rememberMe"
              children={(field) => (
                <label
                  htmlFor="login-remember"
                  className="flex cursor-pointer items-center gap-2 text-sm text-neutral-900"
                >
                  <input
                    id="login-remember"
                    type="checkbox"
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    onBlur={field.handleBlur}
                    className="size-4 cursor-pointer rounded border-border accent-primary"
                  />
                  Remember me
                </label>
              )}
            />
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          {formError ? (
            <p
              role="alert"
              className="rounded-xl bg-error/10 px-3 py-2 text-xs font-medium text-error"
            >
              {formError}
            </p>
          ) : null}

          <form.Subscribe selector={(state) => state.canSubmit}>
            {(canSubmit) => (
              <form.Subscribe selector={(state) => state.isSubmitting}>
                {(isSubmitting) => (
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className={cn(
                      'mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-all',
                      'bg-linear-to-r from-primary-400 via-primary-500 to-primary-600 shadow-sm hover:brightness-105',
                      'disabled:pointer-events-none disabled:opacity-60',
                    )}
                  >
                    {isSubmitting ? (
                      'Signing in...'
                    ) : (
                      <>
                        <ArrowRight className="size-4" />
                        Sign in
                      </>
                    )}
                  </button>
                )}
              </form.Subscribe>
            )}
          </form.Subscribe>

          <div className="flex items-center gap-3 py-1">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-neutral-600">Or continue with</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              disabled={isGooglePending}
              onClick={handleGoogleSignIn}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-60"
            >
              <img
                src="/icons/google.png"
                alt=""
                className="size-5 object-contain"
              />
              {isGooglePending ? 'Connecting to Google...' : 'Continue with Google'}
            </button>
            <button
              type="button"
              onClick={() =>
                showToast({
                  title: 'Apple sign-in unavailable',
                  description: 'Apple sign-in is not configured yet.',
                  status: 'info',
                })
              }
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50"
            >
              <img
                src="/icons/apple-light.png"
                alt="Apple Logo"
                className="size-5 object-contain dark:hidden"
              />
              <img
                src="/icons/apple-dark.png"
                alt="Apple Logo"
                className="hidden size-5 object-contain dark:block"
              />
              Continue with Apple
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-neutral-600">
          Don&apos;t have an account?{' '}
          <span className="font-medium text-primary-600">
            Contact your administrator.
          </span>
        </p>
      </div>
    </div>
  )
}
