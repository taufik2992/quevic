import { cn } from '#/lib/utils'

export function ClientCell({
  initials,
  tone,
  name,
  imageUrl,
}: {
  initials: string
  tone: string
  name: string
  imageUrl?: string | null
}) {
  return (
    <span className="flex items-center gap-2">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="size-6 shrink-0 rounded-md object-cover"
        />
      ) : (
        <span
          className={cn(
            'grid size-6 shrink-0 place-items-center rounded-md text-[11px] font-bold',
            tone,
          )}
        >
          {initials}
        </span>
      )}
      <span className="max-w-37.5 truncate font-normal text-neutral-800">
        {name}
      </span>
    </span>
  )
}
