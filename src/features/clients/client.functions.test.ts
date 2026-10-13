// Node 24+: node --import tsx --experimental-test-module-mocks --test src/features/clients/client.functions.test.ts
import assert from 'node:assert/strict'
import { after, beforeEach, describe, it, mock } from 'node:test'
import {
  MAX_LOGO_SIZE,
  isAllowedLogoMime,
} from '#/features/clients/client.constants'

interface DatabaseArgs {
  where?: Record<string, unknown>
  data?: Record<string, unknown>
  select?: Record<string, boolean>
  orderBy?: Record<string, string>
  skip?: number
  take?: number
}

const ownerId = 'owner-1'
const clientId = 'client-1'
const fields = {
  companyName: 'Acme',
  email: 'billing@acme.test',
  billingAddress: '123 Main Street',
  contactName: 'Jane Doe',
  clientType: 'Company' as const,
  country: 'Indonesia',
  status: 'Active' as const,
}
const row = {
  ...fields,
  id: clientId,
  logoKey: null as string | null,
  logoMime: null,
  logoSize: null,
  phone: null,
  website: null,
  description: null,
  province: null,
  city: null,
  postalCode: null,
  contactPosition: null,
  contactEmail: null,
  contactPhone: null,
  invoiceCount: 0,
  proposalCount: 0,
  totalSpent: 0,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
}
const client = {
  findMany: mock.fn(async (_args: DatabaseArgs) => [row]),
  count: mock.fn(async (_args: DatabaseArgs) => 1),
  findFirst: mock.fn(
    async (_args: DatabaseArgs): Promise<typeof row | null> => row,
  ),
  create: mock.fn(async (_args: DatabaseArgs) => row),
  update: mock.fn(async (_args: DatabaseArgs) => row),
  delete: mock.fn(async (_args: DatabaseArgs) => row),
}
const headers = new Headers({ 'x-test-request': 'synthetic' })
const getSession = mock.fn(
  async (_args: {
    headers: Headers
  }): Promise<{ user: { id: string } } | null> => ({ user: { id: ownerId } }),
)
const configured = mock.fn(() => true)
const signedUrl = mock.fn(
  async (_key: string) => 'https://storage.test/signed-logo',
)
const upload = mock.fn(
  async (input: {
    ownerId: string
    clientId: string
    bytes: Uint8Array
    mime: string
  }) => ({
    key: `clients/${input.ownerId}/${input.clientId}.png`,
    mime: input.mime,
    size: input.bytes.byteLength,
  }),
)
const cleanup = mock.fn(async (_key: string) => undefined)

// Expose the application handlers without starting TanStack's RPC runtime.
// The adapter still applies each real Zod validator before entering the handler.
function createServerFn() {
  let validate: (data: unknown) => unknown = (data) => data
  const builder = {
    validator: (validator: typeof validate) => {
      validate = validator
      return builder
    },
    handler:
      (handler: (context: { data: unknown }) => Promise<unknown>) =>
      async (input?: { data: unknown }) =>
        handler({ data: validate(input?.data) }),
  }
  return builder
}

const modules = [
  mock.module('@tanstack/react-start', { namedExports: { createServerFn } }),
  mock.module('@tanstack/react-start/server', {
    namedExports: { getRequestHeaders: () => headers },
  }),
  mock.module('@sentry/tanstackstart-react', {
    namedExports: {
      startSpan: (_options: unknown, callback: () => Promise<unknown>) =>
        callback(),
    },
  }),
  mock.module(import.meta.resolve('#/lib/auth'), {
    namedExports: { auth: { api: { getSession } } },
  }),
  mock.module(import.meta.resolve('#/db/prisma'), {
    namedExports: { prisma: { client } },
  }),
  mock.module(import.meta.resolve('#/features/clients/storage'), {
    namedExports: {
      MAX_LOGO_SIZE,
      isAllowedLogoMime,
      isStorageConfigured: configured,
      getClientLogoUrl: signedUrl,
      uploadClientLogo: upload,
      deleteClientLogo: cleanup,
    },
  }),
]
const {
  listClients,
  getClientDetail,
  getClientStats,
  createClient,
  updateClient,
  deleteClient,
} = await import('#/features/clients/client.functions')
after(() => modules.forEach((module) => module.restore()))

