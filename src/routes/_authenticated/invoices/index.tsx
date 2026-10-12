import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/invoices/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <h1>Halaman Invoices</h1>
    </div>
  )
}
