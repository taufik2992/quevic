// Client card template. Fully self-contained: this file owns the complete
// HTML document (shell, reset, page chrome, card styles), so the card
// preview never depends on another template's markup or CSS. It only
// reuses the pure sanitizers from documents.ts (no rendering from there).
//
// Input is the normalized ClientPreviewModel, so all trimming / address
// joining lives in buildClientPreviewModel (templateDummy.ts) and nowhere
// else.

import type {
  ClientPreviewModel,
  PreviewContactKind,
} from '#/features/clients/templates/templateDummy'
import {
  escapeHtml,
  safeImageSrc,
  safeUrl,
} from '#/features/clients/templates/documents'
import type { PageKind } from '#/features/clients/templates/documents'

export interface ClientTemplateOptions {
  /** 'type' = client type pill (form pages), 'status' = status pill (detail panel). */
  badge?: 'type' | 'status'
  /** 'a4' = printable page, 'card' = just the card (small previews). */
  layout?: PageKind
}

const ICONS: Record<PreviewContactKind | 'pin', string> = {
  email:
    '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/></svg>',
  phone:
    '<svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.9Z"/></svg>',
  website:
    '<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>',
  pin: '<svg viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
}

// Adjust keys to your ClientStatus values. Unknown statuses fall back to "neutral".
const STATUS_TONES: Record<string, { bg: string; fg: string }> = {
  active: { bg: '#dcfce7', fg: '#16a34a' },
  inactive: { bg: '#f1f5f9', fg: '#64748b' },
  lead: { bg: '#dbeafe', fg: '#2563eb' },
  prospect: { bg: '#dbeafe', fg: '#2563eb' },
}
const NEUTRAL_TONE = { bg: '#f1f5f9', fg: '#64748b' }

const CSS = `
  :root {
    --qx-ink: #0f172a;
    --qx-body: #334155;
    --qx-muted: #64748b;
    --qx-faint: #eef2f7;
    --qx-line: #e6ebf2;
    --qx-tint: #eff6ff;
    --qx-primary: #2563eb;
    --qx-primary-ink: #1d4ed8;
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

  /* Card previews render full-bleed: no page padding, no nested
     border/radius/shadow. The app wrapper (ClientPreviewCard) provides
     the rounded frame, so there is no "outside" background ring.
     A fixed 580px viewport prevents layout shifts between clients.
     Long content scrolls within the card; A4 printing is unaffected.
     Width and height match PAGE_SIZES.card in documents.ts. */
  .qx-page--card {
    width: 640px;
    padding: 0;
    background: #fff;
  }
  .qx-page--card .qx-card {
    max-width: none;
    margin: 0;
    border: 0;
    border-radius: 0;
    box-shadow: none;
    height: 580px;
    max-height: 580px;
    display: flex;
    flex-direction: column;
  }
  .qx-page--card .qx-content {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 transparent;
  }
  .qx-page--card .qx-foot {
    margin-top: auto;
  }

  .qx-card {
    position: relative;
    overflow: hidden;
    max-width: 620px;
    margin: 0 auto;
    background: #fff;
    border: 1px solid var(--qx-line);
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 18px 44px -24px rgba(37, 99, 235, 0.25);
  }

  .qx-wave { position: absolute; border-radius: 50%; pointer-events: none; }
  .qx-wave--tr1 { width: 288px; height: 288px; top: -96px; right: -96px; background: rgba(219,234,254,.7); }
  .qx-wave--tr2 { width: 192px; height: 192px; top: -40px; right: -24px; background: rgba(191,219,254,.5); }
  .qx-wave--bl1 { width: 288px; height: 288px; bottom: -112px; left: -96px; background: rgba(219,234,254,.6); }
  .qx-wave--bl2 { width: 176px; height: 176px; bottom: -56px; left: -32px; background: rgba(191,219,254,.4); }

  .qx-content { position: relative; }
  .qx-content > :last-child { margin-bottom: 0; }

  /* Uploaded and default logos share the exact same clean treatment. */
  .qx-logo {
    display: block;
    width: 72px;
    height: 72px;
    flex-shrink: 0;
    object-fit: contain;
    object-position: center;
    border: 0;
    border-radius: 0;
    background: transparent;
    padding: 0;
    box-shadow: none;
  }
  .qx-logo--default { /* Kept for backwards compatibility. */ }

  .qx-title-row { display: flex; align-items: center; flex-wrap: wrap; gap: 10px 12px; margin-top: 20px; }
  .qx-name { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.01em; line-height: 1.25; overflow-wrap: anywhere; }
  .qx-pill {
    font-size: 12px; font-weight: 600; white-space: nowrap;
    padding: 4px 10px; border-radius: 999px;
  }
  .qx-subtype { margin: 6px 0 0; font-size: 13px; color: var(--qx-muted); }

  .qx-desc { margin: 10px 0 0; font-size: 14px; line-height: 1.7; color: var(--qx-muted); overflow-wrap: anywhere; }
  .qx-divider { border: 0; border-top: 1px solid var(--qx-faint); margin: 20px 0; }

  .qx-rows { margin: 0; }
  .qx-row {
    display: flex; align-items: center; gap: 12px;
    padding: 6px 0; font-size: 14px; line-height: 1.55;
    color: var(--qx-body); overflow-wrap: anywhere;
  }
  .qx-ic {
    display: grid; place-items: center;
    width: 32px; height: 32px; flex-shrink: 0;
    border-radius: 10px;
    background: var(--qx-tint);
    color: var(--qx-primary-ink);
  }
  .qx-ic svg {
    width: 17px; height: 17px;
    fill: none; stroke: currentColor; stroke-width: 1.8;
    stroke-linecap: round; stroke-linejoin: round;
  }
  .qx-row a { color: var(--qx-primary); font-weight: 500; text-decoration: none; }

  .qx-foot {
    display: flex; align-items: flex-start; gap: 12px;
    background: #f8fafc;
    border: 1px solid #e9eef5;
    border-radius: 14px;
    padding: 14px 16px;
    font-size: 13.5px; line-height: 1.6;
    color: var(--qx-body); overflow-wrap: anywhere;
  }
  .qx-foot .qx-ic { background: #fff; border: 1px solid var(--qx-line); }
  .qx-empty { color: var(--qx-muted); }
  .qx-addr-line { display: block; }

  @page { size: A4; margin: 0; }

  @media print {
    .qx-page--a4 { width: 210mm; min-height: 297mm; }
    .qx-card { box-shadow: none; }
  }
`

