// Canonical client-preview model (single source of truth).
//
// `buildClientPreviewModel` normalizes any client-shaped input (form values,
// list rows, detail rows) into one model. `ClientPreviewCard` renders that
// model pixel-faithful to the "Client Preview" design. Both consumers —
// the form pages (new/edit) and the index detail panel — go through here,
// so the preview stays identical everywhere.

import type { ClientStatus } from '#/features/clients/client.schema'

export type PreviewContactKind = 'email' | 'phone' | 'website'

export interface PreviewContact {
  kind: PreviewContactKind
  value: string
}

export interface ClientPreviewModel {
  logoUrl: string | null
  fallbackInitial: string
  name: string
  typeLabel: string
  status: ClientStatus
  description: string | null
  contacts: PreviewContact[]
  addressLines: string[]
}

export interface ClientPreviewInput {
  companyName: string
  clientType: string
  status: ClientStatus
  description?: string | null
  email: string
  phone?: string | null
  website?: string | null
  billingAddress?: string | null
  city?: string | null
  country?: string | null
  postalCode?: string | null
  logoUrl?: string | null
  nameFallback?: string
}

export function buildClientPreviewModel(
  input: ClientPreviewInput,
): ClientPreviewModel {
  const name =
    input.companyName.trim() || input.nameFallback || 'Unnamed client'
  const contacts: PreviewContact[] = []
  if (input.email.trim())
    contacts.push({ kind: 'email', value: input.email.trim() })
  if (input.phone?.trim())
    contacts.push({ kind: 'phone', value: input.phone.trim() })
  if (input.website?.trim()) {
    contacts.push({ kind: 'website', value: input.website.trim() })
  }

  const locality = [input.city, input.country, input.postalCode]
    .filter((part) => part?.trim())
    .join(', ')
  const addressLines = [input.billingAddress?.trim(), locality].filter(
    (line): line is string => Boolean(line),
  )

  return {
    logoUrl: input.logoUrl ?? null,
    fallbackInitial: name.charAt(0).toUpperCase() || '?',
    name,
    typeLabel: input.clientType,
    status: input.status,
    description: input.description?.trim() || null,
    contacts,
    addressLines,
  }
}
