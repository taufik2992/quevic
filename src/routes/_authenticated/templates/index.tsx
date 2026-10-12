import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/templates/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <h1>Halaman Templates</h1>
    </div>
  )
}
