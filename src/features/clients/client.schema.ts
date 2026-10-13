import { z } from 'zod'
import {
  ALLOWED_LOGO_MIME,
  MAX_LOGO_BASE64_LENGTH,
} from '#/features/clients/client.constants'

// Required-marked fields mirror the create-client design:
// Company Name*, Email*, Billing Address*, Contact Name*.
// Client Type is fixed to Company / Individual per scope.

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === '' ? undefined : value))
    .optional()

export const clientTypeSchema = z.enum(['Company', 'Individual'])

export const clientStatusSchema = z.enum(['Active', 'Lead', 'Inactive'])

export const clientSortSchema = z.enum(['newest', 'oldest', 'name', 'spent'])

export const logoInputSchema = z.object({
  data: z
    .string()
    .min(1, 'Logo file is required')
    .max(MAX_LOGO_BASE64_LENGTH, 'Logo file must be at most 2 MB'),
  mime: z.enum(ALLOWED_LOGO_MIME, 'Logo must be PNG, JPG or WebP'),
})

const clientBaseSchema = z.object({
  companyName: z.string().trim().min(1, 'Company name is required').max(120),
  clientType: clientTypeSchema.default('Company'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .max(254)
    .email('Enter a valid email address')
    .toLowerCase(),
  phone: optionalText(32),
  website: z
    .string()
    .trim()
    .max(253)
    .refine(
      (value) =>
        value === '' ||
        /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(value),
      'Enter a valid website address',
    )
    .transform((value) => (value === '' ? undefined : value))
    .optional(),
  description: optionalText(2000),
  billingAddress: z
    .string()
    .trim()
    .min(1, 'Billing address is required')
    .max(1000),
  country: z.string().trim().min(1).max(100).default('Indonesia'),
  province: optionalText(100),
  city: optionalText(100),
  postalCode: optionalText(20),
  contactName: z.string().trim().min(1, 'Contact name is required').max(120),
  contactPosition: optionalText(120),
  contactEmail: z
    .string()
    .trim()
    .max(254)
    .refine(
      (value) => value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      'Enter a valid email address',
    )
    .transform((value) => (value === '' ? undefined : value))
    .optional(),
  contactPhone: optionalText(32),
  status: clientStatusSchema.default('Active'),
})

export const createClientSchema = clientBaseSchema.extend({
  logo: logoInputSchema.optional(),
})

export const updateClientSchema = clientBaseSchema.extend({
  id: z.string().min(1, 'Client id is required'),
  logo: logoInputSchema.optional(),
  removeLogo: z.boolean().default(false),
})

export const clientIdSchema = z.string().min(1, 'Client id is required')

export const listClientsQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  status: clientStatusSchema.optional(),
  sort: clientSortSchema.default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(16),
})

export type ClientType = z.infer<typeof clientTypeSchema>
export type ClientStatus = z.infer<typeof clientStatusSchema>
export type ClientSort = z.infer<typeof clientSortSchema>
export type LogoInput = z.infer<typeof logoInputSchema>
export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
export type ListClientsQuery = z.infer<typeof listClientsQuerySchema>

export const defaultClientsSearch: ListClientsQuery = {
  sort: 'newest',
  page: 1,
  pageSize: 16,
}

export const createClientDefaultValues: CreateClientInput = {
  companyName: '',
  clientType: 'Company',
  email: '',
  phone: undefined,
  website: undefined,
  description: undefined,
  billingAddress: '',
  country: 'Indonesia',
  province: undefined,
  city: undefined,
  postalCode: undefined,
  contactName: '',
  contactPosition: undefined,
  contactEmail: undefined,
  contactPhone: undefined,
  status: 'Active',
  logo: undefined,
}
