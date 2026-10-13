// Node 24+: node --import tsx --experimental-test-module-mocks --test src/features/clients/storage.test.ts
import assert from 'node:assert/strict'
import { after, beforeEach, describe, it, mock } from 'node:test'
import { MAX_LOGO_SIZE } from '#/features/clients/client.constants'

class Command {
  constructor(readonly input: Record<string, unknown>) {}
}
class PutObjectCommand extends Command {}
class DeleteObjectCommand extends Command {}
class GetObjectCommand extends Command {}
const send = mock.fn(async (_command: Command) => ({}))
const configurations: Record<string, unknown>[] = []
class S3Client {
  constructor(config: Record<string, unknown>) {
    configurations.push(config)
  }
  send = send
}
const sign = mock.fn(
  async (
    _client: S3Client,
    _command: Command,
    _options: { expiresIn: number },
  ) => 'https://storage.test/signed',
)
const modules = [
  mock.module('@aws-sdk/client-s3', {
    namedExports: {
      S3Client,
      PutObjectCommand,
      DeleteObjectCommand,
      GetObjectCommand,
    },
  }),
  mock.module('@aws-sdk/s3-request-presigner', {
    namedExports: { getSignedUrl: sign },
  }),
]
const {
  buildLogoKey,
  getStorageConfig,
  isStorageConfigured,
  uploadClientLogo,
  deleteClientLogo,
  getClientLogoUrl,
} = await import('#/features/clients/storage')