beforeEach(() => {
  for (const fn of Object.values(client)) fn.mock.resetCalls()
  client.findMany.mock.mockImplementation(async () => [row])
  client.count.mock.mockImplementation(async () => 1)
  client.findFirst.mock.mockImplementation(async () => row)
  client.create.mock.mockImplementation(async () => row)
  client.update.mock.mockImplementation(async () => row)
  client.delete.mock.mockImplementation(async () => row)
  getSession.mock.resetCalls()
  getSession.mock.mockImplementation(async () => ({ user: { id: ownerId } }))
  configured.mock.resetCalls()
  configured.mock.mockImplementation(() => true)
  signedUrl.mock.resetCalls()
  signedUrl.mock.mockImplementation(
    async () => 'https://storage.test/signed-logo',
  )
  upload.mock.resetCalls()
  upload.mock.mockImplementation(async (input) => ({
    key: `clients/${input.ownerId}/${input.clientId}.png`,
    mime: input.mime,
    size: input.bytes.byteLength,
  }))
  cleanup.mock.resetCalls()
  cleanup.mock.mockImplementation(async () => undefined)
})

describe('authenticated client operations', () => {
  const operations = {
    list: () => listClients({ data: {} }),
    detail: () => getClientDetail({ data: clientId }),
    stats: () => getClientStats(),
    create: () => createClient({ data: fields }),
    update: () => updateClient({ data: { ...fields, id: clientId } }),
    delete: () => deleteClient({ data: clientId }),
  }
  for (const [name, run] of Object.entries(operations)) {
    it(`rejects unauthenticated ${name} before accessing data or storage`, async () => {
      getSession.mock.mockImplementation(async () => null)
      await assert.rejects(run, /Unauthorized/)
      for (const fn of Object.values(client))
        assert.equal(fn.mock.callCount(), 0)
      assert.equal(upload.mock.callCount(), 0)
      assert.equal(cleanup.mock.callCount(), 0)
    })
  }

  it('uses request headers for session lookup and excludes foreign owners from detail lookup', async () => {
    client.findFirst.mock.mockImplementation(async () => null)
    await assert.rejects(
      () => getClientDetail({ data: clientId }),
      /Client not found/,
    )
    assert.deepEqual(getSession.mock.calls[0].arguments[0], { headers })
    assert.deepEqual(client.findFirst.mock.calls[0].arguments[0].where, {
      id: clientId,
      ownerId,
    })
  })
})

describe('listing and logo resolution', () => {
  it('applies case-insensitive search, status and pagination to the owner only', async () => {
    client.count.mock.mockImplementation(async () => 41)
    const result = await listClients({
      data: { search: ' Acme ', status: 'Lead', page: 3, pageSize: 16 },
    })
    const args = client.findMany.mock.calls[0].arguments[0]
    assert.deepEqual(args.where, {
      ownerId,
      status: 'Lead',
      OR: ['companyName', 'email', 'contactName', 'city'].map((field) => ({
        [field]: { contains: 'Acme', mode: 'insensitive' },
      })),
    })
    assert.deepEqual(client.count.mock.calls[0].arguments[0].where, args.where)
    assert.equal(args.skip, 32)
    assert.equal(args.take, 16)
    assert.deepEqual(
      {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        pageCount: result.pageCount,
      },
      { total: 41, page: 3, pageSize: 16, pageCount: 3 },
    )
    assert.equal(result.items[0].logoUrl, null)
    assert.equal(signedUrl.mock.callCount(), 0)
  })

  for (const [sort, orderBy] of [
    ['newest', { createdAt: 'desc' }],
    ['oldest', { createdAt: 'asc' }],
    ['name', { companyName: 'asc' }],
    ['spent', { totalSpent: 'desc' }],
  ] as const) {
    it(`orders ${sort} without adding an empty search filter`, async () => {
      await listClients({ data: { sort, search: '  ' } })
      const args = client.findMany.mock.calls[0].arguments[0]
      assert.deepEqual(args.orderBy, orderBy)
      assert.deepEqual(args.where, { ownerId })
      assert.equal(args.skip, 0)
    })
  }

  for (const [total, pageCount] of [
    [0, 1],
    [16, 1],
    [17, 2],
  ]) {
    it(`reports ${pageCount} page(s) for ${total} clients`, async () => {
      client.findMany.mock.mockImplementation(async () => [])
      client.count.mock.mockImplementation(async () => total)
      const result = await listClients({ data: {} })
      assert.equal(result.pageCount, pageCount)
      assert.deepEqual(result.items, [])
    })
  }

  it('signs each stored logo and isolates a failed signature from other rows', async () => {
    client.findMany.mock.mockImplementation(async () => [
      { ...row, id: 'one', logoKey: 'good.png' },
      { ...row, id: 'two', logoKey: 'bad.png' },
      row,
    ])
    signedUrl.mock.mockImplementation(async (key) => {
      if (key === 'bad.png') throw new Error('Signing failed')
      return 'https://storage.test/signed-logo'
    })
    const result = await listClients({ data: {} })
    assert.deepEqual(
      result.items.map((item) => item.logoUrl),
      ['https://storage.test/signed-logo', null, null],
    )
    assert.equal(signedUrl.mock.callCount(), 2)
    assert.equal(result.items[1].logoKey, 'bad.png')
  })

  it('returns detail with a null URL when storage is unavailable', async () => {
    configured.mock.mockImplementation(() => false)
    client.findFirst.mock.mockImplementation(async () => ({
      ...row,
      logoKey: 'logo.png',
    }))
    const result = await getClientDetail({ data: clientId })
    assert.equal(result.logoKey, 'logo.png')
    assert.equal(result.logoUrl, null)
    assert.equal(signedUrl.mock.callCount(), 0)
  })
})

