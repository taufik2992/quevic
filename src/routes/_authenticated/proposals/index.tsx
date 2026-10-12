import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/proposals/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <h1>Halaman Proposals</h1>
    </div>
  )
}
