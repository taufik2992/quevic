// Shared building blocks for HTML templates (invoice, proposal, …): one
// document shell, one set of sanitizers, one page-size table.
//
// NOTE: the client card template (CardTemplate.ts) is intentionally
// self-contained and does not use renderDocument, so card previews can
// never drift when this shared shell evolves. Only pure sanitizers are
// shared (escapeHtml, safeUrl, safeImageSrc) plus PAGE_SIZES, which sizes
// the preview iframe in TemplatePreview.tsx.

export type PageKind = 'a4' | 'card'

// Pixel width used by the preview iframe. Height for 'card' is only the
// first-paint fallback — TemplatePreview measures the real document height
// so no gap stays below the card. Must match the CSS below.
export const PAGE_SIZES: Record<PageKind, { width: number; height: number }> = {
  a4: { width: 794, height: 1123 },
  card: { width: 640, height: 580 },
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Only http(s) links. Returns an already-escaped href, or null. */
export function safeUrl(raw?: string | null): string | null {
  const value = raw?.trim()
  if (!value) return null
  try {
    const url = new URL(
      /^https?:\/\//i.test(value) ? value : `https://${value}`,
    )
    return ['http:', 'https:'].includes(url.protocol)
      ? escapeHtml(url.href)
      : null
  } catch {
    return null
  }
}

/**
 * Allow raster data URIs, https, and root-relative paths.
 * SVG data URIs are rejected on purpose (user-supplied SVG can carry script).
 * NOTE: root-relative paths do not resolve in server-side PDF rendering;
 * pass an absolute URL or a data URI there.
 */
export function safeImageSrc(raw?: string | null): string | null {
  const value = raw?.trim()
  if (!value) return null
  const ok =
    /^data:image\/(png|jpe?g|webp|gif);base64,[a-z0-9+/=]+$/i.test(value) ||
    /^https:\/\//i.test(value) ||
    /^\/(?!\/)/.test(value)
  return ok ? escapeHtml(value) : null
}

const BASE_CSS = `
  :root {
    --qx-ink: #0f172a;
    --qx-body: #1e293b;
    --qx-muted: #64748b;
    --qx-faint: #f1f5f9;
    --qx-line: #e5eaf3;
    --qx-primary: #2563eb;
    --qx-page-bg: #f4f6fb;
  }

  * { box-sizing: border-box; }

  html, body {
    margin: 0;
    padding: 0;
    background: transparent;
    color: var(--qx-ink);
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    -webkit-font-smoothing: antialiased;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .qx-page { position: relative; overflow: hidden; }

  .qx-page--a4 {
    width: 794px;
    min-height: 1123px;
    padding: 72px 56px;
    background: var(--qx-page-bg);
  }

  .qx-page--card {
    width: 640px;
    padding: 0;
    background: #fff;
  }

  @page { size: A4; margin: 0; }

  @media print {
    .qx-page--a4 {
      width: 210mm;
      min-height: 297mm;
    }
  }
`

export function renderDocument(opts: {
  title: string
  body: string
  css?: string
  page?: PageKind
}): string {
  const page = opts.page ?? 'a4'
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(opts.title)}</title>
  <style>${BASE_CSS}${opts.css ?? ''}</style>
</head>
<body>
  <main class="qx-page qx-page--${page}">${opts.body}</main>
</body>
</html>`
}
