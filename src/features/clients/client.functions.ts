import * as Sentry from '@sentry/tanstackstart-react'
import { createServerFn } from '@tanstack/react-start'
import type { Prisma } from '#/db/generated/prisma/client.js'
import {
  clientIdSchema,
  createClientSchema,
  listClientsQuerySchema,
  updateClientSchema,
} from '#/features/clients/client.schema'
import type { ClientSort } from '#/features/clients/client.schema'

// NOTE: server-only modules (`#/db/prisma`, `#/lib/auth`, `./storage`,
// `@tanstack/react-start/server`) are loaded via dynamic `import()` inside
// handlers. Static imports would leak Prisma/AWS SDK into the browser
// bundle in dev (Vite serves modules unbundled) and crash the page, because
// the start-compiler only replaces handler bodies with RPC stubs while
// leaving top-level imports intact.

const clientSelect = {
  id: true,
  companyName: true,
  clientType: true,
  email: true,
  phone: true,
  website: true,
  description: true,
  logoKey: true,
  logoMime: true,
  logoSize: true,
  billingAddress: true,
  country: true,
  province: true,
  city: true,
  postalCode: true,
  contactName: true,
  contactPosition: true,
  contactEmail: true,
  contactPhone: true,
  status: true,
  invoiceCount: true,
  proposalCount: true,
  totalSpent: true,
  createdAt: true,
  updatedAt: true,
} as const

async function requireOwnerId(): Promise<string> {
  const [{ auth }, { getRequestHeaders }] = await Promise.all([
    import('#/lib/auth'),
    import('@tanstack/react-start/server'),
  ])
  const session = await auth.api.getSession({ headers: getRequestHeaders() })
  if (!session) throw new Error('Unauthorized')
  return session.user.id
}

async function getPrisma() {
  const { prisma } = await import('#/db/prisma')
  return prisma
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'P2002'
  )
}

function toFriendlyError(error: unknown): Error {
  if (isUniqueViolation(error)) {
    return new Error('A client with this email already exists')
  }
  return error instanceof Error ? error : new Error('Something went wrong')
}

async function decodeLogo(data: string, mime: string) {
  const { MAX_LOGO_SIZE, isAllowedLogoMime } = await import('./storage')
  if (!isAllowedLogoMime(mime)) {
    throw new Error('Logo must be PNG, JPG or WebP')
  }
  const bytes = Buffer.from(data, 'base64')
  if (bytes.byteLength === 0) throw new Error('Logo file is empty')
  if (bytes.byteLength > MAX_LOGO_SIZE) {
    throw new Error('Logo file must be at most 2 MB')
  }
  return { bytes, mime }
}

function orderByForSort(sort: ClientSort) {
  switch (sort) {
    case 'oldest':
      return { createdAt: 'asc' } as const
    case 'name':
      return { companyName: 'asc' } as const
    case 'spent':
      return { totalSpent: 'desc' } as const
    case 'newest':
    default:
      return { createdAt: 'desc' } as const
  }
}

async function resolveLogoUrls<T extends { logoKey: string | null }>(
  rows: T[],
) {
  const storage = await import('./storage')
  if (!storage.isStorageConfigured()) {
    return rows.map((row) => ({ ...row, logoUrl: null as string | null }))
  }
  return Promise.all(
    rows.map(async (row) => {
      if (!row.logoKey) return { ...row, logoUrl: null as string | null }
      try {
        const logoUrl = await storage.getClientLogoUrl(row.logoKey)
        return { ...row, logoUrl }
      } catch {
        return { ...row, logoUrl: null as string | null }
      }
    }),
  )
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return null
  return Math.round(((current - previous) / previous) * 100)
}

