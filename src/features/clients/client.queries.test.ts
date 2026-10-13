// Node 24+: node --import tsx --experimental-test-module-mocks --test src/features/clients/client.queries.test.ts
import assert from 'node:assert/strict'
import { after, afterEach, beforeEach, describe, it, mock } from 'node:test'
import * as ReactQuery from '@tanstack/react-query'
import { defaultClientsSearch } from '#/features/clients/client.schema'

interface CachedList {
  items: { id: string; companyName: string }[]
  total: number
  page: number
  pageSize: number
  pageCount: number
}
interface MutationContext {
  snapshots: [readonly unknown[], CachedList | undefined][]
}
interface MutationOptions {
  mutationFn: (input: unknown) => Promise<unknown>
  onSuccess?: (client: { id: string; companyName: string }) => void
  onMutate?: (id: string) => Promise<MutationContext>
  onError?: (error: Error, id: string, context?: MutationContext) => void
  onSettled?: (result: unknown, error: Error | null, id: string) => void
}

let queryClient: ReactQuery.QueryClient
const useMutation = mock.fn((options: MutationOptions) => options)
const listClients = mock.fn(async (_input: unknown) => ({
  items: [],
  total: 0,
}))
const getClientStats = mock.fn(async () => ({ total: 0 }))
const getClientDetail = mock.fn(async (_input: unknown) => ({ id: 'client-1' }))
const createClient = mock.fn(async (_input: unknown) => ({ id: 'client-1' }))
const updateClient = mock.fn(async (_input: unknown) => ({ id: 'client-1' }))
const deleteClient = mock.fn(async (_input: unknown) => ({ id: 'client-1' }))

// Keep the real QueryClient/cache, capturing hook options to exercise their
// callbacks directly without a browser or React mounting infrastructure.
const modules = [
  mock.module('@tanstack/react-query', {
    namedExports: {
      ...ReactQuery,
      useQueryClient: () => queryClient,
      useMutation,
    },
  }),
  mock.module(import.meta.resolve('#/features/clients/client.functions'), {
    namedExports: {
      listClients,
      getClientStats,
      getClientDetail,
      createClient,
      updateClient,
      deleteClient,
    },
  }),
]
const {
  clientKeys,
  clientsListQuery,
  clientDetailQuery,
  clientStatsQuery,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
} = await import('#/features/clients/client.queries')
beforeEach(() => {
  queryClient = new ReactQuery.QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  })
  useMutation.mock.resetCalls()
  for (const fn of [
    listClients,
    getClientStats,
    getClientDetail,
    createClient,
    updateClient,
    deleteClient,
  ])
    fn.mock.resetCalls()
})
afterEach(() => queryClient.clear())
after(() => modules.forEach((module) => module.restore()))

function capturedMutation(): MutationOptions {
  return useMutation.mock.calls.at(-1)!.arguments[0]
}
function seedList(params = defaultClientsSearch): CachedList {
  const data = {
    items: [
      { id: 'client-1', companyName: 'Acme' },
      { id: 'client-2', companyName: 'Other' },
    ],
    total: 2,
    page: params.page,
    pageSize: params.pageSize,
    pageCount: 1,
  }
  queryClient.setQueryData(clientKeys.list(params), data)
  return data
}
function assertCollectionsInvalidated() {
  assert.equal(
    queryClient.getQueryState(clientKeys.list(defaultClientsSearch))
      ?.isInvalidated,
    true,
  )
  assert.equal(
    queryClient.getQueryState(clientKeys.stats())?.isInvalidated,
    true,
  )
  assert.equal(queryClient.getQueryState(['invoices'])?.isInvalidated, false)
}

describe('client query options and cache keys', () => {
  it('separates list parameters, client ids and stats under a shared prefix', () => {
    assert.deepEqual(clientKeys.all, ['clients'])
    assert.deepEqual(clientKeys.lists(), ['clients', 'list'])
    assert.deepEqual(clientKeys.list(defaultClientsSearch), [
      'clients',
      'list',
      defaultClientsSearch,
    ])
    assert.deepEqual(clientKeys.details(), ['clients', 'detail'])
    assert.deepEqual(clientKeys.detail('client-1'), [
      'clients',
      'detail',
      'client-1',
    ])
    assert.deepEqual(clientKeys.stats(), ['clients', 'stats'])
    assert.notDeepEqual(
      clientKeys.list(defaultClientsSearch),
      clientKeys.list({ ...defaultClientsSearch, page: 2 }),
    )
    assert.notDeepEqual(
      clientKeys.detail('client-1'),
      clientKeys.detail('client-2'),
    )
  })

  it('forwards list parameters and retains the previous page during fetching', async () => {
    const params = {
      ...defaultClientsSearch,
      search: 'Acme',
      status: 'Lead' as const,
    }
    const options = clientsListQuery(params)
    assert.deepEqual(options.queryKey, clientKeys.list(params))
    assert.equal(options.placeholderData, ReactQuery.keepPreviousData)
    assert.equal(options.staleTime, 30_000)
    assert.equal(options.gcTime, 300_000)
    await queryClient.fetchQuery(options)
    assert.deepEqual(listClients.mock.calls[0].arguments, [{ data: params }])
  })

  it('fetches a detail using the requested client id', async () => {
    const options = clientDetailQuery('client-2')
    assert.deepEqual(options.queryKey, clientKeys.detail('client-2'))
    assert.equal(options.staleTime, 30_000)
    assert.equal(options.gcTime, 300_000)
    await queryClient.fetchQuery(options)
    assert.deepEqual(getClientDetail.mock.calls[0].arguments, [
      { data: 'client-2' },
    ])
  })

  it('fetches stats without arguments and uses the longer stats stale time', async () => {
    const options = clientStatsQuery()
    assert.deepEqual(options.queryKey, clientKeys.stats())
    assert.equal(options.staleTime, 60_000)
    assert.equal(options.gcTime, 300_000)
    await queryClient.fetchQuery(options)
    assert.deepEqual(getClientStats.mock.calls[0].arguments, [])
  })
})