describe('monthly client statistics', () => {
  it('uses calendar month boundaries across the year and rounds percentage changes', async (t) => {
    t.mock.timers.enable({
      apis: ['Date'],
      now: new Date(2026, 0, 15).getTime(),
    })
    const counts = [10, 7, 1, 4, 6, 3, 4, 2]
    client.count.mock.mockImplementation(async () => counts.shift()!)
    assert.deepEqual(await getClientStats(), {
      total: 10,
      totalNewThisMonth: 4,
      active: 7,
      activeDeltaPct: 133,
      newClients: 4,
      newDeltaPct: 0,
      inactive: 1,
      inactiveDeltaPct: -50,
      lastMonthTotal: 6,
    })
    assert.deepEqual(
      client.count.mock.calls.map((call) => call.arguments[0].where),
      [
        { ownerId },
        { ownerId, status: 'Active' },
        { ownerId, status: 'Inactive' },
        { ownerId, createdAt: { gte: new Date(2026, 0, 1) } },
        { ownerId, createdAt: { lt: new Date(2026, 0, 1) } },
        { ownerId, status: 'Active', createdAt: { lt: new Date(2026, 0, 1) } },
        {
          ownerId,
          createdAt: { gte: new Date(2025, 11, 1), lt: new Date(2026, 0, 1) },
        },
        {
          ownerId,
          status: 'Inactive',
          createdAt: { lt: new Date(2026, 0, 1) },
        },
      ],
    )
  })

  it('returns null deltas when previous counts are zero', async () => {
    client.count.mock.mockImplementation(async () => 0)
    const stats = await getClientStats()
    assert.equal(stats.activeDeltaPct, null)
    assert.equal(stats.newDeltaPct, null)
    assert.equal(stats.inactiveDeltaPct, null)
    assert.equal(stats.total, 0)
  })
})

