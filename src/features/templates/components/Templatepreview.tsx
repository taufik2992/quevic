import { useDeferredValue, useEffect, useRef, useState } from 'react'
import { PAGE_SIZES, type PageKind } from '../data/documents'

// Generic preview for any HTML template string (client, invoice, proposal).
// The iframe renders at the template's real pixel width and is scaled down
// to fit its container, so what you see is what the PDF will look like.
//
// Both card and A4 previews use a stable viewport. Card overflow scrolls
// inside the iframe instead of resizing surrounding layout.
export function TemplatePreview({
  html,
  page = 'a4',
  title = 'Preview',
  className,
}: {
  html: string
  page?: PageKind
  title?: string
  className?: string
}) {
  const { width, height: fallbackHeight } = PAGE_SIZES[page]
  const wrapRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const deferredHtml = useDeferredValue(html)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const update = () => setScale(Math.min(1, el.clientWidth / width))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [width])

  return (
    <div
      ref={wrapRef}
      className={className ?? 'w-full overflow-hidden rounded-xl'}
      style={{
        height: Math.ceil(fallbackHeight * scale),
      }}
    >
      <iframe
        title={title}
        srcDoc={deferredHtml}
        // allow-same-origin without allow-scripts: template HTML stays
        // scriptless, but the parent may measure its height so no gap remains.
        sandbox="allow-same-origin"
        style={{
          width,
          height: fallbackHeight,
          border: 0,
          display: 'block',
          overflow: page === 'card' ? 'auto' : 'hidden',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      />
    </div>
  )
}