describe('client mutation cache behavior', () => {
  for (const [name, hook, serverFn] of [
    ['create', useCreateClient, createClient],
    ['update', useUpdateClient, updateClient],
  ] as const) {
    it(`forwards ${name} input and seeds detail while invalidating collections`, async () => {
      seedList()
      queryClient.setQueryData(clientKeys.stats(), { total: 2 })
      queryClient.setQueryData(['invoices'], [])
      hook()
      const options = capturedMutation()
      const input = { companyName: 'Renamed', id: 'client-1' }
      await options.mutationFn(input)
      assert.deepEqual(serverFn.mock.calls[0].arguments, [{ data: input }])
      const saved = { id: 'client-1', companyName: 'Renamed' }
      options.onSuccess!(saved)
      assert.deepEqual(
        queryClient.getQueryData(clientKeys.detail(saved.id)),
        saved,
      )
      assertCollectionsInvalidated()
    })
  }

  it('cancels list fetches before removing the deleted row from every cached page', async (t) => {
    const first = seedList()
    const pageTwo = { ...defaultClientsSearch, page: 2 }
    const second = seedList(pageTwo)
    queryClient.setQueryData(['invoices'], ['unrelated'])
    const cancel = t.mock.method(queryClient, 'cancelQueries', async () => {
      assert.deepEqual(
        queryClient.getQueryData(clientKeys.list(defaultClientsSearch)),
        first,
      )
    })
    useDeleteClient()
    const options = capturedMutation()
    await options.mutationFn('client-1')
    assert.deepEqual(deleteClient.mock.calls[0].arguments, [
      { data: 'client-1' },
    ])
    const context = await options.onMutate!('client-1')
    assert.deepEqual(cancel.mock.calls[0].arguments, [
      { queryKey: clientKeys.lists() },
    ])
    for (const params of [defaultClientsSearch, pageTwo]) {
      assert.deepEqual(queryClient.getQueryData(clientKeys.list(params)), {
        ...first,
        page: params.page,
        items: [first.items[1]],
        total: 1,
      })
    }
    assert.deepEqual(context.snapshots, [
      [clientKeys.list(defaultClientsSearch), first],
      [clientKeys.list(pageTwo), second],
    ])
    assert.deepEqual(
      first.items.map((item) => item.id),
      ['client-1', 'client-2'],
    )
    assert.deepEqual(queryClient.getQueryData(['invoices']), ['unrelated'])
  })

  it('restores every original list on deletion failure', async () => {
    const first = seedList()
    const params = { ...defaultClientsSearch, status: 'Active' as const }
    const second = seedList(params)
    useDeleteClient()
    const options = capturedMutation()
    const context = await options.onMutate!('client-1')
    options.onError!(new Error('Delete failed'), 'client-1', context)
    assert.deepEqual(
      queryClient.getQueryData(clientKeys.list(defaultClientsSearch)),
      first,
    )
    assert.deepEqual(queryClient.getQueryData(clientKeys.list(params)), second)
  })

  it('tolerates deletion failure before an optimistic snapshot exists', () => {
    useDeleteClient()
    assert.doesNotThrow(() =>
      capturedMutation().onError!(
        new Error('Failed early'),
        'client-1',
        undefined,
      ),
    )
  })

  it('does not invent data for an unfetched list', async () => {
    const params = { ...defaultClientsSearch, page: 2 }
    queryClient.getQueryCache().build(queryClient, {
      queryKey: clientKeys.list(params),
      queryFn: async () => undefined,
    })
    useDeleteClient()
    await capturedMutation().onMutate!('client-1')
    assert.equal(queryClient.getQueryData(clientKeys.list(params)), undefined)
  })

  it('does not make an empty filtered list total negative during optimistic deletion', async () => {
    const params = { ...defaultClientsSearch, status: 'Inactive' as const }
    const empty = { items: [], total: 0, page: 1, pageSize: 16, pageCount: 1 }
    queryClient.setQueryData(clientKeys.list(params), empty)
    useDeleteClient()
    await capturedMutation().onMutate!('client-1')
    assert.deepEqual(queryClient.getQueryData(clientKeys.list(params)), empty)
  })

  for (const error of [null, new Error('Delete failed')]) {
    it(`invalidates collections and removes only the affected detail after ${error ? 'failure' : 'success'}`, () => {
      seedList()
      queryClient.setQueryData(clientKeys.stats(), { total: 2 })
      queryClient.setQueryData(clientKeys.detail('client-1'), {
        id: 'client-1',
      })
      queryClient.setQueryData(clientKeys.detail('client-2'), {
        id: 'client-2',
      })
      queryClient.setQueryData(['invoices'], [])
      useDeleteClient()
      capturedMutation().onSettled!(undefined, error, 'client-1')
      assert.equal(
        queryClient.getQueryData(clientKeys.detail('client-1')),
        undefined,
      )
      assert.deepEqual(
        queryClient.getQueryData(clientKeys.detail('client-2')),
        { id: 'client-2' },
      )
      assertCollectionsInvalidated()
    })
  }
})
