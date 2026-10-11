import { ModeToggle } from '#/components/ThemeToggle'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <ModeToggle />
    </div>
  )
}
