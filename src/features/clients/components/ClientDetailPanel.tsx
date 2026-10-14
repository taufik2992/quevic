import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowRight,
  BadgeCheck,
  CircleCheck,
  Ellipsis,
  FileText,
  Pencil,
  StickyNote,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '#/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { useToast } from '#/providers/toast-provider'
import { formatIDR } from '#/lib/format'
import { clientActivitiesDummy } from '../data/client.dummy'
import type {
  ClientActivity,
  ClientActivityType,
  ClientListItem,
} from '../data/client.types'
import { useDeleteClient } from '#/features/clients/client.queries'
import { buildClientPreviewModel } from '#/features/templates/data/templateDummy'

import { DeleteClientDialog } from '#/features/clients/components/DeleteClientDialog'
import { ClientPreviewCard } from './ClientPreviewCard'

const ACTIVITY_ICON: Record<ClientActivityType, typeof FileText> = {
  'invoice-paid': CircleCheck,
  'proposal-accepted': BadgeCheck,
  'invoice-sent': FileText,
  'proposal-created': FileText,
}

const ACTIVITY_TONE: Record<ClientActivityType, string> = {
  'invoice-paid': 'bg-success/15 text-success',
  'proposal-accepted': 'bg-primary/10 text-primary',
  'invoice-sent': 'bg-purple/10 text-purple',
  'proposal-created': 'bg-purple/10 text-purple',
}

function ActivityRow({ activity }: { activity: ClientActivity }) {
  const Icon = ACTIVITY_ICON[activity.type]
  return (
    <li className="flex items-start gap-3">
      <span
        className={`grid size-7 shrink-0 place-items-center rounded-full ${ACTIVITY_TONE[activity.type]}`}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-neutral-900">
          {activity.title}
        </p>
        <p className="truncate text-[12px] text-muted-foreground">
          {activity.subtitle}
        </p>
      </div>
      <span className="shrink-0 text-[11.5px] text-muted-foreground">
        {activity.date}
      </span>
    </li>
  )
}

function EmptyTab({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof FileText
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 py-8 text-center">
      <span className="grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <p className="text-[13px] font-semibold text-neutral-900">{title}</p>
      <p className="max-w-55 text-[12px] text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

export function ClientDetailPanel({ client }: { client: ClientListItem }) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const deleteMutation = useDeleteClient()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleDelete = () => {
    deleteMutation.mutate(client.id, {
      onSuccess: () => {
        setConfirmOpen(false)
        showToast({
          title: 'Client deleted',
          description: `${client.companyName} was removed.`,
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
  }

  return (
    <Card className="h-full min-h-0 gap-0 overflow-hidden rounded-2xl border-border bg-card py-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)] xl:max-h-250 dark:shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-neutral-900">
            Client Details
          </h2>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 rounded-lg text-[12.5px]"
              onClick={() =>
                navigate({
                  to: '/clients/$clientId/edit',
                  params: { clientId: client.id },
                })
              }
            >
              <Pencil data-icon="inline-start" />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="rounded-lg"
                  aria-label={`More actions for ${client.companyName}`}
                >
                  <Ellipsis data-icon="inline-start" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onSelect={async () => {
                      try {
                        await navigator.clipboard.writeText(client.id)
                        showToast({
                          title: 'Copied to clipboard',
                          description: client.id,
                          status: 'success',
                        })
                      } catch {
                        showToast({
                          title: 'Copy failed',
                          description: 'Please try again.',
                          status: 'error',
                        })
                      }
                    }}
                  >
                    Copy client ID
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => setConfirmOpen(true)}
                  >
                    Delete client
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
        <ClientPreviewCard
          model={buildClientPreviewModel({
            companyName: client.companyName,
            clientType: client.clientType,
            status: client.status,
            description: client.description,
            email: client.email,
            phone: client.phone,
            website: client.website,
            billingAddress: client.billingAddress,
            city: client.city,
            country: client.country,
            postalCode: client.postalCode,
            logoUrl: client.logoUrl,
          })}
          badge="status"
        />

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-primary/6 p-2.5 text-center">
            <p className="flex items-center justify-center gap-1 text-[15px] font-extrabold text-neutral-900">
              <FileText className="size-3.5 text-primary" />
              {client.invoiceCount}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Total Invoices
            </p>
          </div>
          <div className="rounded-xl bg-purple/10 p-2.5 text-center">
            <p className="flex items-center justify-center gap-1 text-[15px] font-extrabold text-neutral-900">
              <FileText className="size-3.5 text-purple" />
              {client.proposalCount}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Total Proposals
            </p>
          </div>
          <div className="rounded-xl bg-success/10 p-2.5 text-center">
            <p className="text-[13px] font-extrabold text-neutral-900 tabular-nums">
              {formatIDR(client.totalSpent)}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Total Spent
            </p>
          </div>
        </div>

        <Tabs defaultValue="activity">
          <TabsList variant="line" className="w-full justify-start gap-4">
            <TabsTrigger value="activity" className="text-[12.5px]">
              Recent Activity
            </TabsTrigger>
            <TabsTrigger value="invoices" className="text-[12.5px]">
              Invoices
            </TabsTrigger>
            <TabsTrigger value="proposals" className="text-[12.5px]">
              Proposals
            </TabsTrigger>
            <TabsTrigger value="notes" className="text-[12.5px]">
              Notes
            </TabsTrigger>
          </TabsList>
          <TabsContent value="activity">
            <ul className="flex flex-col gap-4 pt-1">
              {clientActivitiesDummy.map((activity) => (
                <ActivityRow key={activity.id} activity={activity} />
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="invoices">
            <EmptyTab
              icon={FileText}
              title="No invoices yet"
              description="Invoices created for this client will appear here."
            />
          </TabsContent>
          <TabsContent value="proposals">
            <EmptyTab
              icon={FileText}
              title="No proposals yet"
              description="Proposals sent to this client will appear here."
            />
          </TabsContent>
          <TabsContent value="notes">
            <EmptyTab
              icon={StickyNote}
              title="No notes yet"
              description="Notes about this client will appear here."
            />
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="mt-auto">
        <Button
          variant="outline"
          className="w-full rounded-xl text-primary"
          onClick={() =>
            showToast({
              title: 'Full activity is not available yet',
              description: 'The activity history page is coming soon.',
              status: 'info',
            })
          }
        >
          View All Activity
          <ArrowRight data-icon="inline-end" />
        </Button>
      </CardFooter>

      <DeleteClientDialog
        clientName={client.companyName}
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </Card>
  )
}
