import { Card, CardContent } from '#/components/ui/card'
import { buildClientPreviewModel } from '#/features/templates/data/templateDummy'
import type { ClientFormApi } from '#/features/clients/components/ClientForm'
import { ClientPreviewCard } from './ClientPreviewCard'

// Live preview for the new/edit form: every keystroke rebuilds the
// canonical templateDummy model, so this card can never drift from
// the index detail panel.
export function ClientPreview({
  form,
  existingLogoUrl,
}: {
  form: ClientFormApi
  existingLogoUrl: string | null
}) {
  return (
    <form.Subscribe selector={(state) => state.values}>
      {(values) => {
        const removed = values.removeLogo && !values.logo
        const logoUrl = removed
          ? null
          : values.logo
            ? `data:${values.logo.mime};base64,${values.logo.data}`
            : existingLogoUrl
        return (
          <ClientPreviewCard
            model={buildClientPreviewModel({
              companyName: values.companyName,
              clientType: values.clientType,
              status: values.status,
              description: values.description,
              email: values.email,
              phone: values.phone,
              website: values.website,
              billingAddress: values.billingAddress,
              city: values.city,
              country: values.country,
              postalCode: values.postalCode,
              logoUrl,
              nameFallback: 'Your client name',
            })}
            badge="type"
          />
        )
      }}
    </form.Subscribe>
  )
}

export function ClientPreviewTips() {
  return (
    <Card className="gap-0 rounded-2xl border-border bg-primary-50/60 py-0 dark:bg-card">
      <CardContent className="flex gap-2.5 p-4">
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-[12px] font-bold text-white">
          i
        </span>
        <div className="text-[12.5px] leading-5 text-neutral-600">
          <p className="font-bold text-neutral-900">Tips</p>
          <ul className="mt-1 list-disc pl-4">
            <li>You can always edit client information later.</li>
            <li>
              This client can be used for multiple invoices and proposals.
            </li>
            <li>
              Make sure the information is accurate for professional
              communication.
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
