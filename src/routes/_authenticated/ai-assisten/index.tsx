import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/ai-assisten/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <h1>Halaman Ai Assisten</h1>
    </div>
  )
}
