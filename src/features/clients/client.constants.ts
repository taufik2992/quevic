// Shared client-logo constraints (no server deps — safe to import anywhere).
// Must stay in sync with the bucket key format in ./storage.

export const MAX_LOGO_SIZE = 2 * 1024 * 1024

export const MAX_LOGO_BASE64_LENGTH = Math.ceil((MAX_LOGO_SIZE * 4) / 3) + 1024

export const ALLOWED_LOGO_MIME = [
  'image/png',
  'image/jpeg',
  'image/webp',
] as const

export type AllowedLogoMime = (typeof ALLOWED_LOGO_MIME)[number]

export const LOGO_MIME_TO_EXT: Record<AllowedLogoMime, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

export function isAllowedLogoMime(mime: string): mime is AllowedLogoMime {
  return (ALLOWED_LOGO_MIME as readonly string[]).includes(mime)
}
