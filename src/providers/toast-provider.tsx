import { createContext, useContext, useMemo } from 'react'
import {
  AnimatedToastStack,
  useAnimatedToastStack,
} from '#/components/motion/animated-toast-stack'
import type { ToastInput } from '#/components/motion/animated-toast-stack'

type ToastContextValue = {
  showToast: (input: ToastInput) => string
  updateToast: (id: string, patch: Partial<ToastInput>) => void
  dismissToast: (id: string) => void
  clearToasts: () => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts, showToast, updateToast, dismissToast, clearToasts } =
    useAnimatedToastStack({ defaultDuration: 4200, limit: 5 })

  const value = useMemo<ToastContextValue>(
    () => ({ showToast, updateToast, dismissToast, clearToasts }),
    [showToast, updateToast, dismissToast, clearToasts],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <AnimatedToastStack
        toasts={toasts}
        onDismiss={dismissToast}
        fixed
        position="top-center"
        maxVisible={4}
      />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
