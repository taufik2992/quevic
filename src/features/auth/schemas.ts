import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean(),
})

export const loginFieldSchemas = {
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
} as const

export type LoginValues = z.infer<typeof loginSchema>

export const loginDefaultValues: LoginValues = {
  email: '',
  password: '',
  rememberMe: true,
}
