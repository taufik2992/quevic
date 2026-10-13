// Run with Node 24+: node --import tsx --test src/features/clients/client.schema.test.ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  clientIdSchema,
  clientSortSchema,
  clientStatusSchema,
  clientTypeSchema,
  createClientDefaultValues,
  createClientSchema,
  defaultClientsSearch,
  listClientsQuerySchema,
  logoInputSchema,
  updateClientSchema,
} from '#/features/clients/client.schema'
import {
  ALLOWED_LOGO_MIME,
  MAX_LOGO_BASE64_LENGTH,
  isAllowedLogoMime,
} from '#/features/clients/client.constants'

const validClient = {
  companyName: 'Acme',
  email: 'billing@acme.test',
  billingAddress: '123 Main Street',
  contactName: 'Jane Doe',
}

describe('client input validation', () => {
  it('normalizes required fields and applies create defaults', () => {
    assert.deepEqual(
      createClientSchema.parse({
        companyName: ' Acme ',
        email: ' BILLING@ACME.TEST ',
        billingAddress: ' 123 Main Street ',
        contactName: ' Jane Doe ',
        ownerId: 'untrusted-owner',
      }),
      {
        ...validClient,
        clientType: 'Company',
        country: 'Indonesia',
        status: 'Active',
      },
    )
  })

  for (const field of [
    'companyName',
    'email',
    'billingAddress',
    'contactName',
    'country',
  ]) {
    it(`rejects blank ${field}`, () => {
      assert.equal(
        createClientSchema.safeParse({ ...validClient, [field]: ' \t\n ' })
          .success,
        false,
      )
    })
  }

  const optionalFields = [
    'phone',
    'website',
    'description',
    'province',
    'city',
    'postalCode',
    'contactPosition',
    'contactEmail',
    'contactPhone',
  ] as const
  for (const field of optionalFields) {
    it(`accepts omitted ${field} and normalizes blank ${field}`, () => {
      assert.equal(createClientSchema.parse(validClient)[field], undefined)
      assert.equal(
        createClientSchema.parse({ ...validClient, [field]: '  ' })[field],
        undefined,
      )
      assert.equal(
        createClientSchema.safeParse({ ...validClient, [field]: null }).success,
        false,
      )
    })
  }

  const limits = {
    companyName: 120,
    phone: 32,
    description: 2000,
    billingAddress: 1000,
    country: 100,
    province: 100,
    city: 100,
    postalCode: 20,
    contactName: 120,
    contactPosition: 120,
    contactPhone: 32,
  }
  for (const [field, max] of Object.entries(limits)) {
    it(`enforces the ${field} length boundary after trimming`, () => {
      assert.equal(
        createClientSchema.safeParse({
          ...validClient,
          [field]: ` ${'a'.repeat(max)} `,
        }).success,
        true,
      )
      assert.equal(
        createClientSchema.safeParse({
          ...validClient,
          [field]: 'a'.repeat(max + 1),
        }).success,
        false,
      )
    })
  }

  for (const email of [
    'invalid',
    'user@',
    '@acme.test',
    'user name@acme.test',
  ]) {
    it(`rejects malformed primary and contact email: ${email}`, () => {
      for (const field of ['email', 'contactEmail']) {
        assert.equal(
          createClientSchema.safeParse({ ...validClient, [field]: email })
            .success,
          false,
        )
      }
    })
  }

  it('trims optional email and text values without dropping populated fields', () => {
    const parsed = createClientSchema.parse({
      ...validClient,
      phone: ' +62 123 ',
      contactEmail: ' jane@acme.test ',
      description: ' Notes ',
    })
    assert.equal(parsed.phone, '+62 123')
    assert.equal(parsed.contactEmail, 'jane@acme.test')
    assert.equal(parsed.description, 'Notes')
  })

  for (const website of [
    'acme.test',
    'https://acme.test/path?q=1',
    'http://sub.acme.test',
  ]) {
    it(`accepts website ${website}`, () => {
      assert.equal(
        createClientSchema.parse({ ...validClient, website: ` ${website} ` })
          .website,
        website,
      )
    })
  }
  for (const website of [
    'localhost',
    'javascript:alert(1)',
    'ftp://acme.test',
    'https://acme.test/a b',
  ]) {
    it(`rejects website ${website}`, () => {
      assert.equal(
        createClientSchema.safeParse({ ...validClient, website }).success,
        false,
      )
    })
  }

  it('requires an id for updates and defaults logo removal to false', () => {
    assert.equal(updateClientSchema.safeParse(validClient).success, false)
    assert.equal(
      updateClientSchema.safeParse({ ...validClient, id: '' }).success,
      false,
    )
    assert.equal(
      updateClientSchema.parse({ ...validClient, id: 'client-1' }).removeLogo,
      false,
    )
    assert.equal(
      updateClientSchema.parse({
        ...validClient,
        id: 'client-1',
        removeLogo: true,
      }).removeLogo,
      true,
    )
    assert.equal(
      updateClientSchema.safeParse({
        ...validClient,
        id: 'client-1',
        removeLogo: 'true',
      }).success,
      false,
    )
    assert.equal(clientIdSchema.safeParse('').success, false)
  })

  it('keeps the empty form invalid until required fields are filled', () => {
    assert.equal(
      createClientSchema.safeParse(createClientDefaultValues).success,
      false,
    )
    assert.equal(
      createClientSchema.safeParse({
        ...createClientDefaultValues,
        ...validClient,
      }).success,
      true,
    )
  })

  for (const [schema, accepted] of [
    [clientTypeSchema, ['Company', 'Individual']],
    [clientStatusSchema, ['Active', 'Lead', 'Inactive']],
    [clientSortSchema, ['newest', 'oldest', 'name', 'spent']],
  ] as const) {
    it(`accepts only declared values: ${accepted.join(', ')}`, () => {
      for (const value of accepted)
        assert.equal(schema.safeParse(value).success, true)
      for (const value of ['', 'unknown', accepted[0].toUpperCase()]) {
        assert.equal(schema.safeParse(value).success, false)
      }
    })
  }
})