export const listClients = createServerFn({ method: 'GET' })
  .validator((data: unknown) => listClientsQuerySchema.parse(data))
  .handler(async ({ data }) => {
    return Sentry.startSpan({ name: 'clients.list' }, async () => {
      const ownerId = await requireOwnerId()
      const prisma = await getPrisma()
      const search = data.search?.trim() || undefined

      const where: Prisma.ClientWhereInput = {
        ownerId,
        ...(data.status ? { status: data.status } : {}),
        ...(search
          ? {
              OR: [
                { companyName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { contactName: { contains: search, mode: 'insensitive' } },
                { city: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      }

      const [rows, total] = await Promise.all([
        prisma.client.findMany({
          where,
          select: clientSelect,
          orderBy: orderByForSort(data.sort),
          skip: (data.page - 1) * data.pageSize,
          take: data.pageSize,
        }),
        prisma.client.count({ where }),
      ])

      const items = await resolveLogoUrls(rows)
      return {
        items,
        total,
        page: data.page,
        pageSize: data.pageSize,
        pageCount: Math.max(1, Math.ceil(total / data.pageSize)),
      }
    })
  })

export const getClientStats = createServerFn({ method: 'GET' }).handler(
  async () => {
    return Sentry.startSpan({ name: 'clients.stats' }, async () => {
      const ownerId = await requireOwnerId()
      const prisma = await getPrisma()
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
      )

      const [
        total,
        active,
        inactive,
        newThisMonth,
        lastMonthTotal,
        lastMonthActive,
        lastMonthNew,
        lastMonthInactive,
      ] = await Promise.all([
        prisma.client.count({ where: { ownerId } }),
        prisma.client.count({ where: { ownerId, status: 'Active' } }),
        prisma.client.count({ where: { ownerId, status: 'Inactive' } }),
        prisma.client.count({
          where: { ownerId, createdAt: { gte: startOfMonth } },
        }),
        prisma.client.count({
          where: { ownerId, createdAt: { lt: startOfMonth } },
        }),
        prisma.client.count({
          where: {
            ownerId,
            status: 'Active',
            createdAt: { lt: startOfMonth },
          },
        }),
        prisma.client.count({
          where: {
            ownerId,
            createdAt: { gte: startOfLastMonth, lt: startOfMonth },
          },
        }),
        prisma.client.count({
          where: {
            ownerId,
            status: 'Inactive',
            createdAt: { lt: startOfMonth },
          },
        }),
      ])

      return {
        total,
        totalNewThisMonth: newThisMonth,
        active,
        activeDeltaPct: pctChange(active, lastMonthActive),
        newClients: newThisMonth,
        newDeltaPct: pctChange(newThisMonth, lastMonthNew),
        inactive,
        inactiveDeltaPct: pctChange(inactive, lastMonthInactive),
        lastMonthTotal,
      }
    })
  },
)

export const getClientDetail = createServerFn({ method: 'GET' })
  .validator((data: unknown) => clientIdSchema.parse(data))
  .handler(async ({ data: id }) => {
    return Sentry.startSpan({ name: 'clients.detail' }, async () => {
      const ownerId = await requireOwnerId()
      const prisma = await getPrisma()
      const row = await prisma.client.findFirst({
        where: { id, ownerId },
        select: clientSelect,
      })
      if (!row) throw new Error('Client not found')
      const [detail] = await resolveLogoUrls([row])
      return detail
    })
  })

export const createClient = createServerFn({ method: 'POST' })
  .validator((data: unknown) => createClientSchema.parse(data))
  .handler(async ({ data }) => {
    return Sentry.startSpan({ name: 'clients.create' }, async () => {
      const ownerId = await requireOwnerId()
      const prisma = await getPrisma()
      const id = crypto.randomUUID()
      const { logo, ...fields } = data

      let logoKey: string | undefined
      if (logo) {
        const { uploadClientLogo } = await import('./storage')
        const { bytes, mime } = await decodeLogo(logo.data, logo.mime)
        const uploaded = await uploadClientLogo({
          ownerId,
          clientId: id,
          bytes,
          mime,
        })
        logoKey = uploaded.key
      }

      try {
        const row = await prisma.client.create({
          data: {
            ...fields,
            id,
            ownerId,
            ...(logoKey && logo
              ? {
                  logoKey,
                  logoMime: logo.mime,
                  logoSize: Buffer.from(logo.data, 'base64').byteLength,
                }
              : {}),
          },
          select: clientSelect,
        })
        const [created] = await resolveLogoUrls([row])
        return created
      } catch (error) {
        if (logoKey) {
          const { deleteClientLogo } = await import('./storage')
          await deleteClientLogo(logoKey).catch(() => undefined)
        }
        throw toFriendlyError(error)
      }
    })
  })

export const updateClient = createServerFn({ method: 'POST' })
  .validator((data: unknown) => updateClientSchema.parse(data))
  .handler(async ({ data }) => {
    return Sentry.startSpan({ name: 'clients.update' }, async () => {
      const ownerId = await requireOwnerId()
      const prisma = await getPrisma()
      const { id, logo, removeLogo, ...fields } = data

      const existing = await prisma.client.findFirst({
        where: { id, ownerId },
        select: { logoKey: true, email: true },
      })
      if (!existing) throw new Error('Client not found')

      if (fields.email !== existing.email) {
        const clash = await prisma.client.findFirst({
          where: { ownerId, email: fields.email, NOT: { id } },
          select: { id: true },
        })
        if (clash) throw new Error('A client with this email already exists')
      }

      const storage = await import('./storage')
      let logoUpdate = {}
      if (removeLogo) {
        if (existing.logoKey) {
          await storage
            .deleteClientLogo(existing.logoKey)
            .catch(() => undefined)
        }
        logoUpdate = {
          logoKey: null,
          logoMime: null,
          logoSize: null,
        }
      } else if (logo) {
        const { bytes, mime } = await decodeLogo(logo.data, logo.mime)
        const uploaded = await storage.uploadClientLogo({
          ownerId,
          clientId: id,
          bytes,
          mime,
        })
        logoUpdate = {
          logoKey: uploaded.key,
          logoMime: uploaded.mime,
          logoSize: uploaded.size,
        }
      }

      try {
        const row = await prisma.client.update({
          where: { id },
          data: { ...fields, ...logoUpdate },
          select: clientSelect,
        })
        const [updated] = await resolveLogoUrls([row])
        return updated
      } catch (error) {
        throw toFriendlyError(error)
      }
    })
  })

export const deleteClient = createServerFn({ method: 'POST' })
  .validator((data: unknown) => clientIdSchema.parse(data))
  .handler(async ({ data: id }) => {
    return Sentry.startSpan({ name: 'clients.delete' }, async () => {
      const ownerId = await requireOwnerId()
      const prisma = await getPrisma()
      const existing = await prisma.client.findFirst({
        where: { id, ownerId },
        select: { logoKey: true },
      })
      if (!existing) throw new Error('Client not found')

      await prisma.client.delete({ where: { id } })

      if (existing.logoKey) {
        const { deleteClientLogo } = await import('./storage')
        await deleteClientLogo(existing.logoKey).catch((error) => {
          console.error(
            `[clients] logo cleanup failed for ${existing.logoKey}:`,
            error,
          )
        })
      }
      return { id }
    })
  })
