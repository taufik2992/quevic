// Run with Node 24+: node --import tsx --test src/features/clients/templates/client-preview.test.ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  escapeHtml,
  renderDocument,
  safeImageSrc,
  safeUrl,
} from '#/features/clients/templates/documents'
import { buildClientPreviewModel } from '#/features/clients/templates/templateDummy'
import { renderClientTemplate } from '#/features/clients/templates/CardTemplate'

const input = {
  companyName: 'Acme',
  clientType: 'Company',
  status: 'Active' as const,
  email: 'billing@acme.test',
}

describe('client preview model', () => {
  it('normalizes contact details in email, phone, website order and combines the address', () => {
    assert.deepEqual(
      buildClientPreviewModel({
        ...input,
        companyName: ' acme ',
        email: ' billing@acme.test ',
        phone: ' +62 123 ',
        website: ' acme.test ',
        description: ' Notes ',
        billingAddress: ' 123 Main Street ',
        city: 'Jakarta',
        country: 'Indonesia',
        postalCode: '12345',
        logoUrl: 'https://storage.test/logo.png',
      }),
      {
        name: 'acme',
        fallbackInitial: 'A',
        typeLabel: 'Company',
        status: 'Active',
        description: 'Notes',
        logoUrl: 'https://storage.test/logo.png',
        contacts: [
          { kind: 'email', value: 'billing@acme.test' },
          { kind: 'phone', value: '+62 123' },
          { kind: 'website', value: 'acme.test' },
        ],
        addressLines: ['123 Main Street', 'Jakarta, Indonesia, 12345'],
      },
    )
  })

  it('omits blank optional values and does not create empty address lines', () => {
    const model = buildClientPreviewModel({
      ...input,
      companyName: ' ',
      email: ' ',
      phone: '\t',
      website: null,
      description: ' ',
      billingAddress: ' ',
      city: ' ',
      country: null,
    })
    assert.equal(model.name, 'Unnamed client')
    assert.equal(model.fallbackInitial, 'U')
    assert.equal(model.description, null)
    assert.equal(model.logoUrl, null)
    assert.deepEqual(model.contacts, [])
    assert.deepEqual(model.addressLines, [])
  })

  it('uses the caller fallback and joins a partial locality without empty separators', () => {
    const model = buildClientPreviewModel({
      ...input,
      companyName: '',
      nameFallback: 'New client',
      city: '',
      country: 'Indonesia',
      postalCode: '12345',
    })
    assert.equal(model.name, 'New client')
    assert.deepEqual(model.addressLines, ['Indonesia, 12345'])
  })
})

