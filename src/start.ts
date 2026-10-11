import {
  sentryGlobalFunctionMiddleware,
  sentryGlobalRequestMiddleware,
} from '@sentry/tanstackstart-react'
import { createStart } from '@tanstack/react-start'

export const startInstance = createStart(() => {
  return {
    // Sentry middleware should be the first middleware in the arrays
    // to ensure all errors are captured.
    requestMiddleware: [sentryGlobalRequestMiddleware],
    functionMiddleware: [sentryGlobalFunctionMiddleware],
  }
})
