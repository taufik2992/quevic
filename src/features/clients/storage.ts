import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import {
  LOGO_MIME_TO_EXT,
  MAX_LOGO_SIZE,
} from '#/features/clients/client.constants'
import type { AllowedLogoMime } from '#/features/clients/client.constants'
import { getS3Client, getStorageConfig } from '#/integrations/s3/storage'

export {
  isAllowedLogoMime,
  MAX_LOGO_SIZE,
} from '#/features/clients/client.constants'
export type { AllowedLogoMime } from '#/features/clients/client.constants'

// Server-only: never import this module from client components.
// It reads secret bucket credentials from process.env.
if (typeof window !== 'undefined') {
  throw new Error('clients/storage must only be used on the server')
}

function assertSafeId(value: string, label: string) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error(`Invalid ${label} for logo storage key`)
  }
}

export function buildLogoKey(
  ownerId: string,
  clientId: string,
  mime: AllowedLogoMime,
): string {
  assertSafeId(ownerId, 'ownerId')
  assertSafeId(clientId, 'clientId')
  return `clients/${ownerId}/${clientId}.${LOGO_MIME_TO_EXT[mime]}`
}

export function isStorageConfigured(): boolean {
  try {
    getStorageConfig()
    return true
  } catch {
    return false
  }
}

interface UploadLogoInput {
  ownerId: string
  clientId: string
  bytes: Uint8Array
  mime: AllowedLogoMime
}

export async function uploadClientLogo(input: UploadLogoInput) {
  const { client, bucket } = getS3Client()

  if (input.bytes.byteLength === 0) {
    throw new Error('Logo file is empty')
  }
  if (input.bytes.byteLength > MAX_LOGO_SIZE) {
    throw new Error('Logo file must be at most 2 MB')
  }

  const key = buildLogoKey(input.ownerId, input.clientId, input.mime)
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: Buffer.from(input.bytes),
      ContentType: input.mime,
      ContentLength: input.bytes.byteLength,
    }),
  )
  return { key, mime: input.mime, size: input.bytes.byteLength }
}

export async function deleteClientLogo(key: string) {
  const { client, bucket } = getS3Client()
  try {
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === 'NoSuchKey' || error.name === 'NotFound')
    ) {
      return
    }
    throw error
  }
}

export async function getClientLogoUrl(key: string, expiresIn = 3600) {
  const { client, bucket } = getS3Client()
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn },
  )
}
