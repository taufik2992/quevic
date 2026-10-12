import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/clients/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <h1>Halaman Clients</h1>
    </div>
  )
}
