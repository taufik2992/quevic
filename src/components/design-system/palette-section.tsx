import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  ColorScale,
  NEUTRAL_SWATCHES,
  PRIMARY_SWATCHES,
  SEMANTIC_SWATCHES,
} from './color-scale'

export function PaletteSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Color Palette</CardTitle>
        <CardDescription>
          Primary, semantic, dan neutral dari DesignToken quevic.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <ColorScale title="Primary (Blue)" swatches={PRIMARY_SWATCHES} />
        <div className="grid gap-6 lg:grid-cols-2">
          <ColorScale title="Semantic" swatches={SEMANTIC_SWATCHES} />
          <ColorScale title="Neutral" swatches={NEUTRAL_SWATCHES} />
        </div>
      </CardContent>
    </Card>
  )
}
