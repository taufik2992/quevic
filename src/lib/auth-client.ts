import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient()

export type AuthSession = typeof authClient.$Infer.Session
export type AuthUser = typeof authClient.$Infer.Session.user
