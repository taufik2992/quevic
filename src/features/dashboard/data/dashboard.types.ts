export type InvoiceStatus = 'Paid' | 'Sent' | 'Overdue' | 'Draft'
export type ProposalStatus = 'Accepted' | 'Sent' | 'Viewed' | 'Draft' | 'Expired'

export interface DashboardStat {
  id: 'revenue' | 'paid' | 'outstanding' | 'clients'
  label: string
  value: string
  delta: string
  deltaDirection: 'up' | 'down'
  tone: 'green' | 'blue' | 'red' | 'purple'
}

export interface RevenuePoint {
  month: string
  paid: number
  outstanding: number
}

export interface RecentInvoice {
  id: string
  client: string
  clientInitials: string
  clientTone: string
  amount: number
  status: InvoiceStatus
  date: string
}

export interface RecentProposal {
  id: string
  client: string
  clientInitials: string
  clientTone: string
  amount: number
  status: ProposalStatus
  date: string
}

export interface DashboardSummary {
  greetingName: string
  stats: DashboardStat[]
  revenue: RevenuePoint[]
  invoices: RecentInvoice[]
  proposals: RecentProposal[]
}
