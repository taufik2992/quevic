import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Skeleton } from '#/components/ui/skeleton'
import { useToast } from '#/providers/toast-provider'
import {
  clientDetailQuery,
  useUpdateClient,
} from '#/features/clients/client.queries'
import { defaultClientsSearch } from '#/features/clients/client.schema'
import {
  ClientForm,
  useClientForm,
} from '#/features/clients/components/ClientForm'
import type { ClientFormValues } from '#/features/clients/components/ClientForm'
import {
  ClientPreview,
  ClientPreviewTips,
} from '#/features/clients/components/ClientPreview'

export const Route = createFileRoute('/_authenticated/clients/$clientId/edit')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(clientDetailQuery(params.clientId)),
  pendingComponent: EditClientPending,
  component: EditClientPage,
})

function EditClientPending() {
  return (
    <main className="flex flex-col gap-4 pb-4">
      <Skeleton className="h-9 w-48" />
      <div className="grid grid-cols-1 gap-4">
        <Skeleton className="h-150 rounded-2xl" />
        <Skeleton className="h-150 rounded-2xl" />
      </div>
    </main>
  )
}

function toFormValues(detail: {
  companyName: string
  clientType: 'Company' | 'Individual'
  email: string
  phone: string | null
  website: string | null
  description: string | null
  billingAddress: string
  country: string
  province: string | null
  city: string | null
  postalCode: string | null
  contactName: string | null
  contactPosition: string | null
  contactEmail: string | null
  contactPhone: string | null
  status: 'Active' | 'Lead' | 'Inactive'
}): ClientFormValues {
  return {
    companyName: detail.companyName,
    clientType: detail.clientType,
    email: detail.email,
    phone: detail.phone ?? undefined,
    website: detail.website ?? undefined,
    description: detail.description ?? undefined,
    billingAddress: detail.billingAddress,
    country: detail.country,
    province: detail.province ?? undefined,
    city: detail.city ?? undefined,
    postalCode: detail.postalCode ?? undefined,
    contactName: detail.contactName ?? '',
    contactPosition: detail.contactPosition ?? undefined,
    contactEmail: detail.contactEmail ?? undefined,
    contactPhone: detail.contactPhone ?? undefined,
    status: detail.status,
    logo: undefined,
    removeLogo: false,
  }
}

function EditClientPage() {
  const { clientId } = Route.useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const updateMutation = useUpdateClient()
  const [serverError, setServerError] = useState<string | null>(null)
  const { data: detail } = useSuspenseQuery(clientDetailQuery(clientId))

  const form = useClientForm({
    defaultValues: toFormValues(detail),
    onSubmit: async (value) => {
      setServerError(null)
      const { logo, removeLogo, ...rest } = value
      try {
        await updateMutation.mutateAsync({
          ...rest,
          id: clientId,
          logo,
          removeLogo,
        })
        showToast({
          title: 'Client updated',
          description: `${value.companyName} was saved.`,
          status: 'success',
        })
        await navigate({ to: '/clients', search: defaultClientsSearch })
      } catch (error) {
        setServerError(
          error instanceof Error ? error.message : 'Failed to save client.',
        )
      }
    },
  })

  return (
    <main className="flex min-w-0 flex-col gap-4 pb-4 p-2">
      <div>
        <Link
          to="/clients"
          search={defaultClientsSearch}
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-primary hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to Clients
        </Link>
        <h1 className="mt-1 text-[22px] font-extrabold tracking-tight text-neutral-900">
          Edit Client
        </h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Update {detail.companyName} in your database.
        </p>
      </div>

      <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_700px]">
        <ClientForm
          form={form}
          existingLogoUrl={detail.logoUrl}
          submitLabel="Save Changes"
          serverError={serverError}
          onCancel={() =>
            navigate({ to: '/clients', search: defaultClientsSearch })
          }
        />
        <div className="flex min-w-0 flex-col gap-4">
          <div>
            <h2 className="text-[15px] font-bold text-neutral-900">
              Client Preview
            </h2>
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">
              This is how the client information will appear on your invoices
              and proposals.
            </p>
          </div>
          <ClientPreview form={form} existingLogoUrl={detail.logoUrl} />
          <ClientPreviewTips />
        </div>
      </div>
    </main>
  )
}
