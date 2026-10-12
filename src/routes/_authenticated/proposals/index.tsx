import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/proposals/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex">
      <h1>Halaman Proposals</h1>
      <p>coba coderabbit</p>
    </div>
  )
}