const environment = {
  S3_ENDPOINT: 'https://storage.test',
  S3_BUCKET: 'unit-test-bucket',
  S3_ACCESS_KEY_ID: 'synthetic-key',
  S3_SECRET_ACCESS_KEY: 'synthetic-secret',
  S3_REGION: 'unit-test-region',
}
const originalEnvironment = Object.fromEntries(
  Object.keys(environment).map((key) => [key, process.env[key]]),
)
after(() => {
  for (const [key, value] of Object.entries(originalEnvironment)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
  modules.forEach((module) => module.restore())
})
beforeEach(() => {
  Object.assign(process.env, environment)
  send.mock.resetCalls()
  send.mock.mockImplementation(async () => ({}))
  sign.mock.resetCalls()
})

describe('storage configuration and safe object keys', () => {
  it('reads complete configuration and defaults the region to auto', () => {
    assert.deepEqual(getStorageConfig(), {
      endpoint: environment.S3_ENDPOINT,
      bucket: environment.S3_BUCKET,
      accessKeyId: environment.S3_ACCESS_KEY_ID,
      secretAccessKey: environment.S3_SECRET_ACCESS_KEY,
      region: environment.S3_REGION,
    })
    assert.equal(isStorageConfigured(), true)
    delete process.env.S3_REGION
    assert.equal(getStorageConfig().region, 'auto')
  })

  for (const key of [
    'S3_ENDPOINT',
    'S3_BUCKET',
    'S3_ACCESS_KEY_ID',
    'S3_SECRET_ACCESS_KEY',
  ]) {
    for (const value of [undefined, '']) {
      it(`rejects ${key} when ${value === undefined ? 'missing' : 'empty'}`, () => {
        if (value === undefined) delete process.env[key]
        else process.env[key] = value
        assert.throws(getStorageConfig, /Client logo storage is not configured/)
        assert.equal(isStorageConfigured(), false)
      })
    }
  }

  for (const [mime, extension] of [
    ['image/png', 'png'],
    ['image/jpeg', 'jpg'],
    ['image/webp', 'webp'],
  ] as const) {
    it(`creates an owner-scoped ${extension} key`, () => {
      assert.equal(
        buildLogoKey('Owner_1-x', 'Client_2-y', mime),
        `clients/Owner_1-x/Client_2-y.${extension}`,
      )
    })
  }

  for (const value of [
    '',
    '../other',
    'a/b',
    'a\\b',
    'a.b',
    'a b',
    'a%2fb',
    'a\n',
    'é',
  ]) {
    it(`rejects unsafe owner and client ids: ${JSON.stringify(value)}`, () => {
      assert.throws(
        () => buildLogoKey(value, 'client', 'image/png'),
        /Invalid ownerId/,
      )
      assert.throws(
        () => buildLogoKey('owner', value, 'image/png'),
        /Invalid clientId/,
      )
    })
  }
})

describe('logo storage operations', () => {
  it('uploads bytes with content metadata and configures path-style S3 access', async () => {
    const bytes = Uint8Array.from([0, 1, 255])
    assert.deepEqual(
      await uploadClientLogo({
        ownerId: 'owner',
        clientId: 'client',
        bytes,
        mime: 'image/jpeg',
      }),
      { key: 'clients/owner/client.jpg', mime: 'image/jpeg', size: 3 },
    )
    const command = send.mock.calls[0].arguments[0]
    assert.ok(command instanceof PutObjectCommand)
    assert.deepEqual(command.input, {
      Bucket: environment.S3_BUCKET,
      Key: 'clients/owner/client.jpg',
      Body: Buffer.from(bytes),
      ContentType: 'image/jpeg',
      ContentLength: 3,
    })
    assert.deepEqual(configurations[0], {
      region: environment.S3_REGION,
      endpoint: environment.S3_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: environment.S3_ACCESS_KEY_ID,
        secretAccessKey: environment.S3_SECRET_ACCESS_KEY,
      },
    })
  })

  it('accepts exactly 2 MB', async () => {
    const result = await uploadClientLogo({
      ownerId: 'owner',
      clientId: 'client',
      bytes: new Uint8Array(MAX_LOGO_SIZE),
      mime: 'image/png',
    })
    assert.equal(result.size, MAX_LOGO_SIZE)
    assert.equal(
      send.mock.calls[0].arguments[0].input.ContentLength,
      MAX_LOGO_SIZE,
    )
  })

  for (const [size, message] of [
    [0, /Logo file is empty/],
    [MAX_LOGO_SIZE + 1, /at most 2 MB/],
  ] as const) {
    it(`rejects ${size} bytes without sending an upload`, async () => {
      await assert.rejects(
        () =>
          uploadClientLogo({
            ownerId: 'owner',
            clientId: 'client',
            bytes: new Uint8Array(size),
            mime: 'image/png',
          }),
        message,
      )
      assert.equal(send.mock.callCount(), 0)
    })
  }

  it('rejects path traversal before sending an upload', async () => {
    await assert.rejects(
      () =>
        uploadClientLogo({
          ownerId: '../owner',
          clientId: 'client',
          bytes: Uint8Array.of(1),
          mime: 'image/png',
        }),
      /Invalid ownerId/,
    )
    assert.equal(send.mock.callCount(), 0)
  })

  it('propagates an upload failure', async () => {
    const error = new Error('Storage unavailable')
    send.mock.mockImplementation(async () => {
      throw error
    })
    await assert.rejects(
      () =>
        uploadClientLogo({
          ownerId: 'owner',
          clientId: 'client',
          bytes: Uint8Array.of(1),
          mime: 'image/png',
        }),
      (actual) => actual === error,
    )
  })

  it('deletes the requested key from the configured bucket', async () => {
    await deleteClientLogo('clients/owner/client.png')
    const command = send.mock.calls[0].arguments[0]
    assert.ok(command instanceof DeleteObjectCommand)
    assert.deepEqual(command.input, {
      Bucket: environment.S3_BUCKET,
      Key: 'clients/owner/client.png',
    })
  })

  for (const name of ['NoSuchKey', 'NotFound']) {
    it(`treats ${name} as an idempotent delete`, async () => {
      send.mock.mockImplementation(async () => {
        throw Object.assign(new Error('Missing'), { name })
      })
      await assert.doesNotReject(() => deleteClientLogo('missing.png'))
    })
  }

  for (const error of [
    Object.assign(new Error('Denied'), { name: 'AccessDenied' }),
    { name: 'NotFound' },
  ]) {
    it(`propagates unexpected deletion failure: ${String(error)}`, async () => {
      send.mock.mockImplementation(async () => {
        throw error
      })
      await assert.rejects(
        () => deleteClientLogo('logo.png'),
        (actual) => actual === error,
      )
    })
  }

  for (const expiresIn of [undefined, 90]) {
    it(`signs a GET with ${expiresIn ?? 3600} seconds of validity`, async () => {
      assert.equal(
        await getClientLogoUrl('logo.png', expiresIn),
        'https://storage.test/signed',
      )
      const [, command, options] = sign.mock.calls[0].arguments
      assert.ok(command instanceof GetObjectCommand)
      assert.deepEqual(command.input, {
        Bucket: environment.S3_BUCKET,
        Key: 'logo.png',
      })
      assert.deepEqual(options, { expiresIn: expiresIn ?? 3600 })
    })
  }
})
