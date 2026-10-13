import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  createClient,
  deleteClient,
  getClientDetail,
  getClientStats,
  listClients,
  updateClient,
} from '#/features/clients/client.functions'
import type {
  CreateClientInput,
  ListClientsQuery,
  UpdateClientInput,
} from '#/features/clients/client.schema'
import type {
  ClientDetail,
  ClientListItem,
  ClientListResult,
} from '#/data/client.types'

export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (params: ListClientsQuery) => [...clientKeys.lists(), params] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
  stats: () => [...clientKeys.all, 'stats'] as const,
}

export function clientsListQuery(params: ListClientsQuery) {
  return queryOptions({
    queryKey: clientKeys.list(params),
    queryFn: () => listClients({ data: params }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  })
}

export function clientStatsQuery() {
  return queryOptions({
    queryKey: clientKeys.stats(),
    queryFn: () => getClientStats(),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  })
}

export function clientDetailQuery(id: string) {
  return queryOptions({
    queryKey: clientKeys.detail(id),
    queryFn: () => getClientDetail({ data: id }),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  })
}

function invalidateClientCollections(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  void queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
  void queryClient.invalidateQueries({ queryKey: clientKeys.stats() })
}

export function useCreateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateClientInput) => createClient({ data: input }),
    onSuccess: (created: ClientDetail) => {
      queryClient.setQueryData(clientKeys.detail(created.id), created)
      invalidateClientCollections(queryClient)
    },
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateClientInput) => updateClient({ data: input }),
    onSuccess: (updated: ClientDetail) => {
      queryClient.setQueryData(clientKeys.detail(updated.id), updated)
      invalidateClientCollections(queryClient)
    },
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteClient({ data: id }),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: clientKeys.lists() })
      const snapshots = queryClient.getQueriesData<ClientListResult>({
        queryKey: clientKeys.lists(),
      })
      snapshots.forEach(([key, data]) => {
        if (!data) return
        const items: ClientListItem[] = data.items.filter(
          (item) => item.id !== id,
        )
        queryClient.setQueryData<ClientListResult>(key, {
          ...data,
          items,
          total: data.total - 1,
        })
      })
      return { snapshots }
    },
    onError: (_error, _id, context) => {
      context?.snapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data)
      })
    },
    onSettled: (_result, _error, id) => {
      queryClient.removeQueries({ queryKey: clientKeys.detail(id) })
      invalidateClientCollections(queryClient)
    },
  })
}
