import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  Plus,
  Search,
  Upload,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { Input } from '#/components/ui/input'
import { Skeleton } from '#/components/ui/skeleton'
import { DataTable } from '#/components/data-table/data-table'
import { useToast } from '#/providers/toast-provider'
import type { ClientListItem } from '#/data/client.types'
import {
  clientStatsQuery,
  clientsListQuery,
  useDeleteClient,
} from '#/features/clients/client.queries'
import type { ListClientsQuery } from '#/features/clients/client.schema'
import { listClientsQuerySchema } from '#/features/clients/client.schema'
import { ClientDetailPanel } from '#/features/clients/components/ClientDetailPanel'
import { ClientStats } from '#/features/clients/components/ClientStats'
import { DeleteClientDialog } from '#/features/clients/components/DeleteClientDialog'
import { createClientColumns } from '#/features/clients/components/client-columns'

export const Route = createFileRoute('/_authenticated/clients/')({
  validateSearch: (search: Record<string, unknown>) =>
    listClientsQuerySchema.parse(search),
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps }) =>
    Promise.all([
      context.queryClient.ensureQueryData(clientsListQuery(deps.search)),
      context.queryClient.ensureQueryData(clientStatsQuery()),
    ]),
  pendingComponent: ClientsPending,
  component: ClientsPage,
})

const SORT_LABEL: Record<ListClientsQuery['sort'], string> = {
  newest: 'Newest',
  oldest: 'Oldest',
  name: 'Name A–Z',
  spent: 'Top spend',
}

const STATUS_OPTIONS = ['All', 'Active', 'Lead', 'Inactive'] as const

function ClientsPending() {
  return (
    <main className="flex flex-col gap-4 pb-4">
      <Skeleton className="h-9 w-48" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Skeleton className="h-120 rounded-2xl" />
        <Skeleton className="h-120 rounded-2xl" />
      </div>
    </main>
  )
}

function ClientsPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { showToast } = useToast()
  const { data: list } = useSuspenseQuery(clientsListQuery(search))
  const { data: stats } = useSuspenseQuery(clientStatsQuery())
  const deleteMutation = useDeleteClient()

  const [draft, setDraft] = useState(search.search ?? '')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ClientListItem | null>(null)

  useEffect(() => {
    setDraft(search.search ?? '')
  }, [search.search])

  useEffect(() => {
    if (draft === (search.search ?? '')) return
    const timer = setTimeout(() => {
      void navigate({
        search: {
          search: draft || undefined,
          status: search.status,
          sort: search.sort,
          page: 1,
          pageSize: search.pageSize,
        },
        replace: true,
      })
    }, 350)
    return () => clearTimeout(timer)
  }, [draft, navigate, search])

  const patchSearch = (patch: Partial<ListClientsQuery>) => {
    void navigate({
      search: {
        search: search.search,
        status: search.status,
        sort: search.sort,
        pageSize: search.pageSize,
        ...patch,
        page: 1,
      },
      replace: true,
    })
  }

  const goToPage = (page: number) => {
    void navigate({
      search: {
        search: search.search,
        status: search.status,
        sort: search.sort,
        page,
        pageSize: search.pageSize,
      },
      replace: true,
    })
  }

  const columns = useMemo(
    () =>
      createClientColumns({
        onView: (client) => setSelectedId(client.id),
        onEdit: (client) =>
          navigate({
            to: '/clients/$clientId/edit',
            params: { clientId: client.id },
          }),
        onDelete: (client) => setDeleteTarget(client),
      }),
    [navigate],
  )

  const selected =
    list.items.find((item) => item.id === selectedId) ??
    list.items.at(0) ??
    null

  const from = list.total === 0 ? 0 : (list.page - 1) * list.pageSize + 1
  const to = Math.min(list.page * list.pageSize, list.total)
  const pages = Array.from(
    new Set(
      [1, list.page - 1, list.page, list.page + 1, list.pageCount].filter(
        (page) => page >= 1 && page <= list.pageCount,
      ),
    ),
  ).sort((a, b) => a - b)

  return (
    <main className="flex min-w-0 flex-col gap-4 pb-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-tight text-neutral-900">
            Clients
          </h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Manage your clients, track their activity, and build stronger
            relationships.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-xl text-primary"
            onClick={() =>
              showToast({
                title: 'Import is not available yet',
                description: 'CSV import for clients is coming soon.',
                status: 'info',
              })
            }
          >
            <Upload data-icon="inline-start" />
            Import Clients
          </Button>
          <Button asChild className="rounded-xl">
            <Link to="/clients/new">
              <Plus data-icon="inline-start" />
              Add Client
              <ChevronDown data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </div>

      <ClientStats stats={stats} />

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_550px]">
        <Card className="h-full min-h-0 gap-0 rounded-2xl border-border bg-card py-0 shadow-[0_1px_2px_rgba(16,24,40,0.05)] xl:max-h-250 dark:shadow-none">
          <CardContent className="flex h-full min-h-0 min-w-0 flex-col gap-3 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[15px] font-bold text-neutral-900">
                All Clients
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Search clients..."
                    aria-label="Search clients"
                    className="h-9 w-52 rounded-xl pl-9"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-xl"
                    >
                      <ListFilter data-icon="inline-start" />
                      {search.status ?? 'Filter'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                      {STATUS_OPTIONS.map((option) => (
                        <DropdownMenuItem
                          key={option}
                          onSelect={() =>
                            patchSearch({
                              status: option === 'All' ? undefined : option,
                            })
                          }
                        >
                          {option}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-xl"
                    >
                      {SORT_LABEL[search.sort]}
                      <ChevronDown data-icon="inline-end" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                      {(
                        Object.keys(SORT_LABEL) as ListClientsQuery['sort'][]
                      ).map((option) => (
                        <DropdownMenuItem
                          key={option}
                          onSelect={() => patchSearch({ sort: option })}
                        >
                          {SORT_LABEL[option]}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="min-h-0 min-w-0 flex-1 overflow-auto">
              <DataTable
                columns={columns}
                data={list.items}
                emptyMessage="No clients found. Add your first client to get started."
                onRowClick={(row) => setSelectedId(row.id)}
                isRowSelected={(row) => row.id === selected?.id}
              />
            </div>

            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
              <p className="text-[12.5px] text-muted-foreground">
                Showing {from}–{to} of {list.total} clients
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="rounded-lg"
                  disabled={list.page <= 1}
                  aria-label="Previous page"
                  onClick={() => goToPage(list.page - 1)}
                >
                  <ChevronLeft data-icon="inline-start" />
                </Button>
                {pages.map((page) => (
                  <Button
                    key={page}
                    variant={page === list.page ? 'secondary' : 'ghost'}
                    size="icon-sm"
                    className="rounded-lg"
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="rounded-lg"
                  disabled={list.page >= list.pageCount}
                  aria-label="Next page"
                  onClick={() => goToPage(list.page + 1)}
                >
                  <ChevronRight data-icon="inline-start" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {selected ? (
          <ClientDetailPanel key={selected.id} client={selected} />
        ) : (
          <Card className="h-full rounded-2xl border-border bg-card">
            <CardContent className="p-5 text-[13px] text-muted-foreground">
              No client selected.
            </CardContent>
          </Card>
        )}
      </div>

      <DeleteClientDialog
        clientName={deleteTarget?.companyName ?? ''}
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onConfirm={() => {
          if (!deleteTarget) return
          deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => {
              setDeleteTarget(null)
              showToast({
                title: 'Client deleted',
                description: `${deleteTarget.companyName} was removed.`,
                status: 'success',
              })
            },
            onError: (error) => {
              showToast({
                title: 'Delete failed',
                description:
                  error instanceof Error ? error.message : 'Please try again.',
                status: 'error',
              })
            },
          })
        }}
        isPending={deleteMutation.isPending}
      />
    </main>
  )
}