describe('creating clients', () => {
  it('normalizes input, generates an id and assigns the authenticated owner', async () => {
    const result = await createClient({
      data: {
        ...fields,
        email: ' BILLING@ACME.TEST ',
        ownerId: 'foreign-owner',
      },
    })
    const data = client.create.mock.calls[0].arguments[0].data!
    assert.equal(data.ownerId, ownerId)
    assert.equal(data.email, fields.email)
    assert.match(
      String(data.id),
      /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/,
    )
    assert.equal('logoKey' in data, false)
    assert.equal(upload.mock.callCount(), 0)
    assert.equal(result.id, clientId)
  })

  it('decodes a logo and stores its byte size and metadata', async () => {
    const bytes = Buffer.from([0, 1, 255])
    await createClient({
      data: {
        ...fields,
        logo: { data: bytes.toString('base64'), mime: 'image/png' },
      },
    })
    const data = client.create.mock.calls[0].arguments[0].data!
    const input = upload.mock.calls[0].arguments[0]
    assert.equal(input.ownerId, ownerId)
    assert.equal(input.clientId, data.id)
    assert.deepEqual(input.bytes, bytes)
    assert.equal(data.logoKey, `clients/${ownerId}/${data.id}.png`)
    assert.equal(data.logoMime, 'image/png')
    assert.equal(data.logoSize, 3)
    assert.equal('logo' in data, false)
  })

  for (const [name, data, message] of [
    ['empty decoded data', '!!!', /Logo file is empty/],
    [
      'oversized decoded data',
      Buffer.alloc(MAX_LOGO_SIZE + 1).toString('base64'),
      /at most 2 MB/,
    ],
  ] as const) {
    it(`rejects ${name} before upload or database creation`, async () => {
      await assert.rejects(
        () =>
          createClient({
            data: { ...fields, logo: { data, mime: 'image/png' } },
          }),
        message,
      )
      assert.equal(upload.mock.callCount(), 0)
      assert.equal(client.create.mock.callCount(), 0)
    })
  }

  it('does not create a row when upload fails', async () => {
    const error = new Error('Storage unavailable')
    upload.mock.mockImplementation(async () => {
      throw error
    })
    await assert.rejects(
      () =>
        createClient({
          data: { ...fields, logo: { data: 'AA==', mime: 'image/png' } },
        }),
      (actual) => actual === error,
    )
    assert.equal(client.create.mock.callCount(), 0)
    assert.equal(cleanup.mock.callCount(), 0)
  })

  it('cleans up uploaded data after a duplicate email, preserving the friendly error if cleanup fails', async () => {
    client.create.mock.mockImplementation(async () => {
      throw { code: 'P2002' }
    })
    cleanup.mock.mockImplementation(async () => {
      throw new Error('Cleanup failed')
    })
    await assert.rejects(
      () =>
        createClient({
          data: { ...fields, logo: { data: 'AA==', mime: 'image/png' } },
        }),
      /A client with this email already exists/,
    )
    const id = client.create.mock.calls[0].arguments[0].data!.id
    assert.deepEqual(cleanup.mock.calls[0].arguments, [
      `clients/${ownerId}/${id}.png`,
    ])
  })

  for (const error of [
    new Error('Database unavailable'),
    null,
    { code: 'P9999' },
  ]) {
    it(`handles database failure ${String(error)} without deleting a nonexistent upload`, async () => {
      client.create.mock.mockImplementation(async () => {
        throw error
      })
      await assert.rejects(
        () => createClient({ data: fields }),
        (actual) =>
          error instanceof Error
            ? actual === error
            : actual instanceof Error &&
              actual.message === 'Something went wrong',
      )
      assert.equal(cleanup.mock.callCount(), 0)
    })
  }
})

