import { S3Client } from '@aws-sdk/client-s3'

interface StorageConfig {
  endpoint: string
  bucket: string
  accessKeyId: string
  secretAccessKey: string
  region: string
}

export function getStorageConfig(): StorageConfig {
  const endpoint = process.env.S3_ENDPOINT
  const bucket = process.env.S3_BUCKET
  const accessKeyId = process.env.S3_ACCESS_KEY_ID
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY

  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'Client logo storage is not configured. Add S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY to .env.local (values come from `prisma bucket key create <bucket-id>`).',
    )
  }

  return {
    endpoint,
    bucket,
    accessKeyId,
    secretAccessKey,
    region: process.env.S3_REGION ?? 'auto',
  }
}

let s3: S3Client | null = null

export function getS3Client(): { client: S3Client; bucket: string } {
  const config = getStorageConfig()
  if (!s3) {
    s3 = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    })
  }
  return { client: s3, bucket: config.bucket }
}