describe('list query validation', () => {
  it('uses the same defaults as route search', () => {
    assert.deepEqual(listClientsQuerySchema.parse({}), defaultClientsSearch)
  })

  it('coerces URL pagination values and trims search', () => {
    assert.deepEqual(
      listClientsQuerySchema.parse({
        search: ' Acme ',
        status: 'Lead',
        sort: 'name',
        page: '2',
        pageSize: '50',
      }),
      { search: 'Acme', status: 'Lead', sort: 'name', page: 2, pageSize: 50 },
    )
  })

  for (const [field, values] of [
    ['page', [0, -1, 1.5, 'invalid', null]],
    ['pageSize', [0, -1, 1.5, 51, 'invalid', null]],
  ] as const) {
    for (const value of values) {
      it(`rejects ${field}=${String(value)}`, () => {
        assert.equal(
          listClientsQuerySchema.safeParse({ [field]: value }).success,
          false,
        )
      })
    }
  }

  it('bounds search length and accepts the smallest page size', () => {
    assert.equal(
      listClientsQuerySchema.safeParse({ search: 'a'.repeat(100), pageSize: 1 })
        .success,
      true,
    )
    assert.equal(
      listClientsQuerySchema.safeParse({ search: 'a'.repeat(101) }).success,
      false,
    )
  })
})

describe('logo input constraints', () => {
  for (const mime of ALLOWED_LOGO_MIME) {
    it(`accepts ${mime}`, () => {
      assert.equal(isAllowedLogoMime(mime), true)
      assert.deepEqual(logoInputSchema.parse({ data: 'AA==', mime }), {
        data: 'AA==',
        mime,
      })
    })
  }

  for (const mime of [
    'image/svg+xml',
    'image/gif',
    'text/plain',
    'IMAGE/PNG',
    '',
  ]) {
    it(`rejects unsupported MIME ${mime}`, () => {
      assert.equal(isAllowedLogoMime(mime), false)
      assert.equal(
        logoInputSchema.safeParse({ data: 'AA==', mime }).success,
        false,
      )
    })
  }

  it('rejects empty data and enforces the encoded length boundary', () => {
    assert.equal(
      logoInputSchema.safeParse({ data: '', mime: 'image/png' }).success,
      false,
    )
    assert.equal(
      logoInputSchema.safeParse({
        data: 'A'.repeat(MAX_LOGO_BASE64_LENGTH),
        mime: 'image/png',
      }).success,
      true,
    )
    assert.equal(
      logoInputSchema.safeParse({
        data: 'A'.repeat(MAX_LOGO_BASE64_LENGTH + 1),
        mime: 'image/png',
      }).success,
      false,
    )
  })
})
