import { cn } from '#/lib/utils'

const SIZE_CLASS = {
  xs: 'size-6 rounded-md text-[11px]',
  md: 'size-10 rounded-xl text-[15px]',
  lg: 'size-14 rounded-2xl text-xl',
} as const

const FALLBACK_LOGO_SRC = '/quevic-logo.png'

// Single avatar visual for clients everywhere (table, preview card,
// detail panel): uploaded logo when present, Quevic mark otherwise.
export function ClientAvatar({
  logoUrl,
  name,
  size = 'md',
  className,
}: {
  logoUrl?: string | null
  name: string
  size?: keyof typeof SIZE_CLASS
  className?: string
}) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt=""
        className={cn('shrink-0 object-cover', SIZE_CLASS[size], className)}
      />
    )
  }
  return (
    <img
      src={FALLBACK_LOGO_SRC}
      alt={`${name} logo placeholder`}
      className={cn(
        'shrink-0 bg-white object-contain p-0.5',
        SIZE_CLASS[size],
        className,
      )}
    />
  )
}
