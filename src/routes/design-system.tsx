import { createFileRoute } from '@tanstack/react-router'
import { ModeToggle } from '#/components/ThemeToggle'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { Separator } from '#/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { BadgesSection } from '#/components/design-system/badges-section'
import { ButtonsSection } from '#/components/design-system/buttons-section'
import { ChartsSection } from '#/components/design-system/charts-section'
import { IconsSection } from '#/components/design-system/icons-section'
import { InputsSection } from '#/components/design-system/inputs-section'
import { PaletteSection } from '#/components/design-system/palette-section'
import { SidebarPreview } from '#/components/design-system/sidebar-preview'

export const Route = createFileRoute('/design-system')({
  component: DesignSystemPage,
})

function DesignSystemPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-primary">quevic</p>
          <h1 className="text-2xl font-bold tracking-tight">Design Tokens</h1>
          <p className="text-sm text-muted-foreground">
            Modern • Premium • Professional — Consistent • Scalable
          </p>
        </div>
        <ModeToggle />
      </div>

      <Alert>
        <AlertTitle>Sumber token</AlertTitle>
        <AlertDescription>
          Diambil dari public/DesignToken.png dan dipetakan ke variabel oklch di
          src/styles.css.
        </AlertDescription>
      </Alert>

      <Separator />

      <Tabs defaultValue="foundations">
        <TabsList>
          <TabsTrigger value="foundations">Foundations</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
        </TabsList>
        <TabsContent value="foundations" className="flex flex-col gap-6">
          <PaletteSection />
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartsSection />
            <IconsSection />
          </div>
        </TabsContent>
        <TabsContent value="components" className="flex flex-col gap-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ButtonsSection />
            <InputsSection />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <BadgesSection />
            <SidebarPreview />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