describe('preview sanitizers', () => {
  it('escapes all HTML delimiters without escaping introduced entities twice', () => {
    assert.equal(escapeHtml('&<>"\''), '&amp;&lt;&gt;&quot;&#39;')
    assert.equal(escapeHtml(''), '')
  })

  for (const value of [undefined, null, '', ' ', 'https://', 'bad host/path']) {
    it(`rejects an empty or malformed link: ${String(value)}`, () => {
      assert.equal(safeUrl(value), null)
    })
  }

  it('normalizes bare domains and escapes query strings in links', () => {
    assert.equal(
      safeUrl(' acme.test/path?a=1&b=2 '),
      'https://acme.test/path?a=1&amp;b=2',
    )
    assert.equal(safeUrl('http://acme.test'), 'http://acme.test/')
    assert.equal(safeUrl('HTTPS://ACME.TEST'), 'https://acme.test/')
  })

  // A colon-bearing string may be normalized into an https URL by safeUrl.
  // Its result must never retain an executable or non-web protocol.
  for (const value of [
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'ftp://acme.test',
    'mailto:user@acme.test',
  ]) {
    it(`never emits a non-http(s) href for ${value}`, () => {
      const href = safeUrl(value)
      assert.ok(href === null || /^https?:\/\//.test(href))
    })
  }

  for (const value of [
    'data:image/png;base64,AA==',
    'data:image/jpeg;base64,AA==',
    'data:image/webp;base64,AA==',
    'https://storage.test/logo.png',
    '/quevic-logo.png',
  ]) {
    it(`accepts supported image source ${value}`, () => {
      assert.equal(safeImageSrc(` ${value} `), value)
    })
  }
  for (const value of [
    undefined,
    null,
    '',
    'data:image/svg+xml;base64,AA==',
    'data:text/html;base64,AA==',
    'data:image/png;base64,!!!',
    '//evil.test/logo.png',
    'http://storage.test/logo.png',
    'javascript:alert(1)',
    'blob:local',
  ]) {
    it(`rejects unsafe image source ${String(value)}`, () => {
      assert.equal(safeImageSrc(value), null)
    })
  }

  it('escapes quotes and ampersands in image attributes', () => {
    assert.equal(
      safeImageSrc('https://storage.test/a?x="&y=1'),
      'https://storage.test/a?x=&quot;&amp;y=1',
    )
  })
})

describe('client HTML templates', () => {
  it('defaults to an A4 document with type badge, safe website link and supplied logo', () => {
    const html = renderClientTemplate(
      buildClientPreviewModel({
        ...input,
        website: 'acme.test',
        logoUrl: 'https://storage.test/logo.png',
        billingAddress: '123 Main Street',
      }),
    )
    assert.match(html, /^<!doctype html>/)
    assert.match(html, /<main class="qx-page qx-page--a4">/)
    assert.match(html, /<title>Acme — Client<\/title>/)
    assert.match(html, /<a href="https:\/\/acme.test\/">acme.test<\/a>/)
    assert.match(html, /src="https:\/\/storage.test\/logo.png"/)
    assert.match(html, /<span class="qx-addr-line">123 Main Street<\/span>/)
    assert.doesNotMatch(html, /<p class="qx-subtype">/)
  })

  it('uses the default logo and address placeholder with just one divider for empty contacts', () => {
    const html = renderClientTemplate(
      buildClientPreviewModel({
        ...input,
        email: '',
        logoUrl: 'data:image/svg+xml;base64,AA==',
      }),
    )
    assert.match(html, /src="\/quevic-logo.png"/)
    assert.match(html, /Billing address will appear here/)
    assert.equal(html.match(/<hr class="qx-divider">/g)?.length, 1)
    assert.doesNotMatch(html, /<div class="qx-rows">/)
    assert.doesNotMatch(html, /data:image\/svg/)
  })

  it('escapes user content in titles, text, badge and address without introducing markup', () => {
    const hostile = '<script>alert("x")</script>'
    const html = renderClientTemplate(
      buildClientPreviewModel({
        ...input,
        companyName: hostile,
        clientType: hostile,
        description: hostile,
        email: hostile,
        phone: hostile,
        billingAddress: hostile,
      }),
    )
    assert.doesNotMatch(html, /<script>/)
    assert.match(html, /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;/)
    assert.match(html, /<title>&lt;script&gt;/)
  })

  for (const [status, color] of [
    ['Active', '#16a34a'],
    ['Lead', '#2563eb'],
    ['Inactive', '#64748b'],
  ] as const) {
    it(`renders ${status} with a status badge and subtype in card layout`, () => {
      const html = renderClientTemplate(
        buildClientPreviewModel({ ...input, status }),
        { badge: 'status', layout: 'card' },
      )
      assert.match(html, /<main class="qx-page qx-page--card">/)
      assert.ok(html.includes(`color:${color}">${status}</span>`))
      assert.match(html, /<p class="qx-subtype">Company<\/p>/)
    })
  }

  it('renders malformed website text without creating a link', () => {
    const html = renderClientTemplate(
      buildClientPreviewModel({ ...input, website: 'bad host/path' }),
    )
    assert.match(html, /bad host\/path/)
    assert.doesNotMatch(html, /<a href=/)
  })

  it('renders the shared document shell with escaped title and explicit card layout', () => {
    const html = renderDocument({
      title: '<Client & Co>',
      body: '<section>Trusted body</section>',
      css: '.custom { color: red; }',
      page: 'card',
    })
    assert.match(html, /<title>&lt;Client &amp; Co&gt;<\/title>/)
    assert.match(html, /qx-page--card"><section>Trusted body<\/section>/)
    assert.match(html, /\.custom \{ color: red; \}/)
    assert.match(
      renderDocument({ title: 'Client', body: '' }),
      /<main class="qx-page qx-page--a4">/,
    )
  })
})
