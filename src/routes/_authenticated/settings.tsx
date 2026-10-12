import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <h1>Halaman Settings</h1>
    </div>
  )
}
