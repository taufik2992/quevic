import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useToast } from '#/providers/toast-provider'
import { useCreateClient } from '#/features/clients/client.queries'
import { defaultClientsSearch } from '#/features/clients/client.schema'
import {
  ClientForm,
  clientFormDefaultValues,
  useClientForm,
} from '#/features/clients/components/ClientForm'
import {
  ClientPreview,
  ClientPreviewTips,
} from '#/features/clients/components/ClientPreview'

export const Route = createFileRoute('/_authenticated/clients/new')({
  component: NewClientPage,
})

function NewClientPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const createMutation = useCreateClient()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useClientForm({
    defaultValues: clientFormDefaultValues,
    onSubmit: async (value) => {
      setServerError(null)
      const { removeLogo: _ignored, ...input } = value
      try {
        await createMutation.mutateAsync(input)
        showToast({
          title: 'Client saved',
          description: `${value.companyName} was added to your clients.`,
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
        <ButtonBack />
        <h1 className="mt-1 text-[22px] font-extrabold tracking-tight text-neutral-900">
          Add Client
        </h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Add a new client to your database. You can use this client for
          invoices and proposals.
        </p>
      </div>

      <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_800px]">
        <ClientForm
          form={form}
          existingLogoUrl={null}
          submitLabel="Save Client"
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
          <ClientPreview form={form} existingLogoUrl={null} />
          <ClientPreviewTips />
        </div>
      </div>
    </main>
  )
}

function ButtonBack() {
  return (
    <Link
      to="/clients"
      search={defaultClientsSearch}
      className="inline-flex items-center gap-1.5 text-[13px] font-bold text-primary hover:underline "
    >
      <ArrowLeft className="size-4" />
      Back to Clients
    </Link>
  )
}
