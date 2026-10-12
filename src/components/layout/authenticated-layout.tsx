import { useState } from 'react'
import type { ReactNode } from 'react'
import { AppSidebar } from './app-sidebar'
import { SiteHeader } from './site-header'
import { Sheet, SheetContent, SheetTitle } from '#/components/ui/sheet'

export function AuthenticatedLayout({
  children,
  userName,
}: {
  children: ReactNode
  userName?: string
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full  gap-4 p-3 sm:p-4">
        {/* Desktop sidebar */}
        <div className="sticky top-3 hidden h-[calc(100vh-24px)] w-58 shrink-0 sm:top-4 sm:h-[calc(100vh-32px)] lg:block">
          <AppSidebar />
        </div>

        {/* Mobile drawer — shadcn Sheet for animated open/close */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            showCloseButton={false}
            className="w-73 border-0 bg-transparent p-3 shadow-none lg:hidden"
          >
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <AppSidebar onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <SiteHeader
            userName={userName}
            onMenuClick={() => setMobileOpen(true)}
          />
          {children}
        </div>
      </div>
    </div>
  )
}