function renderBadge(model: ClientPreviewModel, badge: 'type' | 'status') {
  if (badge === 'type') {
    return `<span class="qx-pill" style="background:#dcfce7;color:#16a34a">${escapeHtml(model.typeLabel)}</span>`
  }
  const tone = STATUS_TONES[String(model.status).toLowerCase()] ?? NEUTRAL_TONE
  const label = String(model.status)
  const pretty = label.charAt(0).toUpperCase() + label.slice(1)
  return `<span class="qx-pill" style="background:${tone.bg};color:${tone.fg}">${escapeHtml(pretty)}</span>`
}

function renderContact(kind: PreviewContactKind, value: string) {
  const text = escapeHtml(value)
  let inner = text
  if (kind === 'website') {
    const href = safeUrl(value)
    if (href) inner = `<a href="${href}">${text}</a>`
  }
  return `<div class="qx-row"><span class="qx-ic" aria-hidden="true">${ICONS[kind]}</span><span>${inner}</span></div>`
}

export function renderClientTemplate(
  model: ClientPreviewModel,
  { badge = 'type', layout = 'a4' }: ClientTemplateOptions = {},
): string {
  const uploadedSrc = safeImageSrc(model.logoUrl)
  const logo = uploadedSrc
    ? `<img class="qx-logo" src="${uploadedSrc}" alt="">`
    : `<img class="qx-logo qx-logo--default" src="/quevic-logo.png" alt="">`

  const contacts = model.contacts
    .map((c) => renderContact(c.kind, c.value))
    .join('')

  const address = model.addressLines.length
    ? model.addressLines
        .map((line) => `<span class="qx-addr-line">${escapeHtml(line)}</span>`)
        .join('')
    : '<span class="qx-empty">Billing address will appear here</span>'

  // One divider after the header, then a second one only when contact rows
  // exist — so an empty contact list never renders a double rule.
  const contactSection = contacts
    ? `<div class="qx-rows">${contacts}</div><hr class="qx-divider">`
    : ''

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(model.name)} — Client</title>
  <style>${CSS}</style>
</head>
<body>
  <main class="qx-page qx-page--${layout}">
    <div class="qx-card">
      <div class="qx-wave qx-wave--tr1"></div>
      <div class="qx-wave qx-wave--tr2"></div>
      <div class="qx-wave qx-wave--bl1"></div>
      <div class="qx-wave qx-wave--bl2"></div>
      <div class="qx-content">
        ${logo}
        <div class="qx-title-row">
          <h1 class="qx-name">${escapeHtml(model.name)}</h1>
          ${renderBadge(model, badge)}
        </div>
        ${badge === 'status' ? `<p class="qx-subtype">${escapeHtml(model.typeLabel)}</p>` : ''}
        ${model.description ? `<p class="qx-desc">${escapeHtml(model.description)}</p>` : ''}
        <hr class="qx-divider">
        ${contactSection}
        <div class="qx-foot">
          <span class="qx-ic" aria-hidden="true">${ICONS.pin}</span>
          <span>${address}</span>
        </div>
      </div>
    </div>
  </main>
</body>
</html>`
}
