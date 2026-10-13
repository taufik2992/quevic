// Node 24+: node --import tsx --test src/features/clients/components/client-display.test.tsx
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { ClientAvatar } from '#/features/clients/components/ClientAvatar'
import { ClientStats } from '#/features/clients/components/ClientStats'
import { ClientStatusBadge } from '#/features/clients/components/ClientStatusBadge'
import { ClientCell } from '#/components/data-table/client-cell'

describe('client avatars and table cells', () => {
  it('renders an uploaded logo with a decorative alt and the requested size', () => {
    const html = renderToStaticMarkup(
      <ClientAvatar
        name="Acme"
        logoUrl="https://storage.test/logo.png"
        size="xs"
        className="custom-avatar"
      />,
    )
    assert.match(html, /<img[^>]+src="https:\/\/storage.test\/logo.png"/)
    assert.match(html, /alt=""/)
    assert.match(html, /size-6/)
    assert.match(html, /custom-avatar/)
    assert.doesNotMatch(html, /logo placeholder/)
  })

  for (const logoUrl of [undefined, null, '']) {
    it(`renders the named default logo for ${String(logoUrl)}`, () => {
      const html = renderToStaticMarkup(
        <ClientAvatar name="Acme & Co" logoUrl={logoUrl} />,
      )
      assert.match(html, /src="\/quevic-logo.png"/)
      assert.match(html, /alt="Acme &amp; Co logo placeholder"/)
      assert.match(html, /size-10/)
    })
  }

  it('renders a cell logo in place of initials while keeping the client name', () => {
    const html = renderToStaticMarkup(
      <ClientCell
        initials="AC"
        tone="bg-primary"
        name="Acme"
        imageUrl="https://storage.test/logo.png"
      />,
    )
    assert.match(html, /<img[^>]+alt=""/)
    assert.match(html, />Acme<\/span>/)
    assert.doesNotMatch(html, />AC<\/span>/)
  })

  it('retains initials when a cell has no logo', () => {
    const html = renderToStaticMarkup(
      <ClientCell
        initials="AC"
        tone="bg-primary"
        name="Acme"
        imageUrl={null}
      />,
    )
    assert.match(html, />AC<\/span>/)
    assert.match(html, /bg-primary/)
    assert.doesNotMatch(html, /<img/)
  })
})

describe('client status and statistics display', () => {
  for (const [status, tone] of [
    ['Active', 'text-success'],
    ['Lead', 'text-primary'],
    ['Inactive', 'text-warning'],
  ] as const) {
    it(`labels ${status} with its status tone`, () => {
      const html = renderToStaticMarkup(<ClientStatusBadge status={status} />)
      assert.ok(html.includes(tone))
      assert.ok(html.includes(`>${status}</span>`))
    })
  }

  it('displays totals and positive, negative and zero month changes', () => {
    const html = renderToStaticMarkup(
      <ClientStats
        stats={{
          total: 10,
          totalNewThisMonth: 4,
          active: 7,
          activeDeltaPct: 25,
          newClients: 4,
          newDeltaPct: -50,
          inactive: 1,
          inactiveDeltaPct: 0,
          lastMonthTotal: 6,
        }}
      />,
    )
    for (const label of [
      'Total Clients',
      'Active Clients',
      'New Clients',
      'Inactive Clients',
    ])
      assert.ok(html.includes(label))
    assert.match(html, /aria-label="Client statistics"/)
    assert.match(html, /4 this month/)
    assert.match(html, /25% from last month/)
    assert.match(html, /50% from last month/)
    assert.match(html, /0% from last month/)
    assert.doesNotMatch(html, /-50%/)
  })

  it('handles zero clients and missing comparison data without NaN or infinite values', () => {
    const html = renderToStaticMarkup(
      <ClientStats
        stats={{
          total: 0,
          totalNewThisMonth: 0,
          active: 0,
          activeDeltaPct: null,
          newClients: 0,
          newDeltaPct: null,
          inactive: 0,
          inactiveDeltaPct: null,
          lastMonthTotal: 0,
        }}
      />,
    )
    assert.equal(html.match(/No change yet/g)?.length, 3)
    assert.match(html, /0 this month/)
    assert.doesNotMatch(html, /NaN|Infinity/)
  })
})