describe('updating and deleting clients', () => {
  for (const name of ['update', 'delete'] as const) {
    it(`rejects ${name} of a missing or foreign client before writes`, async () => {
      client.findFirst.mock.mockImplementation(async () => null)
      await assert.rejects(
        () =>
          name === 'update'
            ? updateClient({ data: { ...fields, id: clientId } })
            : deleteClient({ data: clientId }),
        /Client not found/,
      )
      assert.deepEqual(client.findFirst.mock.calls[0].arguments[0].where, {
        id: clientId,
        ownerId,
      })
      assert.equal(client.update.mock.callCount(), 0)
      assert.equal(client.delete.mock.callCount(), 0)
      assert.equal(upload.mock.callCount(), 0)
      assert.equal(cleanup.mock.callCount(), 0)
    })
  }

  it('updates fields while preserving an unchanged email and existing logo', async () => {
    await updateClient({
      data: { ...fields, id: clientId, companyName: 'Renamed' },
    })
    assert.equal(client.findFirst.mock.callCount(), 1)
    const args = client.update.mock.calls[0].arguments[0]
    assert.deepEqual(args.where, { id: clientId })
    assert.equal(args.data!.companyName, 'Renamed')
    for (const field of ['id', 'logo', 'removeLogo', 'logoKey'])
      assert.equal(field in args.data!, false)
    assert.equal(upload.mock.callCount(), 0)
    assert.equal(cleanup.mock.callCount(), 0)
  })

  it('checks a changed email against other clients belonging to the owner', async () => {
    await assert.rejects(
      () =>
        updateClient({
          data: { ...fields, id: clientId, email: 'other@acme.test' },
        }),
      /already exists/,
    )
    assert.deepEqual(client.findFirst.mock.calls[1].arguments[0].where, {
      ownerId,
      email: 'other@acme.test',
      NOT: { id: clientId },
    })
    assert.equal(client.update.mock.callCount(), 0)
    assert.equal(upload.mock.callCount(), 0)
  })

  it('allows a changed email when the owner has no conflicting client', async () => {
    client.findFirst.mock.mockImplementation(async () =>
      client.findFirst.mock.callCount() === 1 ? row : null,
    )
    await updateClient({
      data: { ...fields, id: clientId, email: 'new@acme.test' },
    })
    assert.equal(
      client.update.mock.calls[0].arguments[0].data!.email,
      'new@acme.test',
    )
  })

  it('removes logo metadata even if cleanup fails, giving removal precedence over replacement', async () => {
    client.findFirst.mock.mockImplementation(async () => ({
      ...row,
      logoKey: 'old.png',
    }))
    cleanup.mock.mockImplementation(async () => {
      throw new Error('Storage unavailable')
    })
    await updateClient({
      data: {
        ...fields,
        id: clientId,
        removeLogo: true,
        logo: { data: 'AA==', mime: 'image/png' },
      },
    })
    assert.deepEqual(cleanup.mock.calls[0].arguments, ['old.png'])
    const data = client.update.mock.calls[0].arguments[0].data!
    assert.equal(data.logoKey, null)
    assert.equal(data.logoMime, null)
    assert.equal(data.logoSize, null)
    assert.equal(upload.mock.callCount(), 0)
  })

  it('uploads replacement metadata using the existing client id', async () => {
    await updateClient({
      data: {
        ...fields,
        id: clientId,
        logo: { data: 'AQI=', mime: 'image/webp' },
      },
    })
    assert.equal(upload.mock.calls[0].arguments[0].clientId, clientId)
    const data = client.update.mock.calls[0].arguments[0].data!
    assert.equal(data.logoMime, 'image/webp')
    assert.equal(data.logoSize, 2)
  })

  it('translates a duplicate-email race reported by the database', async () => {
    client.update.mock.mockImplementation(async () => {
      throw { code: 'P2002' }
    })
    await assert.rejects(
      () => updateClient({ data: { ...fields, id: clientId } }),
      /already exists/,
    )
  })

  it('deletes the database row before removing its logo', async () => {
    client.findFirst.mock.mockImplementation(async () => ({
      ...row,
      logoKey: 'old.png',
    }))
    cleanup.mock.mockImplementation(async () => {
      assert.equal(client.delete.mock.callCount(), 1)
      return undefined
    })
    assert.deepEqual(await deleteClient({ data: clientId }), { id: clientId })
    assert.deepEqual(client.delete.mock.calls[0].arguments[0].where, {
      id: clientId,
    })
    assert.deepEqual(cleanup.mock.calls[0].arguments, ['old.png'])
  })

  it('returns successful deletion if logo cleanup fails and logs the failure', async (t) => {
    const error = new Error('Cleanup unavailable')
    const log = t.mock.method(console, 'error', () => undefined)
    client.findFirst.mock.mockImplementation(async () => ({
      ...row,
      logoKey: 'old.png',
    }))
    cleanup.mock.mockImplementation(async () => {
      throw error
    })
    assert.deepEqual(await deleteClient({ data: clientId }), { id: clientId })
    assert.deepEqual(log.mock.calls[0].arguments, [
      '[clients] logo cleanup failed for old.png:',
      error,
    ])
  })

  it('skips cleanup for a client with no logo', async () => {
    await deleteClient({ data: clientId })
    assert.equal(cleanup.mock.callCount(), 0)
  })

  it('preserves the logo when database deletion fails', async () => {
    client.findFirst.mock.mockImplementation(async () => ({
      ...row,
      logoKey: 'old.png',
    }))
    client.delete.mock.mockImplementation(async () => {
      throw new Error('Delete failed')
    })
    await assert.rejects(
      () => deleteClient({ data: clientId }),
      /Delete failed/,
    )
    assert.equal(cleanup.mock.callCount(), 0)
  })
})
