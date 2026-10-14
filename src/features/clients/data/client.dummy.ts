import type { ClientActivity } from './client.types'

export const clientActivitiesDummy: ClientActivity[] = [
  {
    id: 'act-001',
    type: 'invoice-paid',
    title: 'Invoice paid',
    subtitle: 'INV-2026-001 • Rp 5.000.000',
    date: 'Sep 10, 2026',
  },
  {
    id: 'act-002',
    type: 'proposal-accepted',
    title: 'Proposal accepted',
    subtitle: 'PROP-2026-001 • Website Development',
    date: 'Sep 9, 2026',
  },
  {
    id: 'act-003',
    type: 'invoice-sent',
    title: 'Invoice sent',
    subtitle: 'INV-2026-002 • Rp 3.500.000',
    date: 'Sep 5, 2026',
  },
  {
    id: 'act-004',
    type: 'proposal-created',
    title: 'New proposal created',
    subtitle: 'PROP-2026-003 • UI/UX Design',
    date: 'Sep 3, 2026',
  },
]
