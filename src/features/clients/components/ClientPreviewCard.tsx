import type { ClientPreviewModel } from '#/features/clients/templates/templateDummy'
import { renderClientTemplate } from '#/features/clients/templates/CardTemplate'
import { TemplatePreview } from '../templates/Templatepreview'

// Shared "Client Preview". No markup lives here: the visual comes from
// `renderClientTemplate` (the same HTML used for A4 / PDF), displayed in a
// sandboxed iframe. The props are unchanged, so ClientPreview.tsx and
// ClientDetailPanel.tsx keep working without edits.
export function ClientPreviewCard({
  model,
  badge = 'type',
}: {
  model: ClientPreviewModel
  badge?: 'type' | 'status'
}) {
  const html = renderClientTemplate(model, { badge, layout: 'card' })

  return (
    <TemplatePreview
      html={html}
      page="card"
      title={`${model.name} preview`}
      className="block w-full max-w-160 overflow-hidden rounded-2xl border border-border bg-white leading-none"
    />
  )
}
