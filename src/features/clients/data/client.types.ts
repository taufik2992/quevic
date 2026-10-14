import type {
  getClientDetail,
  getClientStats,
  listClients,
} from '#/features/clients/client.functions'

// Result shapes are derived from the real server functions (single source
// of truth). UI-only shapes that have no API yet are declared explicitly.
export type ClientListResult = Awaited<ReturnType<typeof listClients>>
export type ClientListItem = ClientListResult['items'][number]
export type ClientDetail = Awaited<ReturnType<typeof getClientDetail>>
export type ClientStats = Awaited<ReturnType<typeof getClientStats>>

export type ClientActivityType =
  'invoice-paid' | 'proposal-accepted' | 'invoice-sent' | 'proposal-created'

export interface ClientActivity {
  id: string
  type: ClientActivityType
  title: string
  subtitle: string
  date: string
}
